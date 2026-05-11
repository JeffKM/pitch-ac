"use client";

// 5대 리그 탭 네비게이션 — URL 기반 리그 전환

import Link from "next/link";

import { type LeagueSlug, TOP5_LEAGUES } from "@/lib/constants/football";
import { cn } from "@/lib/utils";

interface LeagueTabsProps {
  activeLeague: LeagueSlug;
  gameweek: number;
}

export function LeagueTabs({ activeLeague, gameweek }: LeagueTabsProps) {
  return (
    <nav className="overflow-x-auto" aria-label="리그 선택">
      <div className="flex gap-1 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream p-1">
        {TOP5_LEAGUES.map((league) => (
          <Link
            key={league.slug}
            href={`/matchday?league=${league.slug}&gw=${gameweek}`}
            className={cn(
              "shrink-0 rounded-[calc(var(--comic-panel-radius)-4px)] px-3 py-1.5 font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-sm)] tracking-[var(--comic-tracking-normal)] transition-colors",
              activeLeague === league.slug
                ? "bg-comic-yellow text-comic-black"
                : "text-comic-black/60 hover:bg-comic-white hover:text-comic-black",
            )}
          >
            {league.shortName}
          </Link>
        ))}
      </div>
    </nav>
  );
}
