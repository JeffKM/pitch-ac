import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

// 모바일 More 탭 전용 설정 페이지
export default function MorePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">설정</h1>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="text-sm font-medium">테마</span>
          <ThemeSwitcher />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="text-sm font-medium">계정</span>
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
