// football-data.org 순위(Standings) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdStandingsResponse } from "./types";

/** 리그 순위표 조회 */
export async function getCompetitionStandings(
  code: string,
  season?: number,
): Promise<FdStandingsResponse> {
  const params: Record<string, string | number> = {};
  if (season) params.season = season;

  return footballDataFetch<FdStandingsResponse>(
    `/competitions/${code}/standings`,
    {
      params,
      revalidate: 3600,
      tags: [`standings-${code}`],
    },
  );
}
