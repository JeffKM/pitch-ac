"use client";

// ScoutLab 개별 메트릭 행 (팝오버 포함)
import { PercentileBar } from "@/components/percentile-bar";

import { MetricPopover } from "./metric-popover";

interface MetricRowProps {
  metricKey: string;
  name: string;
  brief: string | null;
  value: string;
  percentile: number;
}

export function MetricRow({
  metricKey,
  name,
  brief,
  value,
  percentile,
}: MetricRowProps) {
  return (
    <div className="grid grid-cols-[1fr_60px_1fr] items-center gap-2">
      <span className="flex min-w-0 items-center gap-1">
        <span className="truncate font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/70">
          {name}
        </span>
        {brief && (
          <span className="hidden shrink-0 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/40 sm:inline">
            {brief}
          </span>
        )}
        <MetricPopover metricKey={metricKey} />
      </span>
      <span className="text-right font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black tabular-nums">
        {value}
      </span>
      <PercentileBar percentile={percentile} />
    </div>
  );
}
