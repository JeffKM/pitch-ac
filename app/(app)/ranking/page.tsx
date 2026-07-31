// 리그 순위 페이지 — Suspense로 비동기 데이터 래핑

import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoadingIndicator } from "@/components/page-loading-indicator";
import {
  getAllLeagueStandings,
  getAllTeams,
  getLatestStandingSeasons,
} from "@/lib/repositories";
import type { Team, TeamStanding } from "@/types";

import { RankingContent } from "./_components/ranking-content";

export const metadata: Metadata = {
  title: "Ranking",
  description: "Top 5 European league & Champions League standings",
};

async function RankingData() {
  const [standingsMap, teams, seasonsMap] = await Promise.all([
    getAllLeagueStandings(),
    getAllTeams(),
    getLatestStandingSeasons(),
  ]);

  // Map은 RSC → Client Component 직렬화 불가 → Record로 변환
  const standingsRecord: Record<number, TeamStanding[]> = {};
  for (const [leagueId, standings] of standingsMap) {
    standingsRecord[leagueId] = standings;
  }

  const teamRecord: Record<number, Team> = {};
  for (const t of teams) {
    teamRecord[t.id] = t;
  }

  // 대회별 최신 시즌 라벨 (UCL 롤오버 시차로 대회마다 다를 수 있음)
  const seasonRecord: Record<number, string> = {};
  for (const [leagueId, season] of seasonsMap) {
    seasonRecord[leagueId] = season;
  }

  return (
    <RankingContent
      standingsRecord={standingsRecord}
      teamRecord={teamRecord}
      seasonRecord={seasonRecord}
    />
  );
}

function RankingFallback() {
  return (
    <div className="space-y-3">
      <PageLoadingIndicator />
      <div className="h-10 w-full animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-cream" />
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="h-10 w-full animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-cream"
        />
      ))}
    </div>
  );
}

export default function RankingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-3xl)] leading-[var(--comic-leading-snug)] tracking-[var(--comic-tracking-wide)] text-comic-black">
          Ranking
        </h1>
        <p className="mt-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] tracking-[var(--comic-tracking-wide)] text-comic-black/60">
          League standings
        </p>
      </div>

      <Suspense fallback={<RankingFallback />}>
        <RankingData />
      </Suspense>
    </div>
  );
}
