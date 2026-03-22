"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { mobileNavItems } from "./nav-config";

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 w-full border-comic-black border-t-[var(--comic-border-width)] bg-comic-white md:hidden">
      <div className="flex h-14 items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors",
                isActive ? "text-comic-black" : "text-comic-black/40",
              )}
            >
              <span
                className={cn(
                  "rounded-[var(--comic-panel-radius)] p-1",
                  isActive && "bg-comic-yellow",
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span
                className={cn(
                  "font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xs)] tracking-[var(--comic-tracking-normal)]",
                  isActive ? "font-medium" : "font-normal",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
