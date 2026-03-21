// 자동 갱신 인디케이터 — UI만 표시 (실제 폴링은 Phase 3 Task 017에서 구현)

import { RefreshCw } from "lucide-react";

export function AutoRefreshIndicator() {
  return (
    <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
      <RefreshCw className="size-3" />
      <span>60초마다 자동 갱신</span>
    </div>
  );
}
