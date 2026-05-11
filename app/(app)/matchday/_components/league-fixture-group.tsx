// 리그별 경기 그룹 래퍼

import type { ReactNode } from "react";

interface LeagueFixtureGroupProps {
  shortName: string;
  country: string;
  children: ReactNode;
}

export function LeagueFixtureGroup({
  shortName,
  country,
  children,
}: LeagueFixtureGroupProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-base)] tracking-[var(--comic-tracking-wide)] text-comic-black">
          {shortName}
        </h2>
        <span className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/40">
          {country}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
