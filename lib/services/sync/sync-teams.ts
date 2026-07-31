import "server-only";

import {
  deriveSeasonLabel,
  getCompetitionStandings,
  getCompetitionTeams,
  mapFdStandingToTeamStanding,
  mapFdTeamToTeam,
} from "@/lib/api/football-data";
import { ALL_COMPETITIONS } from "@/lib/constants/football";
import { createAdminClient } from "@/lib/supabase/admin";

import { standingToDbRow, teamToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

/** 단일 리그 팀 기본정보 동기화 */
export async function syncTeams(
  leagueCode: string = "PL",
): Promise<SyncResult> {
  const supabase = createAdminClient();
  try {
    const res = await getCompetitionTeams(leagueCode);
    const seasonLabel = deriveSeasonLabel(res.season);

    const teamRows = res.teams.map((raw) => {
      const team = mapFdTeamToTeam(raw, seasonLabel);
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
    const standingsRes = await getCompetitionStandings(leagueCode);
    const seasonLabel = deriveSeasonLabel(standingsRes.season);

    const totalTable = standingsRes.standings.find((s) => s.type === "TOTAL");
    if (!totalTable?.table?.length) {
      throw new Error(`${leagueCode} 순위표 응답이 비어있습니다`);
    }

    // 개막 전 순위표 오염 가드: football-data.org가 신규 시즌 메타(season)를
    // 반환하면서도 테이블 수치는 직전 시즌의 최종 성적(playedGames > 0)을
    // 그대로 실어 보내는 리그가 있다 (PL/PD/BL1 실측). currentMatchday는
    // 개막 후 1라운드가 진행 중일 때도 1로 유지되어 신뢰할 수 없으므로,
    // 시즌 시작일이 아직 도래하지 않았는데 playedGames > 0인 행이 있는
    // 경우만 모순 응답으로 판정해 적재를 건너뛴다. 이렇게 하면 개막 후
    // 실제로 1라운드가 진행 중인 정상 케이스는 차단되지 않는다.
    const seasonNotYetStarted =
      new Date(standingsRes.season.startDate) > new Date();
    const hasStaleData = totalTable.table.some((row) => row.playedGames > 0);

    if (seasonNotYetStarted && hasStaleData) {
      const result: SyncResult = {
        entity: `standings-${leagueCode}`,
        status: "success",
        recordsSynced: 0,
      };
      await writeSyncLog(supabase, result);
      return result;
    }

    const standingRows = totalTable.table.map((raw) => {
      const standing = mapFdStandingToTeamStanding(raw, leagueId);
      return standingToDbRow(standing, seasonLabel);
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
