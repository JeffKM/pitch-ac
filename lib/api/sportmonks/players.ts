// SportMonks 선수(Player) API 서비스
import { sportMonksFetch } from "./client";
import { CURRENT_SEASON_ID, PL_LEAGUE_ID } from "./constants";
import type { SmApiResponse, SmPaginatedResponse, SmPlayer } from "./types";

/** 선수 include 목록 (시즌 통계 포함) */
const PLAYER_DETAIL_INCLUDES = [
  "statistics.details",
  "teams.team",
  "nationality",
  "position",
];

/** 선수 ID로 상세 조회 (현재 시즌 통계 포함) */
export async function getPlayerById(
  playerId: number,
  seasonId: number = CURRENT_SEASON_ID,
): Promise<SmPlayer> {
  const response = await sportMonksFetch<SmApiResponse<SmPlayer>>(
    `/football/players/${playerId}`,
    {
      includes: PLAYER_DETAIL_INCLUDES,
      filters: { playerStatisticSeasonIds: seasonId },
      tags: [`player-${playerId}-season-${seasonId}`],
      revalidate: 3600, // 1시간 캐시
    },
  );
  return response.data;
}

/** 이름으로 선수 검색 */
export async function searchPlayers(query: string): Promise<SmPlayer[]> {
  const response = await sportMonksFetch<SmPaginatedResponse<SmPlayer>>(
    `/football/players/search/${encodeURIComponent(query)}`,
    {
      includes: ["teams.team", "nationality", "position"],
      perPage: 20,
      revalidate: 3600,
    },
  );
  return response.data;
}

/** 팀 스쿼드 조회 */
export async function getSquadByTeamAndSeason(
  teamId: number,
  seasonId: number = CURRENT_SEASON_ID,
): Promise<SmPlayer[]> {
  const response = await sportMonksFetch<SmPaginatedResponse<SmPlayer>>(
    `/football/squads/teams/${teamId}/seasons/${seasonId}`,
    {
      includes: ["position", "nationality", "statistics.details"],
      filters: { playerStatisticSeasonIds: seasonId },
      perPage: 50,
      revalidate: 86400,
      tags: [`squad-team-${teamId}-season-${seasonId}`],
    },
  );
  return response.data;
}

/**
 * 시즌 PL 선수 기본정보 (팀·포지션·국적 포함, 페이지네이션)
 * squads 엔드포인트가 Starter 플랜 미지원 → statistics 엔드포인트를 profile includes로 대체
 */
export async function getLeaguePlayerProfiles(
  page = 1,
  seasonId: number = CURRENT_SEASON_ID,
): Promise<SmPaginatedResponse<SmPlayer>> {
  return sportMonksFetch<SmPaginatedResponse<SmPlayer>>(
    `/football/statistics/seasons/players/${seasonId}`,
    {
      includes: ["teams.team", "nationality", "position"],
      filters: { playerLeagueIds: PL_LEAGUE_ID },
      page,
      perPage: 50,
      revalidate: 86400,
      tags: [`pl-player-profiles-season-${seasonId}-page-${page}`],
    },
  );
}

/** 시즌 선수 통계 (순위/백분위 계산용, 페이지네이션) */
export async function getSeasonPlayerStats(
  page = 1,
  seasonId: number = CURRENT_SEASON_ID,
): Promise<SmPaginatedResponse<SmPlayer>> {
  return sportMonksFetch<SmPaginatedResponse<SmPlayer>>(
    `/football/statistics/seasons/players/${seasonId}`,
    {
      includes: ["details"],
      filters: { playerLeagueIds: PL_LEAGUE_ID },
      page,
      perPage: 50,
      revalidate: 3600,
    },
  );
}
