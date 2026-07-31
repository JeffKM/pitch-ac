// football-data.org 득점 순위(Scorers) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdScorersResponse } from "./types";

/** 리그 현재 시즌 득점 순위 조회 (응답의 season 필드로 시즌 판별) */
export async function getCompetitionScorers(
  code: string,
): Promise<FdScorersResponse> {
  return footballDataFetch<FdScorersResponse>(`/competitions/${code}/scorers`, {
    revalidate: 3600,
    tags: [`scorers-${code}`],
  });
}
