// 하단 CTA 배너 — 동적 문구

import Link from "next/link";

import { ComicPanel } from "./comic-panel";

interface CtaBannerProps {
  matchCount: number;
}

export function CtaBanner({ matchCount }: CtaBannerProps) {
  const hasMatches = matchCount > 0;

  return (
    <ComicPanel
      bg="yellow"
      className="flex flex-col items-stretch gap-4 p-[var(--comic-panel-padding)] md:flex-row md:items-center"
    >
      <div className="flex flex-1 items-start gap-4">
        {/* ! 아이콘 */}
        <div className="flex size-16 shrink-0 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow">
          <span
            className="font-[family-name:var(--font-bangers)] text-comic-black"
            style={{
              fontSize: "var(--comic-text-2xl)",
              lineHeight: "var(--comic-leading-tight)",
            }}
          >
            !
          </span>
        </div>

        <div className="flex-1">
          <p
            className="font-[family-name:var(--font-bangers)] text-comic-black"
            style={{
              fontSize: "var(--comic-text-2xl)",
              lineHeight: "var(--comic-leading-snug)",
              letterSpacing: "0.75px",
            }}
          >
            {hasMatches ? "MATCH DAY!" : "DATA TIME!"}
          </p>
          <p
            className="mt-1 font-[family-name:var(--font-permanent-marker)] text-comic-black/80"
            style={{ fontSize: "var(--comic-body-lg)" }}
          >
            {hasMatches
              ? `${matchCount} matches across Europe's top leagues today!`
              : "Dive into standings, stats, and player analytics across 5 leagues."}
          </p>
        </div>
      </div>

      <Link
        href={hasMatches ? "/matchday" : "/scouting"}
        className="inline-flex items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-black px-6 py-3 font-[family-name:var(--font-bangers)] text-comic-yellow transition-transform hover:scale-105"
        style={{
          fontSize: "var(--comic-text-lg)",
          letterSpacing: "var(--comic-tracking-wide)",
        }}
      >
        {hasMatches ? "VIEW MATCHES" : "EXPLORE DATA"}
      </Link>
    </ComicPanel>
  );
}
