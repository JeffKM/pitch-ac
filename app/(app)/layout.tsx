import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { AppHeader } from "@/components/nav/app-header";
import { MobileTabBar } from "@/components/nav/mobile-tab-bar";
import { QueryProvider } from "@/components/providers/query-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col bg-comic-white">
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
          <div className="container py-6">{children}</div>
        </main>

        {/* 모바일 하단 탭 바 */}
        <Suspense>
          <MobileTabBar />
        </Suspense>

        {/* 모바일 탭 바 높이만큼 하단 여백 */}
        <div className="h-14 md:hidden" />
      </div>
    </QueryProvider>
  );
}
