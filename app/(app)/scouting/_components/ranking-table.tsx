// ScoutLab Ranking — 메트릭별 랭킹 테이블
import { cn } from "@/lib/utils";
import type { ScoutlabPlayer } from "@/types";

import { formatMetricValue } from "../_lib/format-metric";

interface RankingEntry {
  player: ScoutlabPlayer;
  value: number;
  percentile: number;
}

interface RankingTableProps {
  entries: RankingEntry[];
  metricLabel: string;
}

export function RankingTable({ entries, metricLabel }: RankingTableProps) {
  if (entries.length === 0) {
    return (
      <p className="py-10 text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/50">
        랭킹 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="ranking-table">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-comic-black/10 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
            <th className="px-2 py-2 text-left">#</th>
            <th className="px-2 py-2 text-left">선수</th>
            <th className="px-2 py-2 text-left">팀</th>
            <th className="px-2 py-2 text-left">포지션</th>
            <th className="px-2 py-2 text-right">{metricLabel}</th>
            <th className="px-2 py-2 text-right">백분위</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const rank = index + 1;
            return (
              <tr
                key={entry.player.id}
                className={cn(
                  "border-b border-comic-black/5",
                  rank <= 3 && "bg-comic-yellow/10",
                )}
                data-testid={`ranking-row-${rank}`}
              >
                <td className="px-2 py-2 font-[family-name:var(--font-bangers)] text-comic-black/50">
                  {rank}
                </td>
                <td className="px-2 py-2 font-medium text-comic-black">
                  {entry.player.name}
                </td>
                <td className="px-2 py-2 text-comic-black/60">
                  {entry.player.team}
                </td>
                <td className="px-2 py-2 text-comic-black/60">
                  {entry.player.position}
                </td>
                <td className="px-2 py-2 text-right font-[family-name:var(--font-permanent-marker)] text-comic-black tabular-nums">
                  {formatMetricValue(entry.value)}
                </td>
                <td className="px-2 py-2 text-right">
                  <PercentileBadge percentile={entry.percentile} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PercentileBadge({ percentile }: { percentile: number }) {
  const color =
    percentile >= 90
      ? "bg-comic-green/15 text-comic-green"
      : percentile >= 70
        ? "bg-comic-skyblue/15 text-comic-skyblue"
        : percentile >= 50
          ? "bg-comic-yellow/15 text-comic-yellow"
          : "bg-comic-black/5 text-comic-black/50";

  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] tabular-nums",
        color,
      )}
    >
      {percentile}%
    </span>
  );
}
