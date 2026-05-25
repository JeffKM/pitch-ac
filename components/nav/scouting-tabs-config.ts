// 스카우팅 탭 설정 — 사이드바 + 수평 탭 네비에서 공유

import type { LucideIcon } from "lucide-react";
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

export type ScoutingTab = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const scoutingTabs: ScoutingTab[] = [
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
];
