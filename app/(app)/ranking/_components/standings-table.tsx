// EPL 순위 테이블 컴포넌트

import Image from "next/image";

import { cn } from "@/lib/utils";
import type { Team, TeamStanding } from "@/types";

type StandingsTableProps = {
  standings: TeamStanding[];
  teamMap: Map<number, Team>;
};

// 순위별 배경색 (챔피언스리그, 유로파, 강등권)
function getPositionClass(position: number): string {
  if (position <= 4) return "border-l-2 border-l-blue-500";
  if (position === 5) return "border-l-2 border-l-orange-400";
  if (position >= 18) return "border-l-2 border-l-red-500";
  return "";
}

// 폼 뱃지 색상
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

export function StandingsTable({ standings, teamMap }: StandingsTableProps) {
  // position 오름차순 정렬
  const sorted = [...standings].sort((a, b) => a.position - b.position);

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
            const team = teamMap.get(row.teamId);
            return (
              <tr
                key={row.teamId}
                className={cn(
                  "border-b border-comic-black/20 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black transition-colors hover:bg-comic-cream/50",
                  getPositionClass(row.position),
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

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 border-t border-comic-black/20 px-3 py-2 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-0.5 bg-blue-500" /> Champions
          League
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-0.5 bg-orange-400" /> Europa
          League
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-0.5 bg-red-500" /> Relegation
        </span>
      </div>
    </div>
  );
}
