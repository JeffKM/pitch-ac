import "server-only";

import {
  getAllSeasonFixtures,
  getTeamFixtures,
  mapAfFixtureToFixture,
} from "@/lib/api/api-football";
import type { AfFixture } from "@/lib/api/api-football/types";
import { MCITY_TEAM_ID, PL_LEAGUE_ID } from "@/lib/constants/football";
import { createAdminClient } from "@/lib/supabase/admin";

import { fixtureToDbRow, teamToDbRow } from "./db-mappers";
import {
  assignGameweekByAnchors,
  type McityPlAnchor,
} from "./gameweek-assigner";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";

/**
 * 시즌 전체 PL 경기 동기화
 * API-Football: getAllSeasonFixtures() 1요청으로 380경기 전체 조회
 * SportMonks 대비 39→1 요청으로 대폭 최적화
 */
export async function syncFixtures(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;

  try {
    // DB에서 POSTP 상태인 fixture ID 조회 (수동 설정 보존용)
    const { data: postpRows } = await supabase
      .from("fixtures")
      .select("id")
      .eq("status", "POSTP");
    const postpIds = new Set((postpRows ?? []).map((r) => r.id));

    const allFixtures = await getAllSeasonFixtures();

    // 팀 정보 upsert — fixtures에서 추출
    const seenTeamIds = new Set<number>();
    const teamRows: ReturnType<typeof teamToDbRow>[] = [];
    for (const raw of allFixtures) {
      for (const teamRef of [raw.teams.home, raw.teams.away]) {
        if (!seenTeamIds.has(teamRef.id)) {
          seenTeamIds.add(teamRef.id);
          teamRows.push(
            teamToDbRow({
              id: teamRef.id,
              name: teamRef.name,
              shortName: teamRef.name.substring(0, 3).toUpperCase(),
              logoUrl: teamRef.logo,
              season: SEASON_LABEL,
            }),
          );
        }
      }
    }

    if (teamRows.length > 0) {
      const { error: teamError } = await supabase
        .from("teams")
        .upsert(teamRows, { onConflict: "id" });
      if (teamError) throw teamError;
    }

    // 경기 upsert
    const fixtureRows = allFixtures
      .map((raw) => {
        const fixture = mapAfFixtureToFixture(raw);
        if (fixture.gameweek === null || fixture.gameweek === 0) return null;
        const row = fixtureToDbRow(fixture);
        // DB에서 POSTP인 경기는 API가 NS를 반환해도 POSTP 유지
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
      totalSynced = fixtureRows.length;
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
 * getTeamFixtures(MCITY_TEAM_ID) 1요청으로 전 대회 경기 조회
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

    // 2) 팀 전체 경기 조회 → PL 아닌 경기만 필터
    const allTeamFixtures = await getTeamFixtures(MCITY_TEAM_ID);
    const cupFixtures = allTeamFixtures.filter(
      (f: AfFixture) => f.league.id !== PL_LEAGUE_ID,
    );

    // 팀 정보 upsert
    const seenTeamIds = new Set<number>();
    const teamRows: ReturnType<typeof teamToDbRow>[] = [];
    for (const raw of cupFixtures) {
      for (const teamRef of [raw.teams.home, raw.teams.away]) {
        if (!seenTeamIds.has(teamRef.id)) {
          seenTeamIds.add(teamRef.id);
          teamRows.push(
            teamToDbRow({
              id: teamRef.id,
              name: teamRef.name,
              shortName: teamRef.name.substring(0, 3).toUpperCase(),
              logoUrl: teamRef.logo,
              season: SEASON_LABEL,
            }),
          );
        }
      }
    }

    if (teamRows.length > 0) {
      const { error: teamError } = await supabase
        .from("teams")
        .upsert(teamRows, { onConflict: "id" });
      if (teamError) throw teamError;
    }

    // 경기 매핑 + GW 할당 + DB upsert
    const fixtureRows = cupFixtures
      .map((raw: AfFixture) => {
        const fixture = mapAfFixtureToFixture(raw);
        const gw =
          anchors.length > 0
            ? assignGameweekByAnchors(fixture.date, anchors)
            : null;
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
