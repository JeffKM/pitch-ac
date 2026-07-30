// football-data.org 순위(Standings) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdStandingsResponse } from "./types";

/** 리그 현재 시즌 순위표 조회 (응답의 season 필드로 시즌 판별) */
export async function getCompetitionStandings(
  code: string,
): Promise<FdStandingsResponse> {
  return footballDataFetch<FdStandingsResponse>(
    `/competitions/${code}/standings`,
    {
      revalidate: 3600,
      tags: [`standings-${code}`],
    },
  );
}
