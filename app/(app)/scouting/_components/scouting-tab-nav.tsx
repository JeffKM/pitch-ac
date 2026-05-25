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
    <nav className="mb-6 overflow-x-auto border-b border-comic-black/10">
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
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "border-comic-primary text-comic-primary"
                  : "border-transparent text-comic-black/50 hover:border-comic-black/20 hover:text-comic-black/80",
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
