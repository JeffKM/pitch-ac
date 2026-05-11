// football-data.org 팀(Team) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdTeamsResponse } from "./types";

/** 리그 소속 팀 목록 조회 */
export async function getCompetitionTeams(
  code: string,
  season?: number,
): Promise<FdTeamsResponse> {
  const params: Record<string, string | number> = {};
  if (season) params.season = season;

  return footballDataFetch<FdTeamsResponse>(`/competitions/${code}/teams`, {
    params,
    revalidate: 86400,
    tags: [`teams-${code}`],
  });
}
