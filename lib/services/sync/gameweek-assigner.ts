// 컵 경기 → PL 게임위크 할당 알고리즘
import "server-only";

import type { SmRound } from "@/lib/api/sportmonks/types";

/** 맨시티 PL 실제 경기 날짜 기반 GW 앵커 */
export interface McityPlAnchor {
  gameweek: number;
  date: Date;
}

/** GW 날짜 범위 */
export interface GameweekRange {
  gameweek: number;
  start: Date;
  end: Date;
  /** 범위 중앙값 (거리 계산용) */
  midpoint: number;
}

/** PL 38라운드 → 날짜 범위 배열 생성 */
export function buildGameweekRanges(rounds: SmRound[]): GameweekRange[] {
  // 라운드 이름 → 숫자로 정렬
  const sorted = [...rounds]
    .map((r) => {
      // ending_at이 날짜만 포함(시간 없음) → 하루 끝(23:59:59)으로 확장
      // 예: "2026-03-22" → 3/22 23:59:59 UTC (당일 경기가 범위 내 포함되도록)
      const end = new Date(r.ending_at);
      if (r.ending_at.length <= 10) {
        end.setUTCHours(23, 59, 59, 999);
      }
      return {
        gameweek: parseInt(r.name, 10),
        start: new Date(r.starting_at),
        end,
      };
    })
    .filter((r) => !isNaN(r.gameweek))
    .sort((a, b) => a.gameweek - b.gameweek);

  return sorted.map((r) => ({
    ...r,
    midpoint: (r.start.getTime() + r.end.getTime()) / 2,
  }));
}

/** 최대 허용 거리 (30일, ms) */
const MAX_DISTANCE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * 컵 경기 날짜 → 가장 가까운 PL GW 할당
 * - 항상 midpoint(범위 중앙값) 기준으로 가장 가까운 GW 선택
 * - PL 라운드의 start~end 범위는 일정 변경으로 매우 넓어질 수 있어
 *   범위 기반 판정 대신 midpoint 거리만 사용
 * - 30일 초과 거리 → null (시즌 외)
 */
export function assignGameweek(
  fixtureDate: string,
  ranges: GameweekRange[],
): number | null {
  if (ranges.length === 0) return null;

  const date = new Date(fixtureDate);
  const time = date.getTime();

  // midpoint 기준 가장 가까운 GW 선택
  let closest: GameweekRange | null = null;
  let minDistance = Infinity;

  for (const range of ranges) {
    const distance = Math.abs(time - range.midpoint);
    if (distance < minDistance) {
      minDistance = distance;
      closest = range;
    }
  }

  // 30일 초과 → null
  if (!closest || minDistance > MAX_DISTANCE_MS) return null;

  return closest.gameweek;
}

/**
 * 앵커 기반 GW 할당 — 맨시티 PL 실제 경기 날짜 사용
 * midpoint 방식의 왜곡 문제 해결:
 * - 라운드 범위가 일정 변경/연기로 넓어져도 실제 경기 날짜는 정확
 * - 컵 경기 날짜와 가장 가까운 PL 경기 날짜의 GW를 할당
 * - 30일 초과 거리 → null (시즌 외)
 */
export function assignGameweekByAnchors(
  fixtureDate: string,
  anchors: McityPlAnchor[],
): number | null {
  if (anchors.length === 0) return null;

  const time = new Date(fixtureDate).getTime();

  let closest: McityPlAnchor | null = null;
  let minDistance = Infinity;

  for (const anchor of anchors) {
    const distance = Math.abs(time - anchor.date.getTime());
    if (distance < minDistance) {
      minDistance = distance;
      closest = anchor;
    }
  }

  if (!closest || minDistance > MAX_DISTANCE_MS) return null;

  return closest.gameweek;
}
