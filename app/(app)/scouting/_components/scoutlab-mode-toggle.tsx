"use client";

// ScoutLab P90/Total + PAdj./Raw 모드 토글

import { cn } from "@/lib/utils";
import type { ScoutlabAdjustment, ScoutlabMode } from "@/types";

import { useScoutlabParams } from "../_lib/use-scoutlab-params";

interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

const MODE_OPTIONS: ToggleOption<ScoutlabMode>[] = [
  { value: "per90", label: "P90" },
  { value: "total", label: "Total" },
];

const ADJUSTMENT_OPTIONS: ToggleOption<ScoutlabAdjustment>[] = [
  { value: "padj", label: "PAdj." },
  { value: "raw", label: "Raw" },
];

export function ScoutlabModeToggle() {
  const { mode, adjustment, setParams } = useScoutlabParams();

  return (
    <div className="flex items-center gap-3">
      <SegmentedToggle
        options={MODE_OPTIONS}
        value={mode}
        onChange={(v) => setParams({ mode: v })}
        label="수치 모드"
      />
      <SegmentedToggle
        options={ADJUSTMENT_OPTIONS}
        value={adjustment}
        onChange={(v) => setParams({ adjustment: v })}
        label="보정 모드"
      />
    </div>
  );
}

/** 세그먼트 토글 공통 컴포넌트 */
function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex overflow-hidden rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] transition-colors",
            value === opt.value
              ? "bg-comic-skyblue text-white"
              : "bg-comic-white text-comic-black/60 hover:bg-comic-cream",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
