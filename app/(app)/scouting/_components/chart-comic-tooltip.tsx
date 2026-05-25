// ScoutLab 차트 공통 말풍선 Tooltip Shell (Client Component)
"use client";

import type { ReactNode } from "react";

interface ChartComicTooltipShellProps {
  children: ReactNode;
}

/** 코믹 말풍선 스타일 Tooltip 래퍼 — 각 차트에서 children으로 내용 주입 */
export function ChartComicTooltipShell({
  children,
}: ChartComicTooltipShellProps) {
  return (
    <div className="relative rounded-[4px] border-[3px] border-comic-black bg-comic-cream px-3 py-2 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black shadow-[2px_2px_0px_var(--color-comic-black)] dark:shadow-[2px_2px_0px_var(--color-comic-black)/0.4]">
      {children}
      {/* 아래쪽 삼각형 꼬리 */}
      <span
        aria-hidden
        className="absolute -bottom-[10px] left-4 size-0 border-x-[6px] border-t-[10px] border-x-transparent border-t-comic-black"
      />
      <span
        aria-hidden
        className="absolute -bottom-[6px] left-[10px] size-0 border-x-[5px] border-t-[8px] border-x-transparent border-t-comic-cream"
      />
    </div>
  );
}
