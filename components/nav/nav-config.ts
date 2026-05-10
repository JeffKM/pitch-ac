import type { LucideIcon } from "lucide-react";
import { Calendar, Home, Newspaper, Radar, Trophy } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// 데스크탑 헤더 + 모바일 탭바에 표시할 내비게이션 항목 (5개)
export const mainNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/matchday", label: "Matchday", icon: Calendar },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/scouting", label: "Scouting", icon: Radar },
];

// 모바일 탭 바에 표시할 내비게이션 항목
export const mobileNavItems: NavItem[] = [...mainNavItems];
