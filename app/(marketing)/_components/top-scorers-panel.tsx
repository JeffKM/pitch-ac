// PL 득점 TOP 3 패널 — Suspense 내부에서 자체 데이터 fetch

import Image from "next/image";
import Link from "next/link";

import { getCompetitionScorers } from "@/lib/api/football-data/scorers";

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

export function TopScorersSkeleton() {
  return (
    <ComicPanel bg="yellow" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="TOP SCORERS" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white/50 px-3 py-2"
          >
            <div className="size-6 animate-pulse rounded-full bg-comic-black/10" />
            <div className="h-4 flex-1 animate-pulse rounded bg-comic-black/10" />
            <div className="h-5 w-8 animate-pulse rounded bg-comic-black/10" />
          </div>
        ))}
      </div>
    </ComicPanel>
  );
}

export async function TopScorersPanel() {
  let scorersData;
  try {
    scorersData = await getCompetitionScorers("PL");
  } catch {
    // API 실패 시 폴백 UI
    return (
      <ComicPanel bg="yellow" className="p-[var(--comic-panel-padding)]">
        <ComicPanelTitle title="TOP SCORERS" />
        <p
          className="py-6 text-center font-[family-name:var(--font-bangers)] text-comic-black/40"
          style={{ fontSize: "var(--comic-text-base)" }}
        >
          SCORERS UNAVAILABLE
        </p>
      </ComicPanel>
    );
  }

  const topThree = scorersData.scorers.slice(0, 3);

  return (
    <ComicPanel bg="yellow" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="TOP SCORERS" subtitle="PREMIER LEAGUE" />

      <div className="space-y-2">
        {topThree.map((scorer, index) => (
          <div
            key={scorer.player.id}
            className="flex items-center gap-3 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/30 bg-comic-white px-3 py-2"
          >
            {/* 순위 */}
            <span
              className="w-5 shrink-0 text-center font-[family-name:var(--font-bangers)] text-comic-black/50"
              style={{ fontSize: "var(--comic-text-sm)" }}
            >
              {index + 1}
            </span>

            {/* 팀 로고 */}
            <Image
              src={scorer.team.crest}
              alt={scorer.team.tla}
              width={20}
              height={20}
              className="size-5 object-contain"
            />

            {/* 선수명 */}
            <span
              className="flex-1 truncate font-[family-name:var(--font-bangers)] text-comic-black"
              style={{ fontSize: "var(--comic-text-xs)" }}
            >
              {scorer.player.lastName || scorer.player.name}
            </span>

            {/* 골 수 */}
            <span
              className="font-[family-name:var(--font-bangers)] text-comic-black"
              style={{ fontSize: "var(--comic-text-base)" }}
            >
              {scorer.goals}
              <span className="text-comic-black/40"> G</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-center">
        <Link
          href="/scouting"
          className="inline-block font-[family-name:var(--font-bangers)] text-comic-black/70 underline decoration-comic-black/30 underline-offset-4 transition-colors hover:text-comic-black"
          style={{ fontSize: "var(--comic-text-sm)" }}
        >
          EXPLORE PLAYERS →
        </Link>
      </div>
    </ComicPanel>
  );
}
