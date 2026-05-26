"use client";

// 이적뉴스 무한 스크롤 커스텀 훅

import { useInfiniteQuery } from "@tanstack/react-query";

import type { ApiResponse, TransferNewsListResponse } from "@/types";

async function fetchTransferNews(
  cursor?: number,
): Promise<TransferNewsListResponse> {
  const params = new URLSearchParams();
  if (cursor !== undefined) params.set("cursor", String(cursor));

  const res = await fetch(`/api/news/transfers?${params.toString()}`);
  if (!res.ok) throw new Error("이적뉴스 데이터 요청 실패");

  const json = (await res.json()) as ApiResponse<TransferNewsListResponse>;
  return json.data;
}

export function useTransferNews() {
  return useInfiniteQuery({
    queryKey: ["news", "transfers"],
    queryFn: ({ pageParam }) => fetchTransferNews(pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000, // 1분
  });
}
