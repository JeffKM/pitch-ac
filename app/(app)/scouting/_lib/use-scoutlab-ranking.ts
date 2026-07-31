"use client";

// ScoutLab 랭킹 조회 훅 — 카테고리/메트릭/리그 변경 시 서버 재조회

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type { ScoutlabCategory, ScoutlabLeague, ScoutlabPlayer } from "@/types";

export interface RankingEntry {
  player: ScoutlabPlayer;
  value: number;
  percentile: number;
}

export interface RankingQueryParams {
  category: ScoutlabCategory;
  metric: string;
  league: ScoutlabLeague | null;
}

async function fetchRanking({
  category,
  metric,
  league,
}: RankingQueryParams): Promise<RankingEntry[]> {
  const params = new URLSearchParams({ category, metric });
  if (league) params.set("league", league);

  const res = await fetch(`/api/scoutlab/ranking?${params.toString()}`);
  if (!res.ok) throw new Error("랭킹 데이터 요청 실패");

  return (await res.json()) as RankingEntry[];
}

/**
 * 랭킹 데이터 조회.
 * 첫 렌더 파라미터는 서버가 이미 initialEntries로 조회해 둔 상태이므로,
 * 동일 파라미터일 때만 initialData를 주입해 마운트 직후 중복 요청을 막는다.
 */
export function useScoutlabRanking(
  params: RankingQueryParams,
  initialEntries: RankingEntry[],
) {
  const [initialParams] = useState(params);
  const isInitialParams =
    params.category === initialParams.category &&
    params.metric === initialParams.metric &&
    params.league === initialParams.league;

  const query = useQuery({
    queryKey: [
      "scoutlab",
      "ranking",
      params.category,
      params.metric,
      params.league,
    ],
    queryFn: () => fetchRanking(params),
    // 메트릭이 비어 있으면 조회 불가 (sampleMetrics 미로딩 상태)
    enabled: params.metric !== "",
    initialData: isInitialParams ? initialEntries : undefined,
    staleTime: 60_000,
    // 재조회 중에는 직전 랭킹을 유지해 표가 비지 않도록 한다
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (query.error) {
      console.error("[ScoutLab] 랭킹 조회 실패:", query.error);
    }
  }, [query.error]);

  return query;
}
