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

      {/* 2패널 스켈레톤 */}
      <div className="mt-[var(--comic-panel-gap)] grid gap-[var(--comic-panel-gap)] md:grid-cols-2">
        <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
          <ComicPanelTitle title="TODAY'S MATCHES" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-black/5"
              />
            ))}
          </div>
        </ComicPanel>
        <ComicPanel bg="cream" className="p-[var(--comic-panel-padding)]">
          <ComicPanelTitle title="LEAGUE LEADERS" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-black/5"
              />
            ))}
          </div>
        </ComicPanel>
      </div>
    </main>
  );
}
