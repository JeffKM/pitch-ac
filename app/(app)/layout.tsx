import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

// Task 003에서 별도 컴포넌트(AppHeader, MobileTabBar)로 분리 예정
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 데스크탑 헤더 — Task 003에서 AppHeader 컴포넌트로 교체 */}
      <header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
        <div className="container flex h-14 items-center">
          <span className="text-lg font-bold">pitch-ac</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitcher />
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>

      {/* 모바일 하단 탭 바 — Task 003에서 MobileTabBar 컴포넌트로 교체 */}
      <nav className="fixed bottom-0 z-50 w-full border-t bg-background md:hidden">
        <div className="flex h-14 items-center justify-around">
          {/* 탭 아이템 — Task 003에서 구현 */}
        </div>
      </nav>

      {/* 모바일 탭 바 높이만큼 하단 여백 */}
      <div className="h-14 md:hidden" />
    </div>
  );
}
