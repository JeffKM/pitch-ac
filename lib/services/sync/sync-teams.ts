import "server-only";

import { getLeagueTeams, getStandings } from "@/lib/api/sportmonks";
import {
  mapSmStandingToTeamStanding,
  mapSmTeamToTeam,
} from "@/lib/api/sportmonks/mappers";
import { createAdminClient } from "@/lib/supabase/admin";

import { standingToDbRow, teamToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";

/** PL 20팀 기본정보 동기화 */
export async function syncTeams(): Promise<SyncResult> {
  const supabase = createAdminClient();
  try {
    const rawTeams = await getLeagueTeams();

    const teamRows = rawTeams.map((raw) => {
      const team = mapSmTeamToTeam(raw, SEASON_LABEL);
      return teamToDbRow(team);
    });

    const { error } = await supabase
      .from("teams")
      .upsert(teamRows, { onConflict: "id" });

    if (error) throw error;

    const result: SyncResult = {
      entity: "teams",
      status: "success",
      recordsSynced: teamRows.length,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: "teams",
      status: "error",
      recordsSynced: 0,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}

/** 리그 순위표 동기화 */
export async function syncStandings(): Promise<SyncResult> {
  const supabase = createAdminClient();
  try {
    const rawStandings = await getStandings();

    const standingRows = rawStandings.map((raw) => {
      const standing = mapSmStandingToTeamStanding(raw);
      return standingToDbRow(standing, SEASON_LABEL);
    });

    const { error } = await supabase
      .from("standings")
      .upsert(standingRows, { onConflict: "team_id,season" });

    if (error) throw error;

    const result: SyncResult = {
      entity: "standings",
      status: "success",
      recordsSynced: standingRows.length,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: "standings",
      status: "error",
      recordsSynced: 0,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}
