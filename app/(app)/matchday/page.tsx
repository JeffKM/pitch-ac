// 매치데이 대시보드 페이지 — Supabase DB에서 실제 PL 경기 데이터 조회

import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getCurrentGameweek,
  getFixturesByGameweek,
  getStandingsByTeamIds,
  getTeamsByIds,
} from "@/lib/repositories";

import { EmptyGameweek } from "./_components/empty-gameweek";
import { GameweekHeader } from "./_components/gameweek-header";
import { MatchdayContent } from "./_components/matchday-content";
import { buildDateRange } from "./_utils";

interface PageProps {
  searchParams: Promise<{ gw?: string }>;
}

export default async function MatchdayPage({ searchParams }: PageProps) {
  const { gw } = await searchParams;

  // gw 파라미터 없으면 현재 게임위크 자동 감지
  const currentGw = await getCurrentGameweek();
  const gameweek = Number(gw) || currentGw;

  const fixtures = await getFixturesByGameweek(gameweek);

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
  };

  return (
    <div className="space-y-8">
      <GameweekHeader gameweek={gameweek} dateRange={dateRange} />

      {fixtures.length === 0 ? (
        <EmptyGameweek />
      ) : (
        <MatchdayContent initialData={initialData} />
      )}
    </div>
  );
}
