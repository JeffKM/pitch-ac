// 비교 페이지 로딩 스켈레톤

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CompareLoading() {
  return (
    <div className="space-y-6">
      {/* 제목 스켈레톤 */}
      <div className="h-9 w-32 animate-pulse rounded bg-muted" />

      {/* 선수 선택 슬롯 2개 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 빈 상태 안내 스켈레톤 */}
      <div className="flex justify-center py-12">
        <div className="h-5 w-64 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
