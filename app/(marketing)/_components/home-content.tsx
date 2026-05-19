// 홈 화면 데이터 fetch 서버 컴포넌트 — Suspense 내부에서 실행

import { connection } from "next/server";

import { CURRENT_SEASON_LABEL } from "@/lib/constants/football";
import { getTodayDateKey } from "@/lib/date-utils";
import { getFixturesByDate } from "@/lib/repositories/fixture-repository";
import { getAllLeagueStandings } from "@/lib/repositories/standing-repository";
import { getTeamsByIds } from "@/lib/repositories/team-repository";
import type { Fixture, TeamStanding } from "@/types";

import { ComicHomeContent } from "./comic-home-content";

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

  for (const standings of standingsMap.values()) {
    if (standings[0]) {
      ids.add(standings[0].teamId);
    }
  }

  return Array.from(ids);
}

export async function HomeContent() {
  await connection();
  const todayDate = getTodayDateKey();

  const [fixtures, standingsMap] = await Promise.all([
    getFixturesByDate(todayDate),
    getAllLeagueStandings(CURRENT_SEASON_LABEL),
  ]);

  const teamIds = collectTeamIds(fixtures, standingsMap);
  const teamsMap = await getTeamsByIds(teamIds);

  return (
    <ComicHomeContent
      fixtures={fixtures}
      standingsMap={standingsMap}
      teamsMap={teamsMap}
    />
  );
}
