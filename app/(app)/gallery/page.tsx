// 카툰 갤러리 페이지 — 경기 후 자동 생성된 카툰 카드 목록

import { ImageIcon } from "lucide-react";
import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "갤러리",
  description: "맨시티 카툰 갤러리 — 경기 하이라이트 카툰 카드",
};

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-3xl)] leading-[var(--comic-leading-snug)] tracking-[var(--comic-tracking-wide)] text-comic-black">
          갤러리
        </h1>
        <p className="mt-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] tracking-[var(--comic-tracking-wide)] text-comic-black/60">
          경기 하이라이트 카툰 카드 — 곧 공개됩니다
        </p>
      </div>

      <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow">
            <ImageIcon className="size-8 text-comic-black" />
          </div>
          <div className="space-y-1">
            <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
              카툰 갤러리 준비 중
            </p>
            <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/60">
              매치데이 카툰 카드, MVP 카드, 베스트 모먼트 카드가 곧 추가됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
