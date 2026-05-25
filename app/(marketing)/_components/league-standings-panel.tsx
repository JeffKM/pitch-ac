// 5대 리그 순위 미니 테이블 — 상위 7팀, 주요 정보만

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { type LeagueSlug, TOP5_LEAGUES } from "@/lib/constants/football";
import type { Team, TeamStanding } from "@/types";

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

/** 홈에서 표시할 팀 수 */
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
  const topTeams = standings
    .sort((a, b) => a.position - b.position)
    .slice(0, TOP_N);

  return (
    <ComicPanel bg="cream" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="LEAGUE TABLE" subtitle="TOP 7 AT A GLANCE" />

      {/* 리그 탭 */}
      <div className="mb-2 flex gap-1">
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

      {/* 미니 순위 테이블 */}
      {topTeams.length === 0 ? (
        <p
          className="py-6 text-center font-[family-name:var(--font-bangers)] text-comic-black/40"
          style={{ fontSize: "var(--comic-text-base)" }}
        >
          NO DATA YET
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-comic-black border-b-[var(--comic-border-width)] bg-comic-cream font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-sm)] tracking-[var(--comic-tracking-normal)] text-comic-black/70">
                <th className="px-2 py-1.5 text-center">#</th>
                <th className="px-2 py-1.5">Team</th>
                <th className="px-2 py-1.5 text-center">P</th>
                <th className="hidden px-2 py-1.5 text-center sm:table-cell">
                  W
                </th>
                <th className="hidden px-2 py-1.5 text-center sm:table-cell">
                  D
                </th>
                <th className="hidden px-2 py-1.5 text-center sm:table-cell">
                  L
                </th>
                <th className="px-2 py-1.5 text-center">GD</th>
                <th className="px-2 py-1.5 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {topTeams.map((row) => {
                const team = teamsMap.get(row.teamId);
                return (
                  <tr
                    key={row.teamId}
                    className="border-b border-comic-black/20 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black transition-colors hover:bg-comic-cream/50"
                  >
                    <td className="px-2 py-1.5 text-center font-[family-name:var(--font-bangers)]">
                      {row.position}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        {team?.logoUrl && (
                          <Image
                            src={team.logoUrl}
                            alt={team.name}
                            width={20}
                            height={20}
                            className="size-5"
                          />
                        )}
                        <span className="hidden sm:inline">
                          {team?.name ?? `Team ${row.teamId}`}
                        </span>
                        <span className="sm:hidden">
                          {team?.shortName ?? team?.name ?? `${row.teamId}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-center">{row.played}</td>
                    <td className="hidden px-2 py-1.5 text-center sm:table-cell">
                      {row.won}
                    </td>
                    <td className="hidden px-2 py-1.5 text-center sm:table-cell">
                      {row.drawn}
                    </td>
                    <td className="hidden px-2 py-1.5 text-center sm:table-cell">
                      {row.lost}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {row.goalDifference > 0
                        ? `+${row.goalDifference}`
                        : row.goalDifference}
                    </td>
                    <td className="px-2 py-1.5 text-center font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-base)]">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FULL STANDINGS 링크 */}
      <div className="mt-2 text-center">
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
