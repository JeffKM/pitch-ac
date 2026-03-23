// 경기 없는 게임위크 빈 상태

import { CalendarX2 } from "lucide-react";

export function EmptyGameweek() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-comic-black/50">
      <CalendarX2 className="size-10" />
      <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)]">
        이 게임위크에 경기 데이터가 없습니다
      </p>
    </div>
  );
}
