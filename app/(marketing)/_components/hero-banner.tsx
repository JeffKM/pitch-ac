// 히어로 배너 — 5대 리그 데이터 허브 헤드라인 + 오늘 경기 카운트

import Link from "next/link";

import { ComicPanel, ComicPanelHeading } from "./comic-panel";

interface HeroBannerProps {
  matchCount: number;
}

export function HeroBanner({ matchCount }: HeroBannerProps) {
  const hasMatches = matchCount > 0;

  return (
    <ComicPanel bg="skyblue" className="p-[var(--comic-panel-padding)]">
      <ComicPanelHeading
        title="5-LEAGUE DATA HUB"
        subtitle={
          hasMatches
            ? `TODAY: ${matchCount} MATCHES ACROSS EUROPE`
            : "NO MATCHES TODAY — EXPLORE STANDINGS & STATS"
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <p
          className="font-[family-name:var(--font-bangers)] text-comic-black"
          style={{
            fontSize: "clamp(28px, 6vw, var(--comic-text-4xl))",
            lineHeight: "var(--comic-leading-tight)",
            letterSpacing: "var(--comic-tracking-widest)",
          }}
        >
          {hasMatches ? "KICK OFF!" : "REST DAY!"}
        </p>

        <Link
          href={hasMatches ? "/matchday" : "/ranking"}
          className="inline-flex items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-black px-6 py-3 font-[family-name:var(--font-bangers)] text-comic-yellow transition-transform hover:scale-105"
          style={{
            fontSize: "var(--comic-text-lg)",
            letterSpacing: "var(--comic-tracking-wide)",
          }}
        >
          {hasMatches ? "SEE ALL MATCHES" : "CHECK STANDINGS"}
        </Link>
      </div>
    </ComicPanel>
  );
}
