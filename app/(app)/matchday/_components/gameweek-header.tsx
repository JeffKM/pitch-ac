// 게임위크 네비게이션 헤더 (이전/다음 화살표 포함, 리그별 maxRounds)

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { LeagueSlug } from "@/lib/constants/football";

const MIN_GW = 1;

interface GameweekHeaderProps {
  gameweek: number;
  dateRange: string;
  maxRounds?: number;
  leagueSlug?: LeagueSlug;
}

export function GameweekHeader({
  gameweek,
  dateRange,
  maxRounds = 38,
  leagueSlug = "epl",
}: GameweekHeaderProps) {
  const hasPrev = gameweek > MIN_GW;
  const hasNext = gameweek < maxRounds;

  const buildHref = (gw: number) => `/matchday?league=${leagueSlug}&gw=${gw}`;

  return (
    <div className="flex items-center justify-between">
      {hasPrev ? (
        <Link
          href={buildHref(gameweek - 1)}
          className="flex size-10 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white transition-colors hover:bg-comic-cream"
          aria-label="Previous gameweek"
        >
          <ChevronLeft className="size-5 text-comic-black" />
        </Link>
      ) : (
        <span className="flex size-10 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black/30 bg-comic-white/50">
          <ChevronLeft className="size-5 text-comic-black/30" />
        </span>
      )}

      <div className="text-center">
        <h1 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-2xl)] leading-[var(--comic-leading-snug)] tracking-[var(--comic-tracking-wide)] text-comic-black">
          Gameweek {gameweek}
        </h1>
        <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] tracking-[var(--comic-tracking-wide)] text-comic-black/60">
          {dateRange}
        </p>
      </div>

      {hasNext ? (
        <Link
          href={buildHref(gameweek + 1)}
          className="flex size-10 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white transition-colors hover:bg-comic-cream"
          aria-label="Next gameweek"
        >
          <ChevronRight className="size-5 text-comic-black" />
        </Link>
      ) : (
        <span className="flex size-10 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black/30 bg-comic-white/50">
          <ChevronRight className="size-5 text-comic-black/30" />
        </span>
      )}
    </div>
  );
}
