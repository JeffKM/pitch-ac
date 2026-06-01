// News 페이지 로딩 스켈레톤

import { PageLoadingIndicator } from "@/components/page-loading-indicator";

export default function NewsLoading() {
  return (
    <div className="space-y-6">
      <PageLoadingIndicator />

      {/* 타이틀 스켈레톤 */}
      <div>
        <div className="h-8 w-44 animate-pulse rounded bg-comic-cream" />
        <div className="mt-1 h-4 w-36 animate-pulse rounded bg-comic-cream" />
      </div>

      {/* 뉴스 카드 스켈레톤 */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-cream"
          />
        ))}
      </div>
    </div>
  );
}
