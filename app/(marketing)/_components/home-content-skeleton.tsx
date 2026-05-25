// 홈 화면 로딩 스켈레톤

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

export function HomeContentSkeleton() {
  return (
    <main className="mx-auto max-w-5xl p-[var(--comic-panel-padding)]">
      {/* 히어로 스켈레톤 */}
      <ComicPanel bg="skyblue" className="p-[var(--comic-panel-padding)]">
        <div className="h-8 w-48 animate-pulse rounded bg-comic-black/10" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded bg-comic-black/10" />
        <div className="mt-4 h-12 w-40 animate-pulse rounded bg-comic-black/10" />
      </ComicPanel>

      {/* 2패널 스켈레톤: 경기 | 순위 */}
      <div className="mt-[var(--comic-panel-gap)] grid gap-[var(--comic-panel-gap)] md:grid-cols-2">
        {/* 경기 패널 */}
        <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
          <ComicPanelTitle title="MATCHES" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-black/5"
              />
            ))}
          </div>
        </ComicPanel>

        {/* 순위 패널 */}
        <ComicPanel bg="cream" className="p-[var(--comic-panel-padding)]">
          <ComicPanelTitle title="LEAGUE TABLE" />
          {/* 탭 스켈레톤 */}
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-6 w-12 animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-black/10"
              />
            ))}
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-black/5"
              />
            ))}
          </div>
        </ComicPanel>
      </div>

      {/* 퀵 링크 스켈레톤 */}
      <div className="mt-[var(--comic-panel-gap)]">
        <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
          <ComicPanelTitle title="QUICK LINKS" />
          <div className="grid gap-2 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-black/5"
              />
            ))}
          </div>
        </ComicPanel>
      </div>
    </main>
  );
}
