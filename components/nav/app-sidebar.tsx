"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { buildContextQuery } from "@/app/(app)/scouting/_lib/build-context-query";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { scoutingTabs } from "./scouting-tabs-config";
import { leagueLinks, tournamentItems } from "./sidebar-config";

/** 사이드바 접기/펼치기 토글 버튼 (커스텀) */
function SidebarCollapseButton() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="flex size-8 items-center justify-center rounded-[var(--comic-panel-radius)] border-[2px] border-comic-black bg-comic-white text-comic-black transition-colors hover:bg-comic-yellow"
    >
      {state === "expanded" ? (
        <ChevronsLeft className="size-4" />
      ) : (
        <ChevronsRight className="size-4" />
      )}
    </button>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isScouting = pathname.startsWith("/scouting");
  const currentLeague = searchParams.get("league");

  return (
    <Sidebar
      collapsible="icon"
      className="hidden border-sidebar-border border-r-[var(--comic-border-width)] md:flex"
    >
      {/* ── 헤더: 브랜드 + 접기 토글 ── */}
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] tracking-[var(--comic-tracking-wide)] text-sidebar-foreground group-data-[collapsible=icon]:hidden"
          >
            pitch-ac
          </Link>
          <SidebarCollapseButton />
        </div>
      </SidebarHeader>

      <SidebarSeparator className="border-sidebar-border" />

      <SidebarContent className="px-1">
        {/* ── LEAGUES ── */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xs)] tracking-[var(--comic-tracking-widest)] text-sidebar-foreground/50 uppercase">
            Leagues
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {leagueLinks.map((league) => {
                const isActive =
                  pathname === "/ranking" && currentLeague === league.slug;
                return (
                  <SidebarMenuItem key={league.slug}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={league.shortName}
                      className={cn(
                        "h-9 gap-3 rounded-[var(--comic-panel-radius)] font-[family-name:var(--font-fredoka)] text-[13px] font-medium transition-all",
                        isActive
                          ? "border-[2px] border-comic-black bg-comic-yellow text-comic-black shadow-[2px_2px_0px_var(--comic-black)]"
                          : "border-[2px] border-transparent hover:border-comic-black/20 hover:bg-sidebar-accent/30",
                      )}
                    >
                      <Link href={league.href}>
                        <Image
                          src={league.emblemUrl}
                          alt={league.shortName}
                          width={20}
                          height={20}
                          className="size-5 shrink-0"
                          unoptimized
                        />
                        <span>{league.shortName}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-3 border-sidebar-foreground/10" />

        {/* ── TOURNAMENTS (placeholder) ── */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xs)] tracking-[var(--comic-tracking-widest)] text-sidebar-foreground/50 uppercase">
            Tournaments
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tournamentItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      disabled
                      tooltip={`${item.label} (Coming Soon)`}
                      className="h-9 gap-3 rounded-[var(--comic-panel-radius)] border-[2px] border-dashed border-sidebar-foreground/10 font-[family-name:var(--font-fredoka)] text-[13px] opacity-35"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                      <span className="ml-auto font-[family-name:var(--font-permanent-marker)] text-[9px] text-sidebar-foreground/40 uppercase group-data-[collapsible=icon]:hidden">
                        Soon
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── SCOUTING (scouting 페이지에서만) ── */}
        {isScouting && (
          <>
            <SidebarSeparator className="mx-3 border-sidebar-foreground/10" />
            <SidebarGroup>
              <SidebarGroupLabel className="mb-1 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xs)] tracking-[var(--comic-tracking-widest)] text-sidebar-foreground/50 uppercase">
                Scouting
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {scoutingTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive =
                      tab.href === "/scouting"
                        ? pathname === "/scouting"
                        : pathname.startsWith(tab.href);
                    const contextQuery = buildContextQuery(searchParams);

                    return (
                      <SidebarMenuItem key={tab.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={tab.label}
                          className={cn(
                            "h-8 gap-3 rounded-[var(--comic-panel-radius)] font-[family-name:var(--font-fredoka)] text-[13px] font-medium transition-all",
                            isActive
                              ? "border-[2px] border-comic-black bg-comic-yellow text-comic-black shadow-[2px_2px_0px_var(--comic-black)]"
                              : "border-[2px] border-transparent hover:border-comic-black/20 hover:bg-sidebar-accent/30",
                          )}
                        >
                          <Link href={`${tab.href}${contextQuery}`}>
                            <Icon className="size-4 shrink-0" />
                            <span>{tab.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* ── 푸터: 테마 전환 ── */}
      <SidebarFooter className="px-3 py-3">
        <div className="flex items-center justify-center group-data-[collapsible=icon]:justify-center">
          <ThemeSwitcher />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
