// ScoutLab 메트릭 컨텍스트 서브타이틀
// "PERCENTILE VS [POSITION] · BIG 5 LEAGUES · PER 90 MINUTES"

import type {
  ScoutlabAdjustment,
  ScoutlabComparisonPosition,
  ScoutlabMode,
} from "@/types";

import { COMPARISON_POSITION_LABELS } from "../_lib/scoutlab-constants";

interface MetricContextSubtitleProps {
  comparisonPosition: ScoutlabComparisonPosition;
  mode: ScoutlabMode;
  adjustment: ScoutlabAdjustment;
}

export function MetricContextSubtitle({
  comparisonPosition,
  mode,
  adjustment,
}: MetricContextSubtitleProps) {
  const posLabel = COMPARISON_POSITION_LABELS[comparisonPosition];
  const modeLabel = mode === "per90" ? "PER 90 MINUTES" : "TOTAL";
  const adjLabel = adjustment === "padj" ? "POSS. ADJ." : "RAW";

  return (
    <p
      data-testid="metric-context-subtitle"
      className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] tracking-wider text-comic-black/40 uppercase"
    >
      PERCENTILE VS {posLabel} · BIG 5 LEAGUES · {modeLabel} · {adjLabel}
    </p>
  );
}
