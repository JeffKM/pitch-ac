import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { MobileTabBar } from "@/components/nav/mobile-tab-bar";
import { MobileTopBar } from "@/components/nav/mobile-top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* 데스크탑 사이드바 */}
        <Suspense>
          <AppSidebar />
        </Suspense>

        {/*
          메인 영역 — SidebarInset(<main>) 대신 div를 사용한다.
          마케팅 페이지 본문이 자체 <main> 랜드마크를 렌더하므로
          여기서 <main>을 한 번 더 감싸면 랜드마크가 중첩된다.
        */}
        <div className="relative flex min-h-screen w-full flex-1 flex-col bg-background">
          {/* 모바일 상단 바: 로고 + 테마 + 인증 (데스크탑 헤더는 각 페이지에서 렌더) */}
          <MobileTopBar
            authSlot={
              <Suspense>
                <AuthButton />
              </Suspense>
            }
          />

          {children}

          {/* 모바일 하단 탭 바 */}
          <Suspense>
            <MobileTabBar />
          </Suspense>

          {/* 모바일 탭 바 높이만큼 하단 여백 */}
          <div className="h-14 md:hidden" />
        </div>
      </div>
    </SidebarProvider>
  );
}
