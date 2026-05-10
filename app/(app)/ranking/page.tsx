// 리그 순위 페이지 — Suspense로 비동기 데이터 래핑

import type { Metadata } from "next";
import { Suspense } from "react";

import { getAllStandings, getAllTeams } from "@/lib/repositories";

import { RankingContent } from "./_components/ranking-content";

export const metadata: Metadata = {
  title: "Ranking",
  description: "Premier League standings and league table",
};

async function RankingData() {
  const [standings, teams] = await Promise.all([
    getAllStandings("2024-25"),
    getAllTeams(),
  ]);

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  return <RankingContent standings={standings} teamMap={teamMap} />;
}

function RankingFallback() {
  return (
    <div className="space-y-3">
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
