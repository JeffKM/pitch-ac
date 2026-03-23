// 경기 카드 스켈레톤 (로딩 상태)

import { Card, CardContent } from "@/components/ui/card";

export function FixtureCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* 홈팀 */}
          <div className="flex flex-1 items-center gap-3">
            <div className="size-10 rounded-full bg-comic-cream" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 rounded bg-comic-cream" />
              <div className="h-3 w-12 rounded bg-comic-cream" />
            </div>
          </div>

          {/* 스코어/배지 영역 */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-7 w-16 rounded bg-comic-cream" />
            <div className="h-5 w-10 rounded bg-comic-cream" />
          </div>

          {/* 어웨이팀 */}
          <div className="flex flex-1 flex-row-reverse items-center gap-3">
            <div className="size-10 rounded-full bg-comic-cream" />
            <div className="space-y-1.5 text-right">
              <div className="h-4 w-24 rounded bg-comic-cream" />
              <div className="h-3 w-12 rounded bg-comic-cream" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
