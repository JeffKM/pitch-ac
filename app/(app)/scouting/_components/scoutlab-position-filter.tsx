"use client";

// ScoutLab 포지션 세그먼트 필터

import { cn } from "@/lib/utils";
import type { ScoutlabPosition } from "@/types";

import { useScoutlabParams } from "../_lib/use-scoutlab-params";

const POSITIONS: { value: ScoutlabPosition | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CB", label: "CB" },
  { value: "FB", label: "FB" },
  { value: "MF", label: "MF" },
  { value: "AM", label: "AM" },
  { value: "W", label: "W" },
  { value: "FW", label: "FW" },
];

export function ScoutlabPositionFilter() {
  const { position, setParams } = useScoutlabParams();

  return (
    <div
      role="radiogroup"
      aria-label="포지션 필터"
      className="flex flex-wrap gap-1"
    >
      {POSITIONS.map((pos) => {
        const isActive =
          pos.value === "ALL" ? position === null : position === pos.value;

        return (
          <button
            key={pos.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() =>
              setParams({
                position: pos.value === "ALL" ? null : pos.value,
              })
            }
            className={cn(
              "rounded-full px-3 py-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] transition-colors",
              isActive
                ? "bg-comic-black text-comic-white"
                : "bg-comic-cream text-comic-black/60 hover:bg-comic-black/10",
            )}
          >
            {pos.label}
          </button>
        );
      })}
    </div>
  );
}
