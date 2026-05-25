import type { Metadata } from "next";
import { Suspense } from "react";

import { ScoutingTabNav } from "./_components/scouting-tab-nav";

export const metadata: Metadata = {
  title: "Scouting | pitch-ac",
  description: "Big 5 리그 선수 고급 메트릭 스카우팅 플랫폼",
};

export default function ScoutingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* 수평 탭 바: 모바일 전용 (데스크탑은 사이드바 SCOUTING 그룹 사용) */}
      <div className="md:hidden">
        <Suspense fallback={<TabNavSkeleton />}>
          <ScoutingTabNav />
        </Suspense>
      </div>
      {children}
    </div>
  );
}

/** useSearchParams의 Suspense boundary용 스켈레톤 */
function TabNavSkeleton() {
  return (
    <nav className="mb-6 overflow-x-auto border-b border-comic-black/10">
      <div className="flex min-w-max gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 animate-pulse rounded bg-muted px-3 py-2"
          />
        ))}
      </div>
    </nav>
  );
}
