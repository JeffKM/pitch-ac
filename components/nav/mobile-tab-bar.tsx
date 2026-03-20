"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileNavItems } from "./nav-config";

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t bg-background md:hidden">
      <div className="flex h-14 items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={`text-xs ${isActive ? "font-medium" : "font-normal"}`}
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
