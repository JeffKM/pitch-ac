// 매치데이 대시보드 페이지

import { formatDateLabel, formatShortDate, toDateKey } from "@/lib/date-utils";
import {
  getFixturesByGameweek,
  getStandingByTeamId,
  getTeamById,
} from "@/lib/mock";
import type { Fixture } from "@/types";

import { EmptyGameweek } from "./_components/empty-gameweek";
import { FixtureCard } from "./_components/fixture-card";
import { FixtureDateGroup } from "./_components/fixture-date-group";
import { GameweekHeader } from "./_components/gameweek-header";

// TODO: 실제 서비스에서는 현재 진행 중인 게임위크를 API/DB에서 동적으로 조회해야 함
const DEFAULT_GW = 28;

/** 날짜별 경기 그룹핑 */
function groupFixturesByDate(
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
function buildDateRange(fixtures: Fixture[]): string {
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

interface PageProps {
  searchParams: Promise<{ gw?: string }>;
}

export default async function MatchdayPage({ searchParams }: PageProps) {
  const { gw } = await searchParams;
  const gameweek = Number(gw) || DEFAULT_GW;

  const fixtures = getFixturesByGameweek(gameweek);
  const dateGroups = groupFixturesByDate(fixtures);
  const dateRange = buildDateRange(fixtures);

  return (
    <div className="space-y-8">
      <GameweekHeader gameweek={gameweek} dateRange={dateRange} />

      {fixtures.length === 0 ? (
        <EmptyGameweek />
      ) : (
        dateGroups.map(({ dateKey, dateLabel, fixtures: groupFixtures }) => (
          <FixtureDateGroup key={dateKey} dateLabel={dateLabel}>
            {groupFixtures.map((fixture) => {
              const homeTeam = getTeamById(fixture.homeTeamId);
              const awayTeam = getTeamById(fixture.awayTeamId);

              if (!homeTeam || !awayTeam) return null;

              return (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  homeStanding={getStandingByTeamId(fixture.homeTeamId)}
                  awayStanding={getStandingByTeamId(fixture.awayTeamId)}
                />
              );
            })}
          </FixtureDateGroup>
        ))
      )}
    </div>
  );
}
