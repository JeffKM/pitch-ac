"use client";

// 경기 상세 데이터 폴링 커스텀 훅
// LIVE 경기 시 60초 간격 자동 갱신, 비라이브 시 폴링 없음

import { useQuery } from "@tanstack/react-query";

import type { FixtureDetailData } from "@/types";

async function fetchFixtureDetail(id: number): Promise<FixtureDetailData> {
  const res = await fetch(`/api/matchday/fixture?id=${id}`);
  if (!res.ok) throw new Error("경기 상세 데이터 요청 실패");
  const json = await res.json();
  return json.data as FixtureDetailData;
}

export function useFixtureDetail(
  fixtureId: number,
  initialData: FixtureDetailData,
) {
  return useQuery({
    queryKey: ["fixture", "detail", fixtureId],
    queryFn: () => fetchFixtureDetail(fixtureId),
    initialData,
    staleTime: 30_000, // 30초간 fresh — 탭 전환/재마운트 시 불필요한 요청 차단
    // LIVE 경기만 60초 폴링, 나머지는 폴링 없음
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      return data.fixture.status === "LIVE" ? 60_000 : false;
    },
    refetchIntervalInBackground: false, // 탭 비활성 시 폴링 중단
  });
}

export type { FixtureDetailData };
