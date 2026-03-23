// 컵 경기 → PL 게임위크 할당 알고리즘
import "server-only";

import type { SmRound } from "@/lib/api/sportmonks/types";

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
    .map((r) => ({
      gameweek: parseInt(r.name, 10),
      start: new Date(r.starting_at),
      end: new Date(r.ending_at),
    }))
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
 * - 경기 날짜가 특정 GW 범위 내이면 해당 GW
 * - 범위 사이에 있으면 가장 가까운 GW의 midpoint 기준
 * - 30일 초과 거리 → null (시즌 외)
 */
export function assignGameweek(
  fixtureDate: string,
  ranges: GameweekRange[],
): number | null {
  if (ranges.length === 0) return null;

  const date = new Date(fixtureDate);
  const time = date.getTime();

  // 1) 범위 안에 들어가는 GW 확인
  for (const range of ranges) {
    if (time >= range.start.getTime() && time <= range.end.getTime()) {
      return range.gameweek;
    }
  }

  // 2) 가장 가까운 midpoint 기준
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
