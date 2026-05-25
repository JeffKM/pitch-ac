import { Suspense } from "react";

import { AppSidebar } from "@/components/nav/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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

        {/* 메인 영역 */}
        <SidebarInset className="flex min-h-screen flex-col">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
