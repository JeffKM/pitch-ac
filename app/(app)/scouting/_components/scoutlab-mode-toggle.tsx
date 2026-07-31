"use client";

// ScoutLab P90/Total + PAdj./Raw 모드 토글

import { useRef } from "react";

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
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // 화살표 키로 라디오 옵션 이동 (roving tabindex)
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + delta + options.length) % options.length;
    const nextOption = options[nextIndex];
    onChange(nextOption.value);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex overflow-hidden rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20"
    >
      {options.map((opt, index) => (
        <button
          key={opt.value}
          ref={(el) => {
            buttonRefs.current[index] = el;
          }}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          tabIndex={value === opt.value ? 0 : -1}
          onClick={() => onChange(opt.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className={cn(
            "px-3 py-1.5 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] transition-colors focus-visible:ring-2 focus-visible:ring-comic-black focus-visible:outline-none",
            value === opt.value
              ? "bg-comic-skyblue text-comic-black"
              : "bg-comic-white text-comic-black/60 hover:bg-comic-cream",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
