// 축구 도메인 공통 상수 — API 소스에 무관한 값만 정의

import type { FixtureStatus } from "@/types/fixture";

/** Premier League ID (API-Football 기준) */
export const PL_LEAGUE_ID = 39;

/** 현재 시즌 (API-Football 형식: 연도) */
export const CURRENT_SEASON = 2025;

/** 현재 시즌 레이블 — DB standings/teams 테이블의 season 컬럼 값 */
export const CURRENT_SEASON_LABEL = "2025/2026";

/** 맨체스터 시티 팀 ID (API-Football 기준) */
export const MCITY_TEAM_ID = 50;

/** 주요 컵 대회 league_id (API-Football 기준) */
export const CUP_LEAGUE_IDS = {
  FA_CUP: 45,
  EFL_CUP: 48, // Carabao Cup
  UCL: 2, // UEFA Champions League
  COMMUNITY_SHIELD: 528,
} as const;

/** league_id → 대회 표시명 매핑 */
export const LEAGUE_NAME_MAP: Record<number, string> = {
  [PL_LEAGUE_ID]: "Premier League",
  [CUP_LEAGUE_IDS.FA_CUP]: "FA Cup",
  [CUP_LEAGUE_IDS.EFL_CUP]: "EFL Cup",
  [CUP_LEAGUE_IDS.UCL]: "Champions League",
  [CUP_LEAGUE_IDS.COMMUNITY_SHIELD]: "Community Shield",
};

/** API-Football 포지션 문자열 → 앱 포지션 */
export const POSITION_MAP: Record<string, string> = {
  Goalkeeper: "GK",
  Defender: "DEF",
  Midfielder: "MID",
  Attacker: "FWD",
};

/** API-Football fixture status.short → 앱 FixtureStatus */
export const FIXTURE_STATUS_MAP: Record<string, FixtureStatus> = {
  // 라이브 상태
  "1H": "LIVE",
  "2H": "LIVE",
  HT: "LIVE",
  ET: "LIVE",
  P: "LIVE",
  BT: "LIVE",
  // 종료 상태
  FT: "FT",
  AET: "FT",
  PEN: "FT",
  AWD: "FT",
  WO: "FT",
  // 연기 상태
  PST: "POSTP",
  // 예정 상태
  NS: "NS",
  TBD: "NS",
  SUSP: "NS",
  CANC: "NS",
  ABD: "NS",
  INT: "LIVE",
  LIVE: "LIVE",
};
