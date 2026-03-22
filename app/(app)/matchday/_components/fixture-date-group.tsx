// 날짜별 경기 그룹 래퍼

import type { ReactNode } from "react";

interface FixtureDateGroupProps {
  dateLabel: string;
  children: ReactNode;
}

export function FixtureDateGroup({
  dateLabel,
  children,
}: FixtureDateGroupProps) {
  return (
    <section className="space-y-3">
      <h2 className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/60">
        {dateLabel}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
