// football-data.org 팀(Team) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdTeamsResponse } from "./types";

/** 리그 현재 시즌 소속 팀 목록 조회 (응답의 season 필드로 시즌 판별) */
export async function getCompetitionTeams(
  code: string,
): Promise<FdTeamsResponse> {
  return footballDataFetch<FdTeamsResponse>(`/competitions/${code}/teams`, {
    revalidate: 86400,
    tags: [`teams-${code}`],
  });
}
