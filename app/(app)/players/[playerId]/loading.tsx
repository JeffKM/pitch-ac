// 선수 프로필 페이지 로딩 스켈레톤

export default function PlayerProfileLoading() {
  return (
    <div className="space-y-6">
      {/* 헤더 카드 스켈레톤 */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="size-28 animate-pulse rounded-full bg-muted" />
          <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-6 w-12 animate-pulse rounded-full bg-muted" />
              <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="h-9 w-14 animate-pulse rounded bg-muted" />
              <div className="space-y-1">
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 시즌 스탯 그리드 스켈레톤 */}
      <div>
        <div className="mb-3 h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="space-y-3">
                <div className="h-3 w-14 animate-pulse rounded bg-muted" />
                <div className="h-7 w-16 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 폼 스파크라인 스켈레톤 */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-[120px] animate-pulse rounded bg-muted" />
      </div>

      {/* 버튼 스켈레톤 */}
      <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
    </div>
  );
}
