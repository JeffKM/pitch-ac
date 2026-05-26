// 뉴스 카드 로딩 스켈레톤

import { Card, CardContent } from "@/components/ui/card";

export function NewsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-5 w-16 rounded-full bg-comic-cream" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-comic-cream" />
                <div className="h-3 w-1/2 rounded bg-comic-cream" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
