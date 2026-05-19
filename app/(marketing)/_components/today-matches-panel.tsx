// 오늘의 경기 패널 — 최대 6개 미니 카드

import Link from "next/link";

import type { Fixture, Team } from "@/types";

import { ComicPanel, ComicPanelTitle } from "./comic-panel";
import { MiniFixtureCard } from "./mini-fixture-card";

interface TodayMatchesPanelProps {
  fixtures: Fixture[];
  teamsMap: Map<number, Team>;
}

export function TodayMatchesPanel({
  fixtures,
  teamsMap,
}: TodayMatchesPanelProps) {
  if (fixtures.length === 0) {
    return (
      <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
        <ComicPanelTitle title="TODAY'S MATCHES" />
        <div className="py-6 text-center">
          <p
            className="font-[family-name:var(--font-bangers)] text-comic-black/60"
            style={{ fontSize: "var(--comic-text-base)" }}
          >
            REST DAY!
          </p>
          <p
            className="mt-1 font-[family-name:var(--font-permanent-marker)] text-comic-black/40"
            style={{ fontSize: "var(--comic-body-sm)" }}
          >
            Check out the standings instead
          </p>
          <Link
            href="/ranking"
            className="mt-3 inline-block rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow px-4 py-2 font-[family-name:var(--font-bangers)] text-comic-black transition-transform hover:scale-105"
            style={{ fontSize: "var(--comic-text-sm)" }}
          >
            VIEW STANDINGS
          </Link>
        </div>
      </ComicPanel>
    );
  }

  // 최대 6개까지 표시
  const displayFixtures = fixtures.slice(0, 6);
  const remaining = fixtures.length - displayFixtures.length;

  return (
    <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle
        title="TODAY'S MATCHES"
        subtitle={`${fixtures.length} matches today`}
      />

      <div className="space-y-2">
        {displayFixtures.map((fixture) => {
          const homeTeam = teamsMap.get(fixture.homeTeamId);
          const awayTeam = teamsMap.get(fixture.awayTeamId);
          if (!homeTeam || !awayTeam) return null;

          return (
            <MiniFixtureCard
              key={fixture.id}
              fixture={fixture}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          );
        })}
      </div>

      {/* 더보기 링크 */}
      <div className="mt-3 text-center">
        <Link
          href="/matchday"
          className="inline-block font-[family-name:var(--font-bangers)] text-comic-black/70 underline decoration-comic-black/30 underline-offset-4 transition-colors hover:text-comic-black"
          style={{ fontSize: "var(--comic-text-sm)" }}
        >
          {remaining > 0 ? `+ ${remaining} MORE MATCHES →` : "ALL MATCHES →"}
        </Link>
      </div>
    </ComicPanel>
  );
}
