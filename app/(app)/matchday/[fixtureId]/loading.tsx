// 경기 상세 페이지 로딩 스켈레톤

export default function FixtureDetailLoading() {
  return (
    <div className="space-y-4">
      {/* 헤더 스켈레톤 */}
      <div className="rounded-xl bg-comic-white p-6">
        {/* GW + 날짜 */}
        <div className="mb-4 flex justify-center">
          <div className="h-4 w-32 animate-pulse rounded bg-comic-cream" />
        </div>
        {/* 양팀 + 스코어 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="size-16 animate-pulse rounded-full bg-comic-cream" />
            <div className="h-4 w-24 animate-pulse rounded bg-comic-cream" />
            <div className="h-3 w-16 animate-pulse rounded bg-comic-cream" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-24 animate-pulse rounded bg-comic-cream" />
            <div className="h-6 w-16 animate-pulse rounded bg-comic-cream" />
          </div>
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="size-16 animate-pulse rounded-full bg-comic-cream" />
            <div className="h-4 w-24 animate-pulse rounded bg-comic-cream" />
            <div className="h-3 w-16 animate-pulse rounded bg-comic-cream" />
          </div>
        </div>
      </div>

      {/* 탭 스켈레톤 */}
      <div className="rounded-xl bg-comic-white p-1">
        <div className="flex gap-1">
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-comic-cream" />
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-comic-cream" />
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-comic-cream" />
        </div>
      </div>

      {/* 탭 콘텐츠 스켈레톤 */}
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-xl bg-comic-cream" />
        <div className="h-48 animate-pulse rounded-xl bg-comic-cream" />
        <div className="h-24 animate-pulse rounded-xl bg-comic-cream" />
      </div>
    </div>
  );
}
