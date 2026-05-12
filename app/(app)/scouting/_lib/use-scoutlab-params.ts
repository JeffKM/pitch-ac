"use client";

// ScoutLab URL searchParams 동기화 훅 (Client Component용)

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import type {
  ScoutlabAdjustment,
  ScoutlabComparisonPosition,
  ScoutlabLeague,
  ScoutlabMode,
  ScoutlabPosition,
} from "@/types";

import {
  DEFAULT_ADJUSTMENT,
  DEFAULT_COMPARISON_POSITION,
  DEFAULT_MODE,
  DEFAULT_SEASON,
  VALID_ADJUSTMENTS,
  VALID_COMPARISON_POSITIONS,
  VALID_LEAGUES,
  VALID_MODES,
  VALID_POSITIONS,
} from "./scoutlab-constants";

export interface ScoutlabParamsState {
  playerId: number | null;
  season: string;
  league: ScoutlabLeague | null;
  team: string | null;
  position: ScoutlabPosition | null;
  mode: ScoutlabMode;
  adjustment: ScoutlabAdjustment;
  comparisonPosition: ScoutlabComparisonPosition;
}

type ParamUpdates = Partial<ScoutlabParamsState> & {
  compareId?: number | null;
};

/** searchParams 값을 whitelist 검증 후 반환 */
function validateEnum<T extends string>(
  value: string | null,
  validValues: readonly T[] | T[],
  fallback: T,
): T;
function validateEnum<T extends string>(
  value: string | null,
  validValues: readonly T[] | T[],
  fallback: null,
): T | null;
function validateEnum<T extends string>(
  value: string | null,
  validValues: readonly T[] | T[],
  fallback: T | null,
): T | null {
  if (!value) return fallback;
  return (validValues as T[]).includes(value as T) ? (value as T) : fallback;
}

/** ScoutLab searchParams 읽기/쓰기 훅 */
export function useScoutlabParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: ScoutlabParamsState = useMemo(() => {
    const playerIdStr = searchParams.get("playerId");
    const playerId = playerIdStr ? parseInt(playerIdStr, 10) : null;

    return {
      playerId: playerId !== null && !isNaN(playerId) ? playerId : null,
      season: searchParams.get("season") || DEFAULT_SEASON,
      league: validateEnum(searchParams.get("league"), VALID_LEAGUES, null),
      team: searchParams.get("team") || null,
      position: validateEnum(
        searchParams.get("position"),
        VALID_POSITIONS,
        null,
      ),
      mode: validateEnum(searchParams.get("mode"), VALID_MODES, DEFAULT_MODE),
      adjustment: validateEnum(
        searchParams.get("adjustment"),
        VALID_ADJUSTMENTS,
        DEFAULT_ADJUSTMENT,
      ),
      comparisonPosition: validateEnum(
        searchParams.get("comparisonPosition"),
        VALID_COMPARISON_POSITIONS,
        DEFAULT_COMPARISON_POSITION,
      ),
    };
  }, [searchParams]);

  /** URL searchParams 업데이트 (shallow navigation) */
  const setParams = useCallback(
    (updates: ParamUpdates) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      // 기본값은 URL에서 제거
      if (params.get("mode") === DEFAULT_MODE) params.delete("mode");
      if (params.get("adjustment") === DEFAULT_ADJUSTMENT)
        params.delete("adjustment");
      if (params.get("season") === DEFAULT_SEASON) params.delete("season");
      if (params.get("comparisonPosition") === DEFAULT_COMPARISON_POSITION)
        params.delete("comparisonPosition");

      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return { ...state, setParams };
}
