"use client";

import {
  BarChart3,
  GitCompareArrows,
  Grid3X3,
  HelpCircle,
  LineChart,
  Map,
  Radar,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import { buildContextQuery } from "../_lib/build-context-query";

const scoutingTabs = [
  { href: "/scouting", label: "Player Card", icon: Search },
  { href: "/scouting/summary", label: "Summary", icon: Grid3X3 },
  { href: "/scouting/progression", label: "Progression", icon: LineChart },
  { href: "/scouting/action-maps", label: "Action Maps", icon: Map },
  { href: "/scouting/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/scouting/radar", label: "Radar", icon: Radar },
  { href: "/scouting/similarity", label: "Similarity", icon: Users },
  { href: "/scouting/scatter", label: "Scatter", icon: TrendingUp },
  { href: "/scouting/ranking", label: "Ranking", icon: BarChart3 },
  { href: "/scouting/glossary", label: "Glossary", icon: HelpCircle },
] as const;

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
