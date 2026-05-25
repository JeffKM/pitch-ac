// 순위 테이블 컴포넌트 — 리그별 하이라이트 규칙 지원

import Image from "next/image";

import { PL_LEAGUE_ID } from "@/lib/constants/football";
import { cn } from "@/lib/utils";
import type { Team, TeamStanding } from "@/types";

type StandingsTableProps = {
  standings: TeamStanding[];
  teamRecord: Record<number, Team>;
  leagueId: number;
};

// ─── 리그별 순위 하이라이트 규칙 ───────────────────

type PositionZone =
  | "ucl"
  | "ucl-q"
  | "uel"
  | "uecl"
  | "relegation-po"
  | "relegation";

interface ZoneRule {
  zone: PositionZone;
  /** 해당 존에 속하는 순위 (포함) */
  positions: number[];
}

/**
 * 리그별 하이라이트 규칙 (2025/26 시즌 → 2026/27 유럽대항전 기준)
 * 출처: UEFA Access List, kassiesa.net/uefa/AccessList2025
 * - 잉글랜드/스페인: EPS(유럽 퍼포먼스 스팟)로 UCL 5장
 * - 이탈리아/독일: UCL 4장
 * - 프랑스: UCL 3장 + 예선 1장
 */
const LEAGUE_ZONE_RULES: Record<number, ZoneRule[]> = {
  // EPL: 1-5 UCL, 6 UEL, 7 UECL, 18-20 강등
  [PL_LEAGUE_ID]: [
    { zone: "ucl", positions: [1, 2, 3, 4, 5] },
    { zone: "uel", positions: [6] },
    { zone: "uecl", positions: [7] },
    { zone: "relegation", positions: [18, 19, 20] },
  ],
  // La Liga: 1-5 UCL, 6 UEL, 7 UECL, 18-20 강등
  2014: [
    { zone: "ucl", positions: [1, 2, 3, 4, 5] },
    { zone: "uel", positions: [6] },
    { zone: "uecl", positions: [7] },
    { zone: "relegation", positions: [18, 19, 20] },
  ],
  // Serie A: 1-4 UCL, 5 UEL, 6 UECL, 18-20 강등
  2019: [
    { zone: "ucl", positions: [1, 2, 3, 4] },
    { zone: "uel", positions: [5] },
    { zone: "uecl", positions: [6] },
    { zone: "relegation", positions: [18, 19, 20] },
  ],
  // Bundesliga: 1-4 UCL, 5 UEL, 6 UECL, 16 강등PO, 17-18 강등
  2002: [
    { zone: "ucl", positions: [1, 2, 3, 4] },
    { zone: "uel", positions: [5] },
    { zone: "uecl", positions: [6] },
    { zone: "relegation-po", positions: [16] },
    { zone: "relegation", positions: [17, 18] },
  ],
  // Ligue 1: 1-3 UCL, 4 UCL예선, 5 UEL, 6 UECL, 17 강등PO, 18 강등
  2015: [
    { zone: "ucl", positions: [1, 2, 3] },
    { zone: "ucl-q", positions: [4] },
    { zone: "uel", positions: [5] },
    { zone: "uecl", positions: [6] },
    { zone: "relegation-po", positions: [17] },
    { zone: "relegation", positions: [18] },
  ],
};

const ZONE_STYLES: Record<PositionZone, string> = {
  ucl: "border-l-2 border-l-blue-500",
  "ucl-q": "border-l-2 border-l-blue-300",
  uel: "border-l-2 border-l-orange-400",
  uecl: "border-l-2 border-l-green-500",
  "relegation-po": "border-l-2 border-l-red-300",
  relegation: "border-l-2 border-l-red-500",
};

function getPositionClass(position: number, leagueId: number): string {
  const rules = LEAGUE_ZONE_RULES[leagueId] ?? LEAGUE_ZONE_RULES[PL_LEAGUE_ID];
  for (const rule of rules) {
    if (rule.positions.includes(position)) {
      return ZONE_STYLES[rule.zone];
    }
  }
  return "";
}

// ─── 동적 범례 생성 ───────────────────────────────

interface LegendItem {
  label: string;
  colorClass: string;
}

function getLegendItems(leagueId: number): LegendItem[] {
  const rules = LEAGUE_ZONE_RULES[leagueId] ?? LEAGUE_ZONE_RULES[PL_LEAGUE_ID];
  const zones = new Set(rules.map((r) => r.zone));

  const items: LegendItem[] = [
    { label: "Champions League", colorClass: "bg-blue-500" },
  ];

  if (zones.has("ucl-q")) {
    items.push({ label: "UCL Qualifying", colorClass: "bg-blue-300" });
  }

  items.push({ label: "Europa League", colorClass: "bg-orange-400" });

  if (zones.has("uecl")) {
    items.push({
      label: "Conference League",
      colorClass: "bg-green-500",
    });
  }

  if (zones.has("relegation-po")) {
    items.push({
      label: "Relegation Play-off",
      colorClass: "bg-red-300",
    });
  }

  items.push({ label: "Relegation", colorClass: "bg-red-500" });

  return items;
}

// ─── 폼 뱃지 색상 ───────────────────────────────

function getFormColor(result: "W" | "D" | "L"): string {
  switch (result) {
    case "W":
      return "bg-green-500 text-white";
    case "D":
      return "bg-gray-400 text-white";
    case "L":
      return "bg-red-500 text-white";
  }
}

// ─── 컴포넌트 ─────────────────────────────────────

export function StandingsTable({
  standings,
  teamRecord,
  leagueId,
}: StandingsTableProps) {
  const sorted = [...standings].sort((a, b) => a.position - b.position);
  const legendItems = getLegendItems(leagueId);

  return (
    <div className="overflow-x-auto rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-comic-black border-b-[var(--comic-border-width)] bg-comic-cream font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-sm)] tracking-[var(--comic-tracking-normal)] text-comic-black/70">
            <th className="px-3 py-2 text-center">#</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-3 py-2 text-center">P</th>
            <th className="hidden px-3 py-2 text-center sm:table-cell">W</th>
            <th className="hidden px-3 py-2 text-center sm:table-cell">D</th>
            <th className="hidden px-3 py-2 text-center sm:table-cell">L</th>
            <th className="hidden px-3 py-2 text-center md:table-cell">GF</th>
            <th className="hidden px-3 py-2 text-center md:table-cell">GA</th>
            <th className="px-3 py-2 text-center">GD</th>
            <th className="px-3 py-2 text-center">Pts</th>
            <th className="hidden px-3 py-2 text-center lg:table-cell">Form</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const team = teamRecord[row.teamId];
            return (
              <tr
                key={row.teamId}
                className={cn(
                  "border-b border-comic-black/20 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black transition-colors hover:bg-comic-cream/50",
                  getPositionClass(row.position, leagueId),
                )}
              >
                <td className="px-3 py-2.5 text-center font-[family-name:var(--font-bangers)]">
                  {row.position}
                </td>
                <td className="px-3 py-2.5">
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
                <td className="px-3 py-2.5 text-center">{row.played}</td>
                <td className="hidden px-3 py-2.5 text-center sm:table-cell">
                  {row.won}
                </td>
                <td className="hidden px-3 py-2.5 text-center sm:table-cell">
                  {row.drawn}
                </td>
                <td className="hidden px-3 py-2.5 text-center sm:table-cell">
                  {row.lost}
                </td>
                <td className="hidden px-3 py-2.5 text-center md:table-cell">
                  {row.goalsFor}
                </td>
                <td className="hidden px-3 py-2.5 text-center md:table-cell">
                  {row.goalsAgainst}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {row.goalDifference > 0
                    ? `+${row.goalDifference}`
                    : row.goalDifference}
                </td>
                <td className="px-3 py-2.5 text-center font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-base)]">
                  {row.points}
                </td>
                <td className="hidden px-3 py-2.5 lg:table-cell">
                  <div className="flex items-center justify-center gap-0.5">
                    {row.form.slice(-5).map((result, i) => (
                      <span
                        key={i}
                        className={cn(
                          "flex size-5 items-center justify-center rounded-sm text-[10px] font-bold",
                          getFormColor(result),
                        )}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 동적 범례 */}
      <div className="flex flex-wrap gap-4 border-t border-comic-black/20 px-3 py-2 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
        {legendItems.map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <span className={cn("inline-block h-3 w-0.5", item.colorClass)} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
