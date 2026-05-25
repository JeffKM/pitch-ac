import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { AppHeader } from "@/components/nav/app-header";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { MobileTabBar } from "@/components/nav/mobile-tab-bar";
import { QueryProvider } from "@/components/providers/query-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-comic-white">
          {/* 데스크탑 사이드바 */}
          <Suspense>
            <AppSidebar />
          </Suspense>

          {/* 메인 영역 */}
          <SidebarInset className="flex min-h-screen flex-col">
            {/* 데스크탑 상단 고정 헤더 */}
            <Suspense>
              <AppHeader
                authSlot={
                  <Suspense>
                    <AuthButton />
                  </Suspense>
                }
              />
            </Suspense>

            {/* 메인 콘텐츠 */}
            <main className="flex-1">
              <div className="mx-auto max-w-5xl p-[var(--comic-panel-padding)]">
                {children}
              </div>
            </main>

            {/* 모바일 하단 탭 바 */}
            <Suspense>
              <MobileTabBar />
            </Suspense>

            {/* 모바일 탭 바 높이만큼 하단 여백 */}
            <div className="h-14 md:hidden" />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </QueryProvider>
  );
}
