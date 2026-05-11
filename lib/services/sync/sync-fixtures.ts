import "server-only";

import {
  getCompetitionMatches,
  mapFdMatchToFixture,
} from "@/lib/api/football-data";
import type { FdMatch } from "@/lib/api/football-data/types";
import {
  CURRENT_SEASON,
  PL_LEAGUE_ID,
  TOP5_LEAGUES,
} from "@/lib/constants/football";
import { createAdminClient } from "@/lib/supabase/admin";

import { fixtureToDbRow, teamToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";

/**
 * 단일 리그 시즌 전체 경기 동기화
 * football-data.org: getCompetitionMatches(code) 1요청
 */
export async function syncLeagueFixtures(
  leagueCode: string,
  leagueId: number = PL_LEAGUE_ID,
): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;
  const entityName = `fixtures-league-${leagueId}`;

  try {
    // DB에서 POSTP 상태인 fixture ID 조회 (수동 설정 보존용)
    const { data: postpRows } = await supabase
      .from("fixtures")
      .select("id")
      .eq("status", "POSTP")
      .eq("league_id", leagueId);
    const postpIds = new Set((postpRows ?? []).map((r) => r.id));

    const allMatches = await getCompetitionMatches(leagueCode, CURRENT_SEASON);

    // 팀 정보 upsert — matches에서 추출
    const seenTeamIds = new Set<number>();
    const teamRows: ReturnType<typeof teamToDbRow>[] = [];
    for (const match of allMatches) {
      for (const teamRef of [match.homeTeam, match.awayTeam]) {
        if (!seenTeamIds.has(teamRef.id)) {
          seenTeamIds.add(teamRef.id);
          teamRows.push(
            teamToDbRow({
              id: teamRef.id,
              name: teamRef.name,
              shortName:
                teamRef.tla ??
                teamRef.shortName ??
                teamRef.name.substring(0, 3).toUpperCase(),
              logoUrl: teamRef.crest,
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
    const fixtureRows = allMatches
      .map((raw: FdMatch) => {
        const fixture = mapFdMatchToFixture(raw);
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
      entity: entityName,
      status: "success",
      recordsSynced: totalSynced,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: entityName,
      status: "error",
      recordsSynced: totalSynced,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}

/** 기존 PL 동기화 — 하위 호환 */
export async function syncFixtures(): Promise<SyncResult> {
  return syncLeagueFixtures("PL", PL_LEAGUE_ID);
}

/** 5대 리그 전체 동기화 (5 API 요청, 순차 실행 — 분당 10회 제한 준수) */
export async function syncAllLeagueFixtures(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  for (const league of TOP5_LEAGUES) {
    const result = await syncLeagueFixtures(league.code, league.id);
    results.push(result);
  }
  return results;
}
