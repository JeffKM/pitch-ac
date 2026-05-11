"use client";

// 매치데이 경기 데이터 폴링 커스텀 훅

import { useQuery } from "@tanstack/react-query";

import type { MatchdayData } from "@/app/api/matchday/fixtures/route";

async function fetchMatchdayFixtures(date: string): Promise<MatchdayData> {
  const res = await fetch(`/api/matchday/fixtures?date=${date}`);
  if (!res.ok) throw new Error("매치데이 데이터 요청 실패");
  const json = await res.json();
  return json.data as MatchdayData;
}

export function useMatchdayFixtures(date: string, initialData: MatchdayData) {
  return useQuery({
    queryKey: ["matchday", "fixtures", date],
    queryFn: () => fetchMatchdayFixtures(date),
    initialData,
    staleTime: 30_000,
    refetchInterval: 300_000, // 5분 간격 폴링
    refetchIntervalInBackground: false,
  });
}

export type { MatchdayData };
