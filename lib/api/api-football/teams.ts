// API-Football 팀(Team) 관련 서비스 함수
import "server-only";

import { CURRENT_SEASON, PL_LEAGUE_ID } from "@/lib/constants/football";

import { apiFootballFetch } from "./client";
import type { AfStandingsResponse, AfTeam } from "./types";

/** PL 소속 팀 목록 조회 */
export async function getLeagueTeams(
  season: number = CURRENT_SEASON,
): Promise<AfTeam[]> {
  const res = await apiFootballFetch<AfTeam>("/teams", {
    params: { league: PL_LEAGUE_ID, season },
    revalidate: 86400,
    tags: ["pl-teams"],
  });
  return res.response;
}

/** PL 리그 순위표 조회 */
export async function getStandings(
  season: number = CURRENT_SEASON,
): Promise<AfStandingsResponse | null> {
  const res = await apiFootballFetch<AfStandingsResponse>("/standings", {
    params: { league: PL_LEAGUE_ID, season },
    revalidate: 3600,
    tags: ["pl-standings"],
  });
  return res.response[0] ?? null;
}
