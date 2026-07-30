// football-data.org 시즌 정보 → 앱 시즌 라벨 파생
// 대회마다 롤오버 시점이 달라(예: UCL은 5대 리그보다 늦게 전환) 전역 상수로 표현할 수 없으므로
// 각 API 응답에 포함된 season 정보에서 라벨을 파생한다.

import type { FdMatch, FdSeason } from "./types";

/** "YYYY-MM-DD..." 형식에서 시작 연도 추출 */
const START_DATE_PATTERN = /^(\d{4})-\d{2}-\d{2}/;

/** FdSeason → 시즌 라벨 (startDate "2026-08-21" → "2026/2027") */
export function deriveSeasonLabel(season: FdSeason): string {
  const matched = START_DATE_PATTERN.exec(season?.startDate ?? "");
  if (!matched) {
    throw new Error(
      `시즌 startDate 형식이 올바르지 않습니다: ${season?.startDate}`,
    );
  }

  const startYear = Number(matched[1]);
  return `${startYear}/${startYear + 1}`;
}

/**
 * 경기 목록에서 시즌 라벨 파생
 * /competitions/{code}/matches 응답에는 최상위 season 필드가 없고 각 경기에만 있다.
 */
export function deriveSeasonLabelFromMatches(
  matches: FdMatch[],
): string | null {
  const withSeason = matches.find((match) => match.season?.startDate);
  return withSeason ? deriveSeasonLabel(withSeason.season) : null;
}
