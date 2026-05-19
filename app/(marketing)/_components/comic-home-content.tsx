// 홈 화면 메인 콘텐츠 — 6패널 그리드 구성

import { Suspense } from "react";

import type { Fixture, Team, TeamStanding } from "@/types";

import { CtaBanner } from "./cta-banner";
import { HeroBanner } from "./hero-banner";
import { LeagueLeadersPanel } from "./league-leaders-panel";
import { QuickLinksPanel } from "./quick-links-panel";
import { ScoutlabSpotlight } from "./scoutlab-spotlight";
import { TodayMatchesPanel } from "./today-matches-panel";
import { TopScorersPanel, TopScorersSkeleton } from "./top-scorers-panel";

interface ComicHomeContentProps {
  fixtures: Fixture[];
  standingsMap: Map<number, TeamStanding[]>;
  teamsMap: Map<number, Team>;
}

export function ComicHomeContent({
  fixtures,
  standingsMap,
  teamsMap,
}: ComicHomeContentProps) {
  return (
    <main className="mx-auto max-w-5xl p-[var(--comic-panel-padding)]">
      {/* 히어로 배너 — 풀폭 */}
      <HeroBanner matchCount={fixtures.length} />

      {/* 상단 2패널 그리드 */}
      <div className="mt-[var(--comic-panel-gap)] grid gap-[var(--comic-panel-gap)] md:grid-cols-2">
        <TodayMatchesPanel fixtures={fixtures} teamsMap={teamsMap} />
        <LeagueLeadersPanel standingsMap={standingsMap} teamsMap={teamsMap} />
      </div>

      {/* 하단 3패널 그리드 */}
      <div className="mt-[var(--comic-panel-gap)] grid gap-[var(--comic-panel-gap)] md:grid-cols-3">
        <Suspense fallback={<TopScorersSkeleton />}>
          <TopScorersPanel />
        </Suspense>
        <ScoutlabSpotlight />
        <QuickLinksPanel />
      </div>

      {/* CTA 배너 — 풀폭 */}
      <div className="mt-[var(--comic-panel-gap)]">
        <CtaBanner matchCount={fixtures.length} />
      </div>
    </main>
  );
}
