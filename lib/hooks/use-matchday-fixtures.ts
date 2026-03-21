"use client";

// 매치데이 경기 데이터 폴링 커스텀 훅
// 라이브 경기 존재 시 60초, 없으면 5분 간격으로 자동 갱신

import { useQuery } from "@tanstack/react-query";

import type { MatchdayData } from "@/app/api/matchday/fixtures/route";

async function fetchMatchdayFixtures(gameweek: number): Promise<MatchdayData> {
  const res = await fetch(`/api/matchday/fixtures?gw=${gameweek}`);
  if (!res.ok) throw new Error("매치데이 데이터 요청 실패");
  const json = await res.json();
  return json.data as MatchdayData;
}

export function useMatchdayFixtures(
  gameweek: number,
  initialData: MatchdayData,
) {
  return useQuery({
    queryKey: ["matchday", "fixtures", gameweek],
    queryFn: () => fetchMatchdayFixtures(gameweek),
    initialData,
    // 현재 데이터의 hasLive에 따라 폴링 간격 동적 전환
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 300_000; // 5분
      return data.hasLive ? 60_000 : 300_000;
    },
    refetchIntervalInBackground: false, // 탭 비활성 시 폴링 중단
  });
}

export type { MatchdayData };
