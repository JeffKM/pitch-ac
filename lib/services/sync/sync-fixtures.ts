import "server-only";

import {
  getFixturesByRound,
  getSeasonRounds,
  getTeamScheduleFixtures,
} from "@/lib/api/sportmonks";
import { MCITY_TEAM_ID, PL_LEAGUE_ID } from "@/lib/api/sportmonks/constants";
import {
  mapSmFixtureToFixture,
  mapSmTeamToTeam,
} from "@/lib/api/sportmonks/mappers";
import type { SmFixtureParticipant } from "@/lib/api/sportmonks/types";
import { createAdminClient } from "@/lib/supabase/admin";

import { fixtureToDbRow, teamToDbRow } from "./db-mappers";
import {
  assignGameweek,
  assignGameweekByAnchors,
  buildGameweekRanges,
  type McityPlAnchor,
} from "./gameweek-assigner";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";

/**
 * 시즌 전체 경기 동기화
 * getSeasonFixtures의 season/league 필터가 Starter 플랜 미지원 →
 * getSeasonRounds(38라운드) → getFixturesByRound 방식으로 대체
 * 총 API 요청: 1(라운드 목록) + 38(라운드별 경기) = 39 요청
 */
export async function syncFixtures(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;
  const seenTeamIds = new Set<number>();

  try {
    // DB에서 POSTP 상태인 fixture ID 조회 (수동 설정 보존용)
    const { data: postpRows } = await supabase
      .from("fixtures")
      .select("id")
      .eq("status", "POSTP");
    const postpIds = new Set((postpRows ?? []).map((r) => r.id));

    const rounds = await getSeasonRounds();

    for (const round of rounds) {
      const fixtures = await getFixturesByRound(round.id);

      // participants에서 팀 정보 추출 → 누락 팀 upsert
      const newParticipants: SmFixtureParticipant[] = [];
      for (const raw of fixtures) {
        for (const p of raw.participants ?? []) {
          if (!seenTeamIds.has(p.id)) {
            seenTeamIds.add(p.id);
            newParticipants.push(p);
          }
        }
      }

      if (newParticipants.length > 0) {
        const teamRows = newParticipants.map((p) =>
          teamToDbRow(mapSmTeamToTeam(p, SEASON_LABEL)),
        );
        const { error: teamError } = await supabase
          .from("teams")
          .upsert(teamRows, { onConflict: "id" });
        if (teamError) throw teamError;
      }

      // 경기 upsert (PL 동기화이므로 gameweek null인 경기 제외)
      // DB에서 POSTP인 경기는 API가 NS를 반환해도 POSTP 유지
      const fixtureRows = fixtures
        .map((raw) => {
          const fixture = mapSmFixtureToFixture(raw);
          if (fixture.gameweek === null || fixture.gameweek === 0) return null;
          const row = fixtureToDbRow(fixture);
          if (postpIds.has(fixture.id) && fixture.status === "NS") {
            row.status = "POSTP";
            row.home_score = null;
            row.away_score = null;
          }
          return row;
        })
        .filter(Boolean);

      if (fixtureRows.length > 0) {
        const { error } = await supabase
          .from("fixtures")
          .upsert(fixtureRows, { onConflict: "id" });
        if (error) throw error;
        totalSynced += fixtureRows.length;
      }
    }

    const result: SyncResult = {
      entity: "fixtures",
      status: "success",
      recordsSynced: totalSynced,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: "fixtures",
      status: "error",
      recordsSynced: totalSynced,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}

/**
 * 맨시티 컵 대회 경기 동기화
 * /football/schedules/teams/{teamId} 엔드포인트 사용
 * - between 엔드포인트와 달리 EFL Cup(Carabao Cup) 포함 전 대회 반환
 * - 날짜 범위 제한 없음 (시즌 전체 스케줄 한 번에 조회)
 * getTeamScheduleFixtures → assignGameweek → DB upsert
 */
export async function syncCupFixtures(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;

  try {
    // 1) DB에서 맨시티 PL 경기 조회 → 앵커 빌드
    const { data: plRows } = await supabase
      .from("fixtures")
      .select("gameweek, date")
      .eq("league_id", PL_LEAGUE_ID)
      .or(`home_team_id.eq.${MCITY_TEAM_ID},away_team_id.eq.${MCITY_TEAM_ID}`)
      .not("gameweek", "is", null)
      .order("gameweek");

    const anchors: McityPlAnchor[] = (plRows ?? []).map((r) => ({
      gameweek: r.gameweek as number,
      date: new Date(r.date),
    }));

    // 2) 앵커가 없으면 기존 라운드 기반 fallback
    let fallbackRanges: ReturnType<typeof buildGameweekRanges> = [];
    if (anchors.length === 0) {
      const rounds = await getSeasonRounds();
      fallbackRanges = buildGameweekRanges(rounds);
      if (fallbackRanges.length === 0) {
        return {
          entity: "cup-fixtures",
          status: "success",
          recordsSynced: 0,
        };
      }
    }

    // schedules 엔드포인트로 전 대회 컵 경기 조회 (EFL Cup 포함)
    const rawFixtures = await getTeamScheduleFixtures(MCITY_TEAM_ID);

    // 맨시티 참가 경기만 필터 (스케줄에 타팀 경기가 포함될 수 있음)
    const mcityFixtures = rawFixtures.filter((f) =>
      f.participants?.some((p) => p.id === MCITY_TEAM_ID),
    );

    // 팀 정보 upsert
    const seenTeamIds = new Set<number>();
    const newParticipants: SmFixtureParticipant[] = [];
    for (const raw of mcityFixtures) {
      for (const p of raw.participants ?? []) {
        if (!seenTeamIds.has(p.id)) {
          seenTeamIds.add(p.id);
          newParticipants.push(p);
        }
      }
    }

    if (newParticipants.length > 0) {
      const teamRows = newParticipants.map((p) =>
        teamToDbRow(mapSmTeamToTeam(p, SEASON_LABEL)),
      );
      const { error: teamError } = await supabase
        .from("teams")
        .upsert(teamRows, { onConflict: "id" });
      if (teamError) throw teamError;
    }

    // 경기 매핑 + GW 할당 + DB upsert
    const fixtureRows = mcityFixtures
      .map((raw) => {
        const fixture = mapSmFixtureToFixture(raw);
        // 앵커 기반 우선, fallback으로 라운드 midpoint 기반
        const gw =
          anchors.length > 0
            ? assignGameweekByAnchors(fixture.date, anchors)
            : assignGameweek(fixture.date, fallbackRanges);
        return fixtureToDbRow({ ...fixture, gameweek: gw });
      })
      .filter(Boolean);

    if (fixtureRows.length > 0) {
      const { error } = await supabase
        .from("fixtures")
        .upsert(fixtureRows, { onConflict: "id" });
      if (error) throw error;
      totalSynced = fixtureRows.length;
    }

    const result: SyncResult = {
      entity: "cup-fixtures",
      status: "success",
      recordsSynced: totalSynced,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: "cup-fixtures",
      status: "error",
      recordsSynced: totalSynced,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}
