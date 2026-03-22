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
        <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold text-primary">
          갤러리
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          경기 하이라이트 카툰 카드 — 곧 공개됩니다
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <ImageIcon className="size-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-[family-name:var(--font-fredoka)] text-lg font-semibold">
              카툰 갤러리 준비 중
            </p>
            <p className="text-sm text-muted-foreground">
              매치데이 카툰 카드, MVP 카드, 베스트 모먼트 카드가 곧 추가됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
