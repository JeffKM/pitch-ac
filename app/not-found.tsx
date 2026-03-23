// 글로벌 404 페이지 — 존재하지 않는 경로 접근 시 표시

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-5xl)] text-comic-black/50">
        404
      </p>
      <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xl)]">
        Page Not Found
      </p>
      <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
        The requested page doesn&apos;t exist or has been moved.
      </p>
      <Button variant="outline" asChild>
        <Link href="/matchday">
          <ChevronLeft className="size-4" />
          Back to Matchday
        </Link>
      </Button>
    </div>
  );
}
