// 백분위 프로그레스 바

import { cn } from "@/lib/utils";

interface PercentileBarProps {
  percentile: number; // 0~100
}

export function PercentileBar({ percentile }: PercentileBarProps) {
  const barColor =
    percentile >= 90
      ? "bg-green-500"
      : percentile >= 70
        ? "bg-primary"
        : percentile >= 50
          ? "bg-yellow-500"
          : "bg-muted-foreground/50";

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={percentile}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`백분위 ${percentile}%`}
      >
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${percentile}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">
        {percentile}%
      </span>
    </div>
  );
}
