// 매치데이 대시보드 — 5대 리그 경기 뷰

import type { Metadata } from "next";

import {
  CURRENT_SEASON_LABEL,
  DEFAULT_LEAGUE,
  LEAGUE_BY_SLUG,
  type LeagueSlug,
} from "@/lib/constants/football";
import {
  getCurrentGameweek,
  getFixturesByGameweek,
  getStandingsByTeamIds,
  getTeamsByIds,
} from "@/lib/repositories";

import { EmptyGameweek } from "./_components/empty-gameweek";
import { GameweekHeader } from "./_components/gameweek-header";
import { LeagueTabs } from "./_components/league-tabs";
import { MatchdayContent } from "./_components/matchday-content";
import { buildDateRange } from "./_utils";

interface PageProps {
  searchParams: Promise<{ gw?: string; league?: string }>;
}

function resolveLeague(leagueParam?: string): LeagueSlug {
  if (leagueParam && leagueParam in LEAGUE_BY_SLUG) {
    return leagueParam as LeagueSlug;
  }
  return DEFAULT_LEAGUE;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { gw, league: leagueParam } = await searchParams;
  const leagueSlug = resolveLeague(leagueParam);
  const leagueConfig = LEAGUE_BY_SLUG[leagueSlug];
  const currentGw = await getCurrentGameweek(leagueConfig.id);
  const gameweek = Number(gw) || currentGw;

  return {
    title: `${leagueConfig.shortName} GW${gameweek} Matchday`,
    description: `${leagueConfig.name} GW${gameweek} fixtures and results`,
    openGraph: {
      title: `${leagueConfig.shortName} GW${gameweek} Matchday | pitch-ac`,
      description: `${leagueConfig.name} GW${gameweek} fixtures and results`,
    },
  };
}

export default async function MatchdayPage({ searchParams }: PageProps) {
  const { gw, league: leagueParam } = await searchParams;

  const leagueSlug = resolveLeague(leagueParam);
  const leagueConfig = LEAGUE_BY_SLUG[leagueSlug];

  // gw 파라미터 없으면 현재 게임위크 자동 감지
  const currentGw = await getCurrentGameweek(leagueConfig.id);
  const gameweek = Number(gw) || currentGw;

  const fixtures = await getFixturesByGameweek(gameweek, leagueConfig.id);

  // 팀/순위 배치 조회 (중복 제거)
  const teamIds = [
    ...new Set(
      fixtures.flatMap((f) => [f.homeTeamId, f.awayTeamId]).filter(Boolean),
    ),
  ];

  const [teamsMap, standingsMap] = await Promise.all([
    getTeamsByIds(teamIds),
    getStandingsByTeamIds(teamIds, CURRENT_SEASON_LABEL),
  ]);

  const dateRange = buildDateRange(fixtures);

  const initialData = {
    fixtures,
    teams: Object.fromEntries(teamsMap),
    standings: Object.fromEntries(standingsMap),
    gameweek,
    hasLive: fixtures.some((f) => f.status === "LIVE"),
    leagueSlug,
    maxRounds: leagueConfig.maxRounds,
  };

  return (
    <div className="space-y-8">
      <LeagueTabs activeLeague={leagueSlug} gameweek={gameweek} />
      <GameweekHeader
        gameweek={gameweek}
        dateRange={dateRange}
        maxRounds={leagueConfig.maxRounds}
        leagueSlug={leagueSlug}
      />

      {fixtures.length === 0 ? (
        <EmptyGameweek />
      ) : (
        <MatchdayContent initialData={initialData} />
      )}
    </div>
  );
}
