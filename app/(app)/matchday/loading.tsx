// 매치데이 페이지 로딩 스켈레톤

import { FixtureCardSkeleton } from "./_components/fixture-card-skeleton";

export default function MatchdayLoading() {
  return (
    <div className="space-y-8">
      {/* GW 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="size-9 animate-pulse rounded-md bg-comic-cream" />
        <div className="space-y-2 text-center">
          <div className="mx-auto h-7 w-36 animate-pulse rounded bg-comic-cream" />
          <div className="mx-auto h-4 w-48 animate-pulse rounded bg-comic-cream" />
        </div>
        <div className="size-9 animate-pulse rounded-md bg-comic-cream" />
      </div>

      {/* 날짜 그룹 스켈레톤 × 2 */}
      {[0, 1].map((groupIdx) => (
        <div key={groupIdx} className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-comic-cream" />
          {[0, 1, 2].map((cardIdx) => (
            <FixtureCardSkeleton key={cardIdx} />
          ))}
        </div>
      ))}
    </div>
  );
}
