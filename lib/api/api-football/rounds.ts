// API-Football 라운드(Round) 관련 서비스 함수
import "server-only";

import { CURRENT_SEASON, PL_LEAGUE_ID } from "@/lib/constants/football";

import { apiFootballFetch } from "./client";
import type { AfRound } from "./types";

/** 시즌 전체 라운드 목록 조회 */
export async function getSeasonRounds(
  season: number = CURRENT_SEASON,
): Promise<AfRound[]> {
  const res = await apiFootballFetch<AfRound>("/fixtures/rounds", {
    params: { league: PL_LEAGUE_ID, season },
    revalidate: 86400,
    tags: ["season-rounds"],
  });
  return res.response;
}

/** 현재 진행 중인 라운드 조회 */
export async function getCurrentRound(
  season: number = CURRENT_SEASON,
): Promise<AfRound | null> {
  const res = await apiFootballFetch<AfRound>("/fixtures/rounds", {
    params: { league: PL_LEAGUE_ID, season, current: true },
    revalidate: 3600,
    tags: ["current-round"],
  });
  return res.response[0] ?? null;
}
