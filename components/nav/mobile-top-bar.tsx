import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeSwitcher } from "@/components/theme-switcher";

type MobileTopBarProps = {
  authSlot: ReactNode;
};

/** 모바일 전용 상단 바 — 로고 + 테마 전환 + 인증 버튼 */
export function MobileTopBar({ authSlot }: MobileTopBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-comic-black border-b-[var(--comic-border-width)] bg-comic-white md:hidden">
      <div className="flex h-12 items-center px-[var(--comic-panel-padding)]">
        <Link
          href="/"
          className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xl)] tracking-[var(--comic-tracking-wide)] text-comic-black hover:opacity-80"
        >
          pitch-ac
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitcher />
          {authSlot}
        </div>
      </div>
    </header>
  );
}
