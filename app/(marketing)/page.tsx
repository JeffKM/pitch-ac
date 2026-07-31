import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { AppHeader } from "@/components/nav/app-header";

import { ComicFooter } from "./_components/comic-footer";
import { HomeContent } from "./_components/home-content";
import { HomeContentSkeleton } from "./_components/home-content-skeleton";

export default function HomePage() {
  return (
    <div className="min-h-screen paper-texture">
      <AppHeader
        authSlot={
          <Suspense>
            <AuthButton />
          </Suspense>
        }
      />
      {/* 페이지 대표 제목 — 시각적으로는 숨기고 스크린리더/문서 개요용으로 제공 */}
      <h1 className="sr-only">
        pitch-ac — 유럽 5대 리그 경기·순위·선수 데이터 대시보드
      </h1>
      <Suspense fallback={<HomeContentSkeleton />}>
        <HomeContent />
      </Suspense>
      <ComicFooter />
    </div>
  );
}
