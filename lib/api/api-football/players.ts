// API-Football 선수(Player) 관련 서비스 함수
import "server-only";

import { CURRENT_SEASON, PL_LEAGUE_ID } from "@/lib/constants/football";

import { apiFootballFetch } from "./client";
import type { AfApiResponse, AfPlayer, AfSquadResponse } from "./types";

/** 선수 검색 (이름) */
export async function searchPlayers(query: string): Promise<AfPlayer[]> {
  const res = await apiFootballFetch<AfPlayer>("/players", {
    params: { search: query, league: PL_LEAGUE_ID },
    revalidate: 3600,
    tags: [`player-search-${query}`],
  });
  return res.response;
}

/** 특정 선수 조회 (시즌 통계 포함) */
export async function getPlayerById(
  playerId: number,
  season: number = CURRENT_SEASON,
): Promise<AfPlayer | null> {
  const res = await apiFootballFetch<AfPlayer>("/players", {
    params: { id: playerId, season },
    revalidate: 3600,
    tags: [`player-${playerId}-season-${season}`],
  });
  return res.response[0] ?? null;
}

/** 팀 스쿼드 조회 (1 요청) */
export async function getTeamSquad(
  teamId: number,
): Promise<AfSquadResponse | null> {
  const res = await apiFootballFetch<AfSquadResponse>("/players/squads", {
    params: { team: teamId },
    revalidate: 86400,
    tags: [`squad-${teamId}`],
  });
  return res.response[0] ?? null;
}

/** 리그 선수 목록 (페이지네이션, 20명/페이지) */
export async function getLeaguePlayers(
  page: number = 1,
  season: number = CURRENT_SEASON,
): Promise<AfApiResponse<AfPlayer>> {
  return apiFootballFetch<AfPlayer>("/players", {
    params: { league: PL_LEAGUE_ID, season, page },
    revalidate: 3600,
    tags: [`league-players-page-${page}`],
  });
}
