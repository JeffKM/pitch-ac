import "server-only";

import {
  getCupFixturesByTeam,
  getFixturesByRound,
  getSeasonRounds,
} from "@/lib/api/sportmonks";
import { MCITY_TEAM_ID } from "@/lib/api/sportmonks/constants";
import {
  mapSmFixtureToFixture,
  mapSmTeamToTeam,
} from "@/lib/api/sportmonks/mappers";
import type { SmFixtureParticipant } from "@/lib/api/sportmonks/types";
import { createAdminClient } from "@/lib/supabase/admin";

import { fixtureToDbRow, teamToDbRow } from "./db-mappers";
import { assignGameweek, buildGameweekRanges } from "./gameweek-assigner";
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
      const fixtureRows = fixtures
        .map((raw) => {
          const fixture = mapSmFixtureToFixture(raw);
          if (fixture.gameweek === null || fixture.gameweek === 0) return null;
          return fixtureToDbRow(fixture);
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
 * 시즌 날짜 범위 내 비-PL 경기를 조회하여 가장 가까운 PL GW에 할당
 * getCupFixturesByTeam → assignGameweek → DB upsert
 */
export async function syncCupFixtures(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;

  try {
    // PL 라운드 목록 → GW 날짜 범위 생성
    const rounds = await getSeasonRounds();
    const gwRanges = buildGameweekRanges(rounds);

    // 시즌 범위 계산 (첫 GW 시작 ~ 마지막 GW 종료)
    if (gwRanges.length === 0) {
      return {
        entity: "cup-fixtures",
        status: "success",
        recordsSynced: 0,
      };
    }

    const seasonStart = gwRanges[0].start.toISOString().split("T")[0];
    const seasonEnd = gwRanges[gwRanges.length - 1].end
      .toISOString()
      .split("T")[0];

    // 컵 경기 조회
    const rawFixtures = await getCupFixturesByTeam(
      MCITY_TEAM_ID,
      seasonStart,
      seasonEnd,
    );

    // 팀 정보 upsert
    const seenTeamIds = new Set<number>();
    const newParticipants: SmFixtureParticipant[] = [];
    for (const raw of rawFixtures) {
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
    const fixtureRows = rawFixtures
      .map((raw) => {
        const fixture = mapSmFixtureToFixture(raw);
        // 컵 경기에 가장 가까운 PL GW 할당
        const gw = assignGameweek(fixture.date, gwRanges);
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
