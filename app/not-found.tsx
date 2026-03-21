// 글로벌 404 페이지 — 존재하지 않는 경로 접근 시 표시

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <p className="text-xl font-semibold">페이지를 찾을 수 없습니다</p>
      <p className="text-sm text-muted-foreground">
        요청한 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Button variant="outline" asChild>
        <Link href="/matchday">
          <ChevronLeft className="size-4" />
          매치데이로 돌아가기
        </Link>
      </Button>
    </div>
  );
}
