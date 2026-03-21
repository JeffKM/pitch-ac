// 백분위 프로그레스 바

import { cn } from "@/lib/utils";

interface PercentileBarProps {
  percentile: number; // 0~100
}

export function PercentileBar({ percentile }: PercentileBarProps) {
  const clamped = Math.max(0, Math.min(100, percentile));
  const barColor =
    clamped >= 90
      ? "bg-green-500"
      : clamped >= 70
        ? "bg-primary"
        : clamped >= 50
          ? "bg-yellow-500"
          : "bg-muted-foreground/50";

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`백분위 ${clamped}%`}
      >
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">
        {clamped}%
      </span>
    </div>
  );
}
