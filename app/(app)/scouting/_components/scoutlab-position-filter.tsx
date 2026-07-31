"use client";

// ScoutLab 포지션 비교 그룹 선택기
// 선수의 백분위를 비교하는 대상 포지션 그룹을 선택

import { useRef } from "react";

import { cn } from "@/lib/utils";
import type { ScoutlabComparisonPosition } from "@/types";

import {
  COMPARISON_POSITION_LABELS,
  VALID_COMPARISON_POSITIONS,
} from "../_lib/scoutlab-constants";
import { useScoutlabParams } from "../_lib/use-scoutlab-params";

/** 비교 그룹 표시용 라벨 (짧은 형태) */
const SHORT_LABELS: Record<ScoutlabComparisonPosition, string> = {
  CB: "CB",
  FB: "FB",
  MF: "MF",
  "AM/W": "AM·W",
  FW: "FW",
};

export function ScoutlabPositionFilter() {
  const { comparisonPosition, setParams } = useScoutlabParams();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // 화살표 키로 라디오 옵션 이동 (roving tabindex)
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const total = VALID_COMPARISON_POSITIONS.length;
    const nextIndex = (index + delta + total) % total;
    const nextPos = VALID_COMPARISON_POSITIONS[nextIndex];
    setParams({ comparisonPosition: nextPos });
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="포지션 비교 그룹"
      className="flex flex-wrap gap-1"
    >
      {VALID_COMPARISON_POSITIONS.map((pos, index) => {
        const isActive = comparisonPosition === pos;

        return (
          <button
            key={pos}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            title={COMPARISON_POSITION_LABELS[pos]}
            onClick={() => setParams({ comparisonPosition: pos })}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "rounded-full px-3 py-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] transition-colors focus-visible:ring-2 focus-visible:ring-comic-black focus-visible:outline-none",
              isActive
                ? "bg-comic-black text-comic-white"
                : "bg-comic-cream text-comic-black/60 hover:bg-comic-black/10",
            )}
          >
            {SHORT_LABELS[pos]}
          </button>
        );
      })}
    </div>
  );
}
