// 매치데이 페이지 로딩 스켈레톤

import { PageLoadingIndicator } from "@/components/page-loading-indicator";

import { FixtureCardSkeleton } from "./_components/fixture-card-skeleton";

export default function MatchdayLoading() {
  return (
    <div className="space-y-8">
      <PageLoadingIndicator />
      {/* 날짜 스트립 스켈레톤 */}
      <div className="flex items-center gap-1">
        <div className="size-8 shrink-0 animate-pulse rounded-md bg-comic-cream" />
        <div className="flex flex-1 gap-1 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-12 w-14 shrink-0 animate-pulse rounded-md bg-comic-cream"
            />
          ))}
        </div>
        <div className="size-8 shrink-0 animate-pulse rounded-md bg-comic-cream" />
      </div>

      {/* 리그 그룹 스켈레톤 × 2 */}
      {[0, 1].map((groupIdx) => (
        <div key={groupIdx} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 animate-pulse rounded bg-comic-cream" />
            <div className="h-3 w-12 animate-pulse rounded bg-comic-cream" />
          </div>
          {[0, 1, 2].map((cardIdx) => (
            <FixtureCardSkeleton key={cardIdx} />
          ))}
        </div>
      ))}
    </div>
  );
}
