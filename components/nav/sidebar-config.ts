// 사이드바 콘텐츠 설정

import type { LucideIcon } from "lucide-react";
import { Shield, Star, Trophy } from "lucide-react";

import type { LeagueSlug } from "@/lib/constants/football";
import { TOP5_LEAGUES } from "@/lib/constants/football";

// ─── 리그 바로가기 ────────────────────────────────────────────

export type LeagueLinkItem = {
  slug: LeagueSlug;
  name: string;
  shortName: string;
  href: string;
  /** football-data.org competition emblem URL */
  emblemUrl: string;
  /** 국기 이모지 (접힌 상태 아이콘 대용) */
  flag: string;
};

/** 리그 slug → 국기 이모지 */
const LEAGUE_FLAGS: Record<LeagueSlug, string> = {
  epl: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  laliga: "🇪🇸",
  seriea: "🇮🇹",
  bundesliga: "🇩🇪",
  ligue1: "🇫🇷",
};

/** 리그 slug → football-data.org competition emblem */
const LEAGUE_EMBLEMS: Record<LeagueSlug, string> = {
  epl: "https://crests.football-data.org/PL.png",
  laliga: "https://crests.football-data.org/PD.png",
  seriea: "https://crests.football-data.org/SA.png",
  bundesliga: "https://crests.football-data.org/BL1.png",
  ligue1: "https://crests.football-data.org/FL1.png",
};

export const leagueLinks: LeagueLinkItem[] = TOP5_LEAGUES.map((league) => {
  const slug = league.slug as LeagueSlug;
  return {
    slug,
    name: league.name,
    shortName: league.shortName,
    href: `/ranking?league=${slug}`,
    emblemUrl: LEAGUE_EMBLEMS[slug],
    flag: LEAGUE_FLAGS[slug],
  };
});

// ─── 대회 (placeholder) ──────────────────────────────────────

export type TournamentItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  disabled?: boolean;
};

export const tournamentItems: TournamentItem[] = [
  { label: "UCL", icon: Trophy, href: "/ranking?league=ucl" },
  { label: "UEL", icon: Shield, disabled: true },
  { label: "UECL", icon: Star, disabled: true },
];
