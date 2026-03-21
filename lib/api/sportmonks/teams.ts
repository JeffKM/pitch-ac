// SportMonks 팀(Team) API 서비스
import { sportMonksFetch } from "./client";
import { CURRENT_SEASON_ID } from "./constants";
import type {
  SmApiResponse,
  SmPaginatedResponse,
  SmStanding,
  SmTeam,
} from "./types";

/** 시즌 PL 전체 팀 목록 조회 */
export async function getLeagueTeams(
  seasonId: number = CURRENT_SEASON_ID,
): Promise<SmTeam[]> {
  const response = await sportMonksFetch<SmPaginatedResponse<SmTeam>>(
    `/football/teams/seasons/${seasonId}`,
    {
      perPage: 50,
      revalidate: 86400,
      tags: ["pl-teams"],
    },
  );
  return response.data;
}

/** 팀 ID로 상세 조회 */
export async function getTeamById(teamId: number): Promise<SmTeam> {
  const response = await sportMonksFetch<SmApiResponse<SmTeam>>(
    `/football/teams/${teamId}`,
    {
      revalidate: 86400,
      tags: [`team-${teamId}`],
    },
  );
  return response.data;
}

/** 리그 순위표 조회 */
export async function getStandings(
  seasonId: number = CURRENT_SEASON_ID,
): Promise<SmStanding[]> {
  const response = await sportMonksFetch<SmPaginatedResponse<SmStanding>>(
    `/football/standings/seasons/${seasonId}`,
    {
      includes: ["participant", "details"],
      revalidate: 3600, // 1시간 캐시
      tags: ["pl-standings"],
    },
  );
  return response.data;
}
