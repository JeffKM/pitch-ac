"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { scoutingTabs } from "@/components/nav/scouting-tabs-config";
import { cn } from "@/lib/utils";

import { buildContextQuery } from "../_lib/build-context-query";

export function ScoutingTabNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contextQuery = buildContextQuery(searchParams);

  return (
    <nav
      aria-label="ScoutLab 탭"
      className="relative mb-6 overflow-x-auto border-b border-comic-black/10"
    >
      <div className="flex min-w-max gap-1">
        {scoutingTabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/scouting"
              ? pathname === "/scouting"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={`${href}${contextQuery}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-11 min-w-11 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "border-comic-primary text-comic-primary"
                  : "border-transparent text-comic-black/60 hover:border-comic-black/20 hover:text-comic-black/80",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {/* 모바일: sr-only(아이콘만 노출) / 데스크탑: 라벨 노출 — 접근성 이름은 항상 보존 */}
              <span className="sr-only sm:not-sr-only">{label}</span>
            </Link>
          );
        })}
      </div>
      {/* 우측 스크롤 어포던스 — 1440px 등 좁은 폭에서 탭 오버플로우 시 시각적 힌트 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-comic-white to-transparent"
      />
    </nav>
  );
}
