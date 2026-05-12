// 축구 도메인 공통 상수 — API 소스에 무관한 값만 정의

import type { FixtureStatus } from "@/types/fixture";

/** Premier League ID (football-data.org 기준) */
export const PL_LEAGUE_ID = 2021;

/** 현재 시즌 (football-data.org 형식: 연도) */
export const CURRENT_SEASON = 2025;

/** 현재 시즌 레이블 — DB standings/teams 테이블의 season 컬럼 값 */
export const CURRENT_SEASON_LABEL = "2025/2026";

/** 맨체스터 시티 팀 ID (football-data.org 기준) */
export const MCITY_TEAM_ID = 65;

// ─── 5대 리그 설정 ───────────────────────────────────────────────

/** 리그 슬러그 타입 */
export type LeagueSlug = "epl" | "laliga" | "seriea" | "bundesliga" | "ligue1";

/** 리그 설정 인터페이스 */
export interface LeagueConfig {
  id: number;
  slug: LeagueSlug;
  name: string;
  shortName: string;
  country: string;
  /** football-data.org competition code */
  code: string;
  maxRounds: number;
  teamsCount: number;
}

/** 5대 리그 설정 배열 */
export const TOP5_LEAGUES: LeagueConfig[] = [
  {
    id: 2021,
    slug: "epl",
    name: "Premier League",
    shortName: "EPL",
    country: "England",
    code: "PL",
    maxRounds: 38,
    teamsCount: 20,
  },
  {
    id: 2014,
    slug: "laliga",
    name: "La Liga",
    shortName: "La Liga",
    country: "Spain",
    code: "PD",
    maxRounds: 38,
    teamsCount: 20,
  },
  {
    id: 2019,
    slug: "seriea",
    name: "Serie A",
    shortName: "Serie A",
    country: "Italy",
    code: "SA",
    maxRounds: 38,
    teamsCount: 20,
  },
  {
    id: 2002,
    slug: "bundesliga",
    name: "Bundesliga",
    shortName: "Bundesliga",
    country: "Germany",
    code: "BL1",
    maxRounds: 34,
    teamsCount: 18,
  },
  {
    id: 2015,
    slug: "ligue1",
    name: "Ligue 1",
    shortName: "Ligue 1",
    country: "France",
    code: "FL1",
    maxRounds: 34,
    teamsCount: 18,
  },
];

/** slug → LeagueConfig 매핑 */
export const LEAGUE_BY_SLUG: Record<LeagueSlug, LeagueConfig> =
  Object.fromEntries(TOP5_LEAGUES.map((l) => [l.slug, l])) as Record<
    LeagueSlug,
    LeagueConfig
  >;

/** league_id → LeagueConfig 매핑 */
export const LEAGUE_BY_ID: Record<number, LeagueConfig> = Object.fromEntries(
  TOP5_LEAGUES.map((l) => [l.id, l]),
);

/** 5대 리그 ID Set (필터링용) */
export const TOP5_LEAGUE_IDS: Set<number> = new Set(
  TOP5_LEAGUES.map((l) => l.id),
);

/** 기본 리그 */
export const DEFAULT_LEAGUE: LeagueSlug = "epl";

/** league_id → 대회 표시명 매핑 */
export const LEAGUE_NAME_MAP: Record<number, string> = {
  [PL_LEAGUE_ID]: "Premier League",
  2014: "La Liga",
  2019: "Serie A",
  2002: "Bundesliga",
  2015: "Ligue 1",
};

/** football-data.org 포지션 문자열 → 앱 포지션 (4분류) */
export const POSITION_MAP: Record<string, string> = {
  // 광의 분류 (squad endpoint 기본)
  Goalkeeper: "GK",
  Defence: "DEF",
  Defender: "DEF",
  Midfield: "MID",
  Midfielder: "MID",
  Offence: "FWD",
  Attacker: "FWD",
  // 세부 포지션 → 4분류 매핑
  "Centre-Back": "DEF",
  "Left-Back": "DEF",
  "Right-Back": "DEF",
  "Defensive Midfield": "MID",
  "Central Midfield": "MID",
  "Attacking Midfield": "MID",
  "Left Winger": "FWD",
  "Right Winger": "FWD",
  "Centre-Forward": "FWD",
  "Second Striker": "FWD",
};

/** football-data.org 포지션 → ScoutLab 포지션 (GK → null: scoutlab 제외) */
export const SCOUTLAB_POSITION_MAP: Record<string, string | null> = {
  // squad endpoint position 값 (4종)
  Goalkeeper: null,
  Defence: "CB",
  Defender: "CB",
  Midfield: "MF",
  Midfielder: "MF",
  Offence: "FW",
  Attacker: "FW",
  // scorers endpoint section 값 — 대문자 (구 API 호환)
  GOALKEEPER: null,
  DEFENCE: "CB",
  MIDFIELD: "MF",
  OFFENCE: "FW",
  // scorers endpoint section 값 — 세부 포지션명
  "Centre-Forward": "FW",
  "Second Striker": "FW",
  "Right Winger": "W",
  "Left Winger": "W",
  "Attacking Midfield": "AM",
  "Central Midfield": "MF",
  "Defensive Midfield": "MF",
  "Centre-Back": "CB",
  "Left-Back": "FB",
  "Right-Back": "FB",
};

/** 시즌 레이블 → ScoutLab 시즌 형식 ("2025/2026" → "25/26") */
export function toScoutlabSeason(seasonLabel: string): string {
  const [start, end] = seasonLabel.split("/");
  return `${start.slice(-2)}/${end.slice(-2)}`;
}

/** football-data.org match status → 앱 FixtureStatus */
export const FIXTURE_STATUS_MAP: Record<string, FixtureStatus> = {
  // football-data.org 상태
  SCHEDULED: "NS",
  TIMED: "NS",
  IN_PLAY: "LIVE",
  PAUSED: "LIVE",
  FINISHED: "FT",
  POSTPONED: "POSTP",
  SUSPENDED: "NS",
  CANCELLED: "NS",
  // 레거시 상태 (DB 내 기존 데이터 호환)
  "1H": "LIVE",
  "2H": "LIVE",
  HT: "LIVE",
  ET: "LIVE",
  P: "LIVE",
  BT: "LIVE",
  FT: "FT",
  AET: "FT",
  PEN: "FT",
  AWD: "FT",
  WO: "FT",
  PST: "POSTP",
  NS: "NS",
  TBD: "NS",
  SUSP: "NS",
  CANC: "NS",
  ABD: "NS",
  INT: "LIVE",
  LIVE: "LIVE",
};
