"use client";

// ScoutLab Ranking — 메트릭별 랭킹 테이블
import { cn } from "@/lib/utils";
import type { ScoutlabLeague, ScoutlabPlayer } from "@/types";

import { formatMetricValue } from "../_lib/format-metric";
import { MetricPopover } from "./metric-popover";

/** 리그 약칭 매핑 */
const LEAGUE_SHORT: Record<ScoutlabLeague, string> = {
  "Premier League": "PL",
  "La Liga": "LL",
  "Serie A": "SA",
  Bundesliga: "BL",
  "Ligue 1": "L1",
};

interface RankingEntry {
  player: ScoutlabPlayer;
  value: number;
  percentile: number;
}

interface RankingTableProps {
  entries: RankingEntry[];
  metricLabel: string;
  metricKey?: string;
}

export function RankingTable({
  entries,
  metricLabel,
  metricKey,
}: RankingTableProps) {
  if (entries.length === 0) {
    return (
      <p className="py-10 text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/60">
        랭킹 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto" data-testid="ranking-table">
        <table className="w-full text-sm">
          <caption className="sr-only">
            {metricLabel} 기준 선수 랭킹 — 순위, 선수, 팀, 리그, 포지션, 지표값,
            백분위
          </caption>
          <thead>
            <tr className="border-b border-comic-black/10 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/60">
              <th scope="col" className="px-2 py-2 text-left">
                #
              </th>
              <th scope="col" className="px-2 py-2 text-left">
                선수
              </th>
              <th scope="col" className="px-2 py-2 text-left">
                팀
              </th>
              <th scope="col" className="px-2 py-2 text-left">
                리그
              </th>
              <th scope="col" className="px-2 py-2 text-left">
                포지션
              </th>
              <th scope="col" className="px-2 py-2 text-right">
                <span className="inline-flex items-center gap-0.5">
                  {metricLabel}
                  {metricKey && <MetricPopover metricKey={metricKey} />}
                </span>
              </th>
              <th scope="col" className="px-2 py-2 text-right">
                백분위
              </th>
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
                  <td className="px-2 py-2 font-[family-name:var(--font-bangers)] text-comic-black/60">
                    {rank}
                  </td>
                  <td className="px-2 py-2 font-medium text-comic-black">
                    {entry.player.name}
                  </td>
                  <td className="px-2 py-2 text-comic-black/60">
                    {entry.player.team}
                  </td>
                  <td className="px-2 py-2 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/60">
                    {LEAGUE_SHORT[entry.player.league]}
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
      {/* 모바일 등 좁은 화면에서 지표값·백분위 컬럼이 화면 밖으로 넘칠 때의 스크롤 어포던스 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-comic-white to-transparent"
      />
    </div>
  );
}

function PercentileBadge({ percentile }: { percentile: number }) {
  const color =
    percentile >= 90
      ? "bg-comic-green/15 text-comic-green-text"
      : percentile >= 70
        ? "bg-comic-skyblue/15 text-comic-skyblue-text"
        : percentile >= 50
          ? "bg-comic-yellow/15 text-comic-yellow-text"
          : "bg-comic-black/5 text-comic-black/60";

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
