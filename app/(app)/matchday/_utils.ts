// 매치데이 공용 유틸 함수 — Server/Client Component 양쪽에서 사용

import { PL_LEAGUE_ID } from "@/lib/api/sportmonks/constants";
import { formatDateLabel, formatShortDate, toDateKey } from "@/lib/date-utils";
import type { Fixture } from "@/types";

/** 날짜별 경기 그룹핑 */
export function groupFixturesByDate(
  fixtures: Fixture[],
): { dateKey: string; dateLabel: string; fixtures: Fixture[] }[] {
  const map = new Map<string, Fixture[]>();

  for (const fixture of fixtures) {
    const key = toDateKey(fixture.date);
    const group = map.get(key) ?? [];
    group.push(fixture);
    map.set(key, group);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, group]) => ({
      dateKey,
      dateLabel: formatDateLabel(dateKey),
      fixtures: group,
    }));
}

/** GW 날짜 범위 문자열 (예: "3월 15일 – 3월 17일")
 *  컵 경기는 제외하고 PL 경기만으로 날짜 범위 계산 */
export function buildDateRange(fixtures: Fixture[]): string {
  // PL 경기만 필터 (competitionName === null 이면 PL)
  const plFixtures = fixtures.filter((f) => f.leagueId === PL_LEAGUE_ID);
  // PL 경기가 없으면 전체 경기로 fallback
  const target = plFixtures.length > 0 ? plFixtures : fixtures;

  if (target.length === 0) return "";

  const dates = target.map((f) => new Date(f.date));
  const first = new Date(Math.min(...dates.map((d) => d.getTime())));
  const last = new Date(Math.max(...dates.map((d) => d.getTime())));

  const firstDateKey = toDateKey(first.toISOString());
  const lastDateKey = toDateKey(last.toISOString());
  const firstStr = formatShortDate(first.toISOString());
  const lastStr = formatShortDate(last.toISOString());

  return firstDateKey === lastDateKey ? firstStr : `${firstStr} – ${lastStr}`;
}
