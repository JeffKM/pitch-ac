"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";

import { mainNavItems } from "./nav-config";

type AppHeaderProps = {
  authSlot: ReactNode;
};

export function AppHeader({ authSlot }: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
      <div className="container flex h-14 items-center">
        {/* 로고 */}
        <Link
          href="/matchday"
          className="text-lg font-bold tracking-tight hover:opacity-80"
        >
          pitch-ac
        </Link>

        {/* 메인 메뉴 링크 */}
        <nav className="ml-6 flex items-center gap-1">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 우측 영역: 테마 토글 + 인증 버튼 */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitcher />
          {authSlot}
        </div>
      </div>
    </header>
  );
}
