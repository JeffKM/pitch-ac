import "server-only";

import {
  getCompetitionStandings,
  getCompetitionTeams,
  mapFdStandingToTeamStanding,
  mapFdTeamToTeam,
} from "@/lib/api/football-data";
import { ALL_COMPETITIONS, CURRENT_SEASON } from "@/lib/constants/football";
import { createAdminClient } from "@/lib/supabase/admin";

import { standingToDbRow, teamToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";

/** 단일 리그 팀 기본정보 동기화 */
export async function syncTeams(
  leagueCode: string = "PL",
): Promise<SyncResult> {
  const supabase = createAdminClient();
  try {
    const res = await getCompetitionTeams(leagueCode, CURRENT_SEASON);

    const teamRows = res.teams.map((raw) => {
      const team = mapFdTeamToTeam(raw, SEASON_LABEL);
      return teamToDbRow(team);
    });

    const { error } = await supabase
      .from("teams")
      .upsert(teamRows, { onConflict: "id" });

    if (error) throw error;

    const result: SyncResult = {
      entity: `teams-${leagueCode}`,
      status: "success",
      recordsSynced: teamRows.length,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: `teams-${leagueCode}`,
      status: "error",
      recordsSynced: 0,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}

/** 전체 대회 팀 동기화 (5대 리그 + UCL) */
export async function syncAllLeagueTeams(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  for (const league of ALL_COMPETITIONS) {
    const result = await syncTeams(league.code);
    results.push(result);
  }
  return results;
}

/** 단일 리그 순위표 동기화 */
export async function syncStandings(
  leagueCode: string = "PL",
  leagueId: number = 2021,
): Promise<SyncResult> {
  const supabase = createAdminClient();
  try {
    const standingsRes = await getCompetitionStandings(
      leagueCode,
      CURRENT_SEASON,
    );
    const totalTable = standingsRes.standings.find((s) => s.type === "TOTAL");
    if (!totalTable?.table?.length) {
      throw new Error(`${leagueCode} 순위표 응답이 비어있습니다`);
    }

    const standingRows = totalTable.table.map((raw) => {
      const standing = mapFdStandingToTeamStanding(raw, leagueId);
      return standingToDbRow(standing, SEASON_LABEL);
    });

    const { error } = await supabase
      .from("standings")
      .upsert(standingRows, { onConflict: "team_id,season,league_id" });

    if (error) throw error;

    const result: SyncResult = {
      entity: `standings-${leagueCode}`,
      status: "success",
      recordsSynced: standingRows.length,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: `standings-${leagueCode}`,
      status: "error",
      recordsSynced: 0,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}

/** 전체 대회 순위표 동기화 (5대 리그 + UCL) */
export async function syncAllLeagueStandings(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  for (const league of ALL_COMPETITIONS) {
    const result = await syncStandings(league.code, league.id);
    results.push(result);
  }
  return results;
}
