// 스켈레톤 상단 로딩 인디케이터 — 스피너 + "Loading..." 텍스트

import { Loader2 } from "lucide-react";

export function PageLoadingIndicator() {
  return (
    <div className="flex items-center gap-2 text-comic-black/50">
      <Loader2 className="size-4 animate-spin" />
      <span className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)]">
        Loading...
      </span>
    </div>
  );
}
