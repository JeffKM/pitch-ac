// 홈 화면 로딩 스켈레톤 — [경기|뉴스] + 리그 순위 + 베스트 XI

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

export function HomeContentSkeleton() {
  return (
    <main className="mx-auto max-w-5xl p-[var(--comic-panel-padding)]">
      {/* 2패널 스켈레톤: 경기 | 뉴스 */}
      <div className="grid gap-[var(--comic-panel-gap)] md:grid-cols-2">
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

        {/* 뉴스 패널 */}
        <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
          <ComicPanelTitle title="NEWS" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-black/5"
              />
            ))}
          </div>
        </ComicPanel>
      </div>

      {/* 순위 테이블 스켈레톤 */}
      <div className="mt-[var(--comic-panel-gap)]">
        <ComicPanel bg="cream" className="p-[var(--comic-panel-padding)]">
          <ComicPanelTitle title="LEAGUE TABLE" />
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-6 w-12 animate-pulse rounded-[var(--comic-panel-radius)] bg-comic-black/10"
              />
            ))}
          </div>
          <div className="space-y-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded bg-comic-black/5"
              />
            ))}
          </div>
        </ComicPanel>
      </div>

      {/* 베스트 XI 스켈레톤 */}
      <div className="mt-[var(--comic-panel-gap)]">
        <ComicPanel bg="skyblue" className="p-[var(--comic-panel-padding)]">
          <ComicPanelTitle title="BEST XI" />
          <div className="h-24 animate-pulse rounded bg-comic-black/5" />
        </ComicPanel>
      </div>
    </main>
  );
}
