"use client";

// ScoutLab Compare — 메트릭 나란히 비교 테이블
import { cn } from "@/lib/utils";
import type {
  ScoutlabCategory,
  ScoutlabCategoryMetrics,
  ScoutlabMetrics,
} from "@/types";
import { SCOUTLAB_CATEGORY_LABELS } from "@/types";

import { formatMetricLabel, formatMetricValue } from "../_lib/format-metric";
import { MetricPopover } from "./metric-popover";

interface MetricCompareTableProps {
  metricsA: ScoutlabMetrics;
  metricsB: ScoutlabMetrics;
  playerAName: string;
  playerBName: string;
}

const COMPARE_CATEGORIES: Array<{
  key: ScoutlabCategory;
  prop: keyof ScoutlabMetrics;
}> = [
  { key: "final_product", prop: "finalProduct" },
  { key: "shooting", prop: "shooting" },
  { key: "creation", prop: "creation" },
  { key: "passing", prop: "passing" },
  { key: "ball_carrying", prop: "ballCarrying" },
  { key: "defending", prop: "defending" },
  { key: "set_pieces", prop: "setPieces" },
  { key: "aerial", prop: "aerial" },
  { key: "possession", prop: "possession" },
  { key: "vaep_overview", prop: "vaepOverview" },
];

export function MetricCompareTable({
  metricsA,
  metricsB,
  playerAName,
  playerBName,
}: MetricCompareTableProps) {
  return (
    <div className="space-y-4" data-testid="metric-compare-table">
      {COMPARE_CATEGORIES.map(({ key, prop }) => {
        const catA = metricsA[prop] as ScoutlabCategoryMetrics;
        const catB = metricsB[prop] as ScoutlabCategoryMetrics;
        if (!catA && !catB) return null;

        const allKeys = new Set([
          ...Object.keys(catA ?? {}),
          ...Object.keys(catB ?? {}),
        ]);

        return (
          <div key={key}>
            <h4 className="mb-2 font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-lg)] text-comic-black">
              {SCOUTLAB_CATEGORY_LABELS[key]}
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-comic-black/10 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
                  <th className="w-1/4 truncate px-2 py-1.5 text-right">
                    {playerAName}
                  </th>
                  <th className="px-2 py-1.5 text-center">메트릭</th>
                  <th className="w-1/4 truncate px-2 py-1.5 text-left">
                    {playerBName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...allKeys].map((metricKey) => {
                  const valA = catA?.[metricKey];
                  const valB = catB?.[metricKey];
                  const aWins =
                    valA && valB ? valA.percentile > valB.percentile : false;
                  const bWins =
                    valA && valB ? valB.percentile > valA.percentile : false;

                  return (
                    <tr
                      key={metricKey}
                      className="border-b border-comic-black/5"
                    >
                      <td
                        className={cn(
                          "px-2 py-1.5 text-right tabular-nums",
                          aWins
                            ? "font-bold text-comic-skyblue"
                            : "text-comic-black/70",
                        )}
                      >
                        {valA
                          ? `${formatMetricValue(valA.value)} (${valA.percentile}%)`
                          : "–"}
                      </td>
                      <td className="px-2 py-1.5 text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/60">
                        <span className="inline-flex items-center gap-0.5">
                          {formatMetricLabel(metricKey)}
                          <MetricPopover metricKey={metricKey} />
                        </span>
                      </td>
                      <td
                        className={cn(
                          "px-2 py-1.5 text-left tabular-nums",
                          bWins
                            ? "font-bold text-comic-pink"
                            : "text-comic-black/70",
                        )}
                      >
                        {valB
                          ? `${formatMetricValue(valB.value)} (${valB.percentile}%)`
                          : "–"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
