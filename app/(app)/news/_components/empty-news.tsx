// 뉴스 빈 상태 UI

import { Newspaper } from "lucide-react";

export function EmptyNews() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-comic-black/50">
      <Newspaper className="size-10" />
      <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)]">
        아직 등록된 이적뉴스가 없습니다
      </p>
    </div>
  );
}
