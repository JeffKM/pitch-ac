// football-data.org 득점 순위(Scorers) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdScorersResponse } from "./types";

/** 리그 득점 순위 조회 */
export async function getCompetitionScorers(
  code: string,
  season?: number,
): Promise<FdScorersResponse> {
  const params: Record<string, string | number> = {};
  if (season) params.season = season;

  return footballDataFetch<FdScorersResponse>(`/competitions/${code}/scorers`, {
    params,
    revalidate: 3600,
    tags: [`scorers-${code}`],
  });
}
