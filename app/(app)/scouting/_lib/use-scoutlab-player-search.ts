"use client";

// ScoutLab 선수 검색 훅 — 디바운스된 검색어 + 리그/팀 필터, 선택 선수 단건 조회

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import type { ScoutlabPosition } from "@/types";

export interface PlayerSearchResult {
  id: number;
  name: string;
  team: string;
  league: string;
  position: ScoutlabPosition;
}

export interface PlayerSearchParams {
  /** 디바운스가 끝난 검색어 (2자 미만이면 빈 문자열로 정규화) */
  query: string;
  season: string;
  league?: string | null;
  team?: string | null;
}

const SEARCH_ENDPOINT = "/api/scoutlab/players/search";

async function fetchPlayerSearch({
  query,
  season,
  league,
  team,
}: PlayerSearchParams): Promise<PlayerSearchResult[]> {
  const params = new URLSearchParams({ q: query, season });
  if (league) params.set("league", league);
  if (team) params.set("team", team);

  const res = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`);
  if (!res.ok) throw new Error("선수 검색 요청 실패");

  return (await res.json()) as PlayerSearchResult[];
}

/** 선수 검색 조회. enabled로 빈 검색어·팝오버 닫힘 상태를 가드한다 */
export function useScoutlabPlayerSearch(
  params: PlayerSearchParams,
  options: { enabled: boolean },
) {
  const query = useQuery({
    queryKey: [
      "scoutlab",
      "players",
      "search",
      params.season,
      params.query,
      params.league ?? null,
      params.team ?? null,
    ],
    queryFn: () => fetchPlayerSearch(params),
    enabled: options.enabled,
    staleTime: 60_000,
    // 새 검색어 조회 중에는 직전 결과를 유지 (에러 시에도 목록이 비지 않음)
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (query.error) {
      console.error("[ScoutLab] 선수 검색 실패:", query.error);
    }
  }, [query.error]);

  return query;
}

/** 단건 조회 queryKey — 검색 결과에서 선택 시 캐시 선주입에 사용 */
export function scoutlabPlayerQueryKey(
  playerId: number | null,
  season: string,
) {
  return ["scoutlab", "players", "detail", season, playerId] as const;
}

async function fetchPlayerById(
  playerId: number,
  season: string,
): Promise<PlayerSearchResult | null> {
  const params = new URLSearchParams({
    q: "",
    season,
    id: String(playerId),
  });

  const res = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`);
  if (!res.ok) throw new Error("선수 조회 요청 실패");

  const data = (await res.json()) as PlayerSearchResult[];
  return data[0] ?? null;
}

/** playerId로 선택된 선수 단건 조회 (이름 표시용) */
export function useScoutlabPlayerById(
  playerId: number | null,
  season: string,
  options: { enabled: boolean },
) {
  const query = useQuery({
    queryKey: scoutlabPlayerQueryKey(playerId, season),
    queryFn: () => {
      if (playerId === null) throw new Error("playerId 없음");
      return fetchPlayerById(playerId, season);
    },
    enabled: playerId !== null && options.enabled,
    // 선수 이름/팀은 거의 바뀌지 않으므로 길게 유지
    staleTime: 300_000,
  });

  useEffect(() => {
    if (query.error) {
      console.error("[ScoutLab] 선택 선수 조회 실패:", query.error);
    }
  }, [query.error]);

  return query;
}
