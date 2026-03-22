import type { LucideIcon } from "lucide-react";
import { Calendar, Image, Swords, Users } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// 데스크탑 헤더에 표시할 메인 내비게이션 항목 (4개)
export const mainNavItems: NavItem[] = [
  { href: "/matchday", label: "매치데이", icon: Calendar },
  { href: "/squad", label: "스쿼드", icon: Users },
  { href: "/compare", label: "비교", icon: Swords },
  { href: "/gallery", label: "갤러리", icon: Image },
];

// 모바일 탭 바에 표시할 내비게이션 항목 (4개)
export const mobileNavItems: NavItem[] = [...mainNavItems];
