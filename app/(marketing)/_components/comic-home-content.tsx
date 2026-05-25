// 홈 화면 메인 콘텐츠 — 4패널 구성

import type { Fixture, Team, TeamStanding } from "@/types";

import { CtaBanner } from "./cta-banner";
import { HeroBanner } from "./hero-banner";
import { LeagueStandingsPanel } from "./league-standings-panel";
import { QuickLinksPanel } from "./quick-links-panel";
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
      {/* 히어로 배너 — 풀폭 */}
      <HeroBanner matchCount={todayFixtures.length} />

      {/* 2패널 그리드: 경기 | 순위 */}
      <div className="mt-[var(--comic-panel-gap)] grid gap-[var(--comic-panel-gap)] md:grid-cols-2">
        <RoundMatchesPanel
          todayFixtures={todayFixtures}
          nextRoundFixtures={nextRoundFixtures}
          teamsMap={teamsMap}
          currentGameweek={currentGameweek}
        />
        <LeagueStandingsPanel standingsMap={standingsMap} teamsMap={teamsMap} />
      </div>

      {/* 퀵 링크 — 풀폭, 가로 3열 */}
      <div className="mt-[var(--comic-panel-gap)]">
        <QuickLinksPanel />
      </div>

      {/* CTA 배너 — 풀폭 */}
      <div className="mt-[var(--comic-panel-gap)]">
        <CtaBanner matchCount={todayFixtures.length} />
      </div>
    </main>
  );
}
