// 경기 없는 게임위크 빈 상태

import { CalendarX2 } from "lucide-react";

export function EmptyGameweek() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <CalendarX2 className="size-10" />
      <p className="text-sm">이 게임위크에 경기 데이터가 없습니다</p>
    </div>
  );
}
