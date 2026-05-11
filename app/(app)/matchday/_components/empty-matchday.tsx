// 경기 없는 날짜 빈 상태

import { CalendarX2 } from "lucide-react";

import { formatFullDate } from "@/lib/date-utils";

interface EmptyMatchdayProps {
  date: string;
}

export function EmptyMatchday({ date }: EmptyMatchdayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-comic-black/50">
      <CalendarX2 className="size-10" />
      <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)]">
        {formatFullDate(date)}에 예정된 경기가 없습니다
      </p>
    </div>
  );
}
