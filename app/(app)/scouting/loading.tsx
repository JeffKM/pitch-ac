// Scouting 페이지 로딩 스켈레톤

import { PageLoadingIndicator } from "@/components/page-loading-indicator";

export default function ScoutingLoading() {
  return (
    <div className="space-y-6">
      <PageLoadingIndicator />
      {/* 필터 바 스켈레톤 */}
      <div className="flex flex-wrap gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-9 w-32 animate-pulse rounded-md bg-comic-cream"
          />
        ))}
      </div>

      {/* 선수 정보 헤더 스켈레톤 */}
      <div className="flex items-center gap-4">
        <div className="size-16 animate-pulse rounded-full bg-comic-cream" />
        <div className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-comic-cream" />
          <div className="h-4 w-28 animate-pulse rounded bg-comic-cream" />
        </div>
      </div>

      {/* 메트릭 바 스켈레톤 */}
      <div className="space-y-3">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-36 animate-pulse rounded bg-comic-cream" />
            <div className="h-3 flex-1 animate-pulse rounded-full bg-comic-cream" />
            <div className="h-4 w-10 animate-pulse rounded bg-comic-cream" />
          </div>
        ))}
      </div>
    </div>
  );
}
