// 경기를 찾을 수 없을 때 표시할 not-found UI

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function FixtureDetailNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-3xl)] text-comic-black/50">
        404
      </p>
      <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)]">
        경기를 찾을 수 없습니다
      </p>
      <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
        요청한 경기 정보가 존재하지 않거나 아직 준비 중입니다.
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
