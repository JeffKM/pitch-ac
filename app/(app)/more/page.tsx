import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

// 모바일 More 탭 전용 설정 페이지
export default function MorePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-2xl)] leading-[var(--comic-leading-snug)] tracking-[var(--comic-tracking-wide)] text-comic-black">
        Settings
      </h1>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white p-4">
          <span className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black">
            Theme
          </span>
          <ThemeSwitcher />
        </div>
        <div className="flex items-center justify-between rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white p-4">
          <span className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black">
            Account
          </span>
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
