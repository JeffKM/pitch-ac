// football-data.org 경기(Match) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdMatch, FdMatchesResponse } from "./types";

/**
 * 리그 현재 시즌 전체 경기 조회
 * season 파라미터를 넘기지 않아 API가 판단한 currentSeason을 그대로 사용한다.
 * 시즌 라벨은 응답의 matches[i].season에서 파생한다.
 */
export async function getCompetitionMatches(
  code: string,
): Promise<FdMatchesResponse> {
  return footballDataFetch<FdMatchesResponse>(`/competitions/${code}/matches`, {
    revalidate: 3600,
    tags: [`season-matches-${code}`],
  });
}

/** 특정 경기 조회 */
export async function getMatchById(matchId: number): Promise<FdMatch | null> {
  try {
    const res = await footballDataFetch<FdMatch>(`/matches/${matchId}`, {
      revalidate: 60,
      tags: [`match-${matchId}`],
    });
    return res;
  } catch {
    return null;
  }
}

/** 특정 matchday 경기 조회 */
export async function getMatchesByMatchday(
  code: string,
  matchday: number,
): Promise<FdMatch[]> {
  const res = await footballDataFetch<FdMatchesResponse>(
    `/competitions/${code}/matches`,
    {
      params: { matchday },
      revalidate: 3600,
      tags: [`matchday-${code}-${matchday}`],
    },
  );
  return res.matches;
}

/** 날짜 범위로 경기 조회 */
export async function getMatchesByDateRange(
  code: string,
  dateFrom: string,
  dateTo: string,
): Promise<FdMatch[]> {
  const res = await footballDataFetch<FdMatchesResponse>(
    `/competitions/${code}/matches`,
    {
      params: { dateFrom, dateTo },
      revalidate: 3600,
      tags: [`matches-${code}-${dateFrom}`],
    },
  );
  return res.matches;
}
