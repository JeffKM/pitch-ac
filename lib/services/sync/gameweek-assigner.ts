// 컵 경기 → PL 게임위크 할당 알고리즘
// football-data.org 전환 후 matchday 필드를 직접 사용하므로 이 모듈은 레거시
import "server-only";

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

/** 최대 허용 거리 (30일, ms) */
const MAX_DISTANCE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * 앵커 기반 GW 할당 — 맨시티 PL 실제 경기 날짜 사용
 * 컵 경기 날짜와 가장 가까운 PL 경기 날짜의 GW를 할당
 * 30일 초과 거리 → null (시즌 외)
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
