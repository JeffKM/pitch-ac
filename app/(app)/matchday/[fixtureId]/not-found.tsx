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
        Match Not Found
      </p>
      <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
        The requested match doesn&apos;t exist or isn&apos;t available yet.
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
