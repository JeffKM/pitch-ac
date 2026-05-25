// 5대 리그 순위 한눈에 — 탭 전환, 리그별 상위 7팀 + 승점 바

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { type LeagueSlug, TOP5_LEAGUES } from "@/lib/constants/football";
import type { Team, TeamStanding } from "@/types";

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

/** 표시할 팀 수 */
const TOP_N = 7;

/** 탭 축약 라벨 */
const TAB_LABELS: Record<LeagueSlug, string> = {
  epl: "EPL",
  laliga: "LaLiga",
  seriea: "Serie A",
  bundesliga: "BuLi",
  ligue1: "Ligue 1",
};

interface LeagueStandingsPanelProps {
  standingsMap: Map<number, TeamStanding[]>;
  teamsMap: Map<number, Team>;
}

export function LeagueStandingsPanel({
  standingsMap,
  teamsMap,
}: LeagueStandingsPanelProps) {
  const [activeSlug, setActiveSlug] = useState<LeagueSlug>("epl");

  const activeLeague = TOP5_LEAGUES.find((l) => l.slug === activeSlug)!;
  const standings = standingsMap.get(activeLeague.id) ?? [];
  const topTeams = standings.slice(0, TOP_N);
  const maxPoints = topTeams[0]?.points ?? 0;

  return (
    <ComicPanel bg="cream" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="LEAGUE TABLE" subtitle="TOP 7 AT A GLANCE" />

      {/* 리그 탭 */}
      <div className="mb-3 flex gap-1">
        {TOP5_LEAGUES.map((league) => {
          const slug = league.slug;
          const isActive = slug === activeSlug;
          return (
            <button
              key={slug}
              onClick={() => setActiveSlug(slug)}
              className={`rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] px-2 py-1 font-[family-name:var(--font-bangers)] transition-colors ${
                isActive
                  ? "border-comic-black bg-comic-black text-comic-white"
                  : "border-comic-black/30 bg-comic-white text-comic-black/60 hover:bg-comic-cream"
              }`}
              style={{ fontSize: "var(--comic-body-xs)" }}
            >
              {TAB_LABELS[slug]}
            </button>
          );
        })}
      </div>

      {/* 순위 목록 */}
      {topTeams.length === 0 ? (
        <p
          className="py-6 text-center font-[family-name:var(--font-bangers)] text-comic-black/40"
          style={{ fontSize: "var(--comic-text-base)" }}
        >
          NO DATA YET
        </p>
      ) : (
        <div className="space-y-1.5">
          {topTeams.map((standing) => {
            const team = teamsMap.get(standing.teamId);
            if (!team) return null;

            const barWidth =
              maxPoints > 0 ? (standing.points / maxPoints) * 100 : 0;
            const diff = standing.points - maxPoints; // 1위는 0, 나머지는 음수

            return (
              <div
                key={standing.teamId}
                className="flex items-center gap-2 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white px-2.5 py-1.5"
              >
                {/* 순위 */}
                <span
                  className="w-5 shrink-0 text-right font-[family-name:var(--font-bangers)] text-comic-black/50"
                  style={{ fontSize: "var(--comic-body-xs)" }}
                >
                  {standing.position}
                </span>

                {/* 팀 로고 + 이름 */}
                <Image
                  src={team.logoUrl}
                  alt={team.shortName}
                  width={20}
                  height={20}
                  className="size-5 shrink-0 object-contain"
                />
                <span
                  className="w-16 shrink-0 truncate font-[family-name:var(--font-bangers)] text-comic-black"
                  style={{ fontSize: "var(--comic-text-xs)" }}
                >
                  {team.shortName}
                </span>

                {/* 승점 바 */}
                <div className="relative flex-1">
                  <div
                    className="h-3 rounded-sm bg-comic-black/80 transition-all"
                    style={{
                      width: `${barWidth}%`,
                      opacity:
                        standing.position === 1
                          ? 1
                          : 0.4 + 0.6 * (barWidth / 100),
                    }}
                  />
                </div>

                {/* 승점 + 차이 */}
                <div className="flex shrink-0 items-baseline gap-1">
                  <span
                    className="font-[family-name:var(--font-bangers)] text-comic-black tabular-nums"
                    style={{ fontSize: "var(--comic-text-xs)" }}
                  >
                    {standing.points}
                  </span>
                  {diff < 0 && (
                    <span
                      className="font-[family-name:var(--font-permanent-marker)] text-comic-black/40 tabular-nums"
                      style={{ fontSize: "var(--comic-body-xs)" }}
                    >
                      {diff}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL STANDINGS 링크 */}
      <div className="mt-3 text-center">
        <Link
          href={`/ranking?league=${activeSlug}`}
          className="inline-block font-[family-name:var(--font-bangers)] text-comic-black/70 underline decoration-comic-black/30 underline-offset-4 transition-colors hover:text-comic-black"
          style={{ fontSize: "var(--comic-text-sm)" }}
        >
          FULL STANDINGS →
        </Link>
      </div>
    </ComicPanel>
  );
}
