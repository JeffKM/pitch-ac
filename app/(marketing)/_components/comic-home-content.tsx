// 홈 화면 메인 콘텐츠 — [경기|리그 순위] + 뉴스 + 베스트 XI

import type { Fixture, Team, TeamStanding } from "@/types";

import { BestElevenPlaceholder } from "./best-eleven-placeholder";
import { LeagueStandingsPanel } from "./league-standings-panel";
import { NewsPlaceholder } from "./news-placeholder";
import { RoundMatchesPanel } from "./round-matches-panel";

interface ComicHomeContentProps {
  todayFixtures: Fixture[];
  nextRoundFixtures: Fixture[];
  standingsMap: Map<number, TeamStanding[]>;
  teamsMap: Map<number, Team>;
  currentGameweek: number;
}

export function ComicHomeContent({
  todayFixtures,
  nextRoundFixtures,
  standingsMap,
  teamsMap,
  currentGameweek,
}: ComicHomeContentProps) {
  return (
    <main className="mx-auto max-w-5xl p-[var(--comic-panel-padding)]">
      {/* 2패널 그리드: 경기 | 리그 순위 */}
      <div className="grid gap-[var(--comic-panel-gap)] md:grid-cols-2">
        <RoundMatchesPanel
          todayFixtures={todayFixtures}
          nextRoundFixtures={nextRoundFixtures}
          teamsMap={teamsMap}
          currentGameweek={currentGameweek}
        />
        <LeagueStandingsPanel standingsMap={standingsMap} teamsMap={teamsMap} />
      </div>

      {/* 뉴스 — 풀폭 */}
      <div className="mt-[var(--comic-panel-gap)]">
        <NewsPlaceholder />
      </div>

      {/* 베스트 XI — 풀폭 */}
      <div className="mt-[var(--comic-panel-gap)]">
        <BestElevenPlaceholder />
      </div>
    </main>
  );
}
