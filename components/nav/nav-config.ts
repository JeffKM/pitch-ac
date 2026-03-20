import type { LucideIcon } from "lucide-react";
import { Calendar, MoreHorizontal, Swords, Trophy } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// 데스크탑 헤더에 표시할 메인 내비게이션 항목 (3개)
export const mainNavItems: NavItem[] = [
  { href: "/matchday", label: "Matchday", icon: Calendar },
  { href: "/players", label: "Players", icon: Trophy },
  { href: "/compare", label: "Compare", icon: Swords },
];

// 모바일 탭 바에 표시할 내비게이션 항목 (4개)
export const mobileNavItems: NavItem[] = [
  ...mainNavItems,
  { href: "/more", label: "More", icon: MoreHorizontal },
];
