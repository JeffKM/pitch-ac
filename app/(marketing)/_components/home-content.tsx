// 홈 화면 데이터 fetch 서버 컴포넌트 — Suspense 내부에서 실행

import { connection } from "next/server";

import { CURRENT_SEASON_LABEL, PL_LEAGUE_ID } from "@/lib/constants/football";
import { getTodayDateKey } from "@/lib/date-utils";
import {
  getCurrentGameweek,
  getFixturesByDate,
  getFixturesByGameweek,
  getUpcomingFixtures,
} from "@/lib/repositories/fixture-repository";
import { getLatestNews } from "@/lib/repositories/news-repository";
import { getAllLeagueStandings } from "@/lib/repositories/standing-repository";
import { getTeamsByIds } from "@/lib/repositories/team-repository";
import type { Fixture, TeamStanding } from "@/types";

import { ComicHomeContent } from "./comic-home-content";

/** 홈에서 표시할 순위 상위 팀 수 */
const STANDINGS_TOP_N = 7;

/** fixtures + standings에서 필요한 팀 ID를 수집 */
function collectTeamIds(
  fixtures: Fixture[],
  standingsMap: Map<number, TeamStanding[]>,
): number[] {
  const ids = new Set<number>();

  for (const f of fixtures) {
    ids.add(f.homeTeamId);
    ids.add(f.awayTeamId);
  }

  // 각 리그의 상위 7팀 ID만 수집
  for (const standings of standingsMap.values()) {
    for (const s of standings.slice(0, STANDINGS_TOP_N)) {
      ids.add(s.teamId);
    }
  }

  return Array.from(ids);
}

export async function HomeContent() {
  await connection();
  const todayDate = getTodayDateKey();

  const [todayFixtures, standingsMap, currentGameweek, latestNews] =
    await Promise.all([
      getFixturesByDate(todayDate),
      getAllLeagueStandings(CURRENT_SEASON_LABEL),
      getCurrentGameweek(PL_LEAGUE_ID),
      getLatestNews(3),
    ]);

  // 오늘 경기가 없으면 다음 라운드 경기 조회
  let nextRoundFixtures: Fixture[] = [];
  let upcomingFixtures: Fixture[] = [];
  if (todayFixtures.length === 0) {
    nextRoundFixtures = await getFixturesByGameweek(
      currentGameweek,
      PL_LEAGUE_ID,
    );

    // PL 라운드 경기가 모두 종료됐으면 전체 대회에서 다음 예정 경기 조회
    const hasUpcomingInRound = nextRoundFixtures.some((f) => f.status === "NS");
    if (!hasUpcomingInRound) {
      nextRoundFixtures = []; // 종료된 라운드는 표시하지 않음
      upcomingFixtures = await getUpcomingFixtures(6);
    }
  }

  // 다음 라운드 경기의 팀 ID도 포함
  const allFixtures = [
    ...todayFixtures,
    ...nextRoundFixtures,
    ...upcomingFixtures,
  ];
  const teamIds = collectTeamIds(allFixtures, standingsMap);
  const teamsMap = await getTeamsByIds(teamIds);

  return (
    <ComicHomeContent
      todayFixtures={todayFixtures}
      nextRoundFixtures={nextRoundFixtures}
      upcomingFixtures={upcomingFixtures}
      standingsMap={standingsMap}
      teamsMap={teamsMap}
      currentGameweek={currentGameweek}
      latestNews={latestNews}
    />
  );
}
