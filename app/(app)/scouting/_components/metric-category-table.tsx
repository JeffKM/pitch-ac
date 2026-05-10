// ScoutLab 카테고리별 메트릭 테이블 + 백분위 바
import { PercentileBar } from "@/components/percentile-bar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  ScoutlabCategory,
  ScoutlabCategoryMetrics,
  ScoutlabMetrics,
} from "@/types";
import { SCOUTLAB_CATEGORY_LABELS } from "@/types";

import { formatMetricName, formatMetricValue } from "../_lib/format-metric";

interface MetricCategoryTableProps {
  metrics: ScoutlabMetrics;
}

// 카테고리 키 → camelCase 프로퍼티 매핑
const CATEGORY_KEY_MAP: Record<ScoutlabCategory, keyof ScoutlabMetrics> = {
  final_product: "finalProduct",
  shooting: "shooting",
  creation: "creation",
  passing: "passing",
  ball_carrying: "ballCarrying",
  defending: "defending",
  set_pieces: "setPieces",
  aerial: "aerial",
  possession: "possession",
  vaep_overview: "vaepOverview",
  misc: "misc",
};

const CATEGORIES: ScoutlabCategory[] = [
  "final_product",
  "shooting",
  "creation",
  "passing",
  "ball_carrying",
  "defending",
  "set_pieces",
  "aerial",
  "possession",
  "vaep_overview",
  "misc",
];

export function MetricCategoryTable({ metrics }: MetricCategoryTableProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={["final_product", "shooting", "creation"]}
      className="space-y-2"
    >
      {CATEGORIES.map((category) => {
        const propKey = CATEGORY_KEY_MAP[category];
        const categoryMetrics = metrics[propKey] as ScoutlabCategoryMetrics;

        if (!categoryMetrics || Object.keys(categoryMetrics).length === 0) {
          return null;
        }

        // 카테고리 평균 백분위 계산
        const entries = Object.entries(categoryMetrics);
        const avgPercentile = Math.round(
          entries.reduce((sum, [, m]) => sum + m.percentile, 0) /
            entries.length,
        );

        return (
          <AccordionItem
            key={category}
            value={category}
            className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/10 bg-comic-white px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex w-full items-center gap-3 pr-2">
                <span className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black">
                  {SCOUTLAB_CATEGORY_LABELS[category]}
                </span>
                <span className="ml-auto font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/40">
                  avg {avgPercentile}%
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1.5 pb-2">
                {entries.map(([metricKey, metricVal]) => (
                  <MetricRow
                    key={metricKey}
                    name={formatMetricName(metricKey)}
                    value={formatMetricValue(metricVal.value)}
                    percentile={metricVal.percentile}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

/** 개별 메트릭 행 */
function MetricRow({
  name,
  value,
  percentile,
}: {
  name: string;
  value: string;
  percentile: number;
}) {
  return (
    <div className="grid grid-cols-[1fr_60px_1fr] items-center gap-2">
      <span className="truncate font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/70">
        {name}
      </span>
      <span className="text-right font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black tabular-nums">
        {value}
      </span>
      <PercentileBar percentile={percentile} />
    </div>
  );
}
