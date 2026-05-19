// ScoutLab 기능 소개 패널 (정적)

import Link from "next/link";

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

const features = [
  { label: "RADAR", desc: "60+ metrics" },
  { label: "COMPARE", desc: "Head-to-head" },
  { label: "SCATTER", desc: "League-wide" },
] as const;

export function ScoutlabSpotlight() {
  return (
    <ComicPanel bg="green" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="SCOUTLAB" subtitle="PLAYER ANALYTICS" />

      <div className="space-y-2">
        {features.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/30 bg-comic-white px-3 py-2"
          >
            <span
              className="w-20 shrink-0 font-[family-name:var(--font-bangers)] text-comic-black"
              style={{ fontSize: "var(--comic-text-xs)" }}
            >
              {f.label}
            </span>
            <span
              className="font-[family-name:var(--font-permanent-marker)] text-comic-black/50"
              style={{ fontSize: "var(--comic-body-xs)" }}
            >
              {f.desc}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-center">
        <Link
          href="/scouting"
          className="inline-block rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-black px-4 py-2 font-[family-name:var(--font-bangers)] text-comic-green transition-transform hover:scale-105"
          style={{ fontSize: "var(--comic-text-sm)" }}
        >
          OPEN SCOUTLAB
        </Link>
      </div>
    </ComicPanel>
  );
}
