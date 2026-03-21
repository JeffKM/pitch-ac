// 매치데이 공용 유틸 함수 — Server/Client Component 양쪽에서 사용

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

/** GW 날짜 범위 문자열 (예: "3월 15일 – 3월 17일") */
export function buildDateRange(fixtures: Fixture[]): string {
  if (fixtures.length === 0) return "";

  const dates = fixtures.map((f) => new Date(f.date));
  const first = new Date(Math.min(...dates.map((d) => d.getTime())));
  const last = new Date(Math.max(...dates.map((d) => d.getTime())));

  const firstDateKey = toDateKey(first.toISOString());
  const lastDateKey = toDateKey(last.toISOString());
  const firstStr = formatShortDate(first.toISOString());
  const lastStr = formatShortDate(last.toISOString());

  return firstDateKey === lastDateKey ? firstStr : `${firstStr} – ${lastStr}`;
}
