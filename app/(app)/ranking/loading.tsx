// Ranking 페이지 로딩 스켈레톤

import { PageLoadingIndicator } from "@/components/page-loading-indicator";

export default function RankingLoading() {
  return (
    <div className="space-y-6">
      <PageLoadingIndicator />

      {/* 타이틀 스켈레톤 */}
      <div>
        <div className="h-8 w-32 animate-pulse rounded bg-comic-cream" />
        <div className="mt-1 h-4 w-40 animate-pulse rounded bg-comic-cream" />
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-cream"
          />
        ))}
      </div>

      {/* 테이블 행 스켈레톤 */}
      <div className="space-y-2">
        <div className="h-10 w-full animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-cream" />
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-cream"
          />
        ))}
      </div>
    </div>
  );
}
