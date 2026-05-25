// 빠른 링크 패널 — Matchday / Ranking / ScoutLab

import Link from "next/link";

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

const links = [
  {
    href: "/matchday",
    label: "MATCHDAY",
    desc: "Live scores & fixtures",
    bg: "bg-comic-skyblue",
  },
  {
    href: "/ranking",
    label: "RANKING",
    desc: "5-league standings",
    bg: "bg-comic-cream",
  },
  {
    href: "/scouting",
    label: "SCOUTLAB",
    desc: "Player analytics",
    bg: "bg-comic-green",
  },
] as const;

export function QuickLinksPanel() {
  return (
    <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="QUICK LINKS" />

      <div className="grid gap-2 sm:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col gap-1 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/30 px-3 py-3 text-center transition-transform hover:scale-[1.02] ${link.bg}`}
          >
            <span
              className="font-[family-name:var(--font-bangers)] text-comic-black"
              style={{ fontSize: "var(--comic-text-sm)" }}
            >
              {link.label}
            </span>
            <span
              className="font-[family-name:var(--font-permanent-marker)] text-comic-black/50"
              style={{ fontSize: "var(--comic-body-xs)" }}
            >
              {link.desc} →
            </span>
          </Link>
        ))}
      </div>
    </ComicPanel>
  );
}
