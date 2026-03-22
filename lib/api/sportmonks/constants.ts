// SportMonks API 상수 정의

/** SportMonks Football API v3 기본 URL */
export const SPORTMONKS_BASE_URL = "https://api.sportmonks.com/v3";

/** Premier League ID */
export const PL_LEAGUE_ID = 8;

/** 현재 시즌 ID (2025/2026) */
export const CURRENT_SEASON_ID = 25583;

/** 현재 시즌 레이블 — DB standings/teams 테이블의 season 컬럼 값과 일치 */
export const CURRENT_SEASON_LABEL = "2025/2026";

/** 맨체스터 시티 팀 ID (SportMonks v3) — DB teams 테이블 PK와 동일 */
export const MCITY_TEAM_ID = 14;

/** 시간당 요청 제한 */
export const RATE_LIMIT_PER_HOUR = 2000;

/** 선수 통계 type_id 매핑 (SportMonks /core/types에서 검증됨) */
export const STAT_TYPE_ID = {
  GOALS: 52,
  ASSISTS: 79,
  SHOTS_OFF_TARGET: 41,
  SHOTS_TOTAL: 42,
  CORNERS: 34,
  BALL_POSSESSION: 45,
  PENALTIES: 47,
  SHOTS_INSIDEBOX: 49,
  SHOTS_OUTSIDEBOX: 50,
  OFFSIDES: 51,
  GOAL_KICKS: 53,
  FOULS: 56,
  SAVES: 57,
  SHOTS_BLOCKED: 58,
  SUBSTITUTIONS: 59,
  SHOTS_ON_TARGET: 86,
  GOALS_CONCEDED: 88,
  INTERCEPTIONS: 100,
  CLEARANCES: 101,
  DRIBBLE_ATTEMPTS: 108,
  SUCCESSFUL_DRIBBLES: 109,
  PENALTIES_SCORED: 111,
  ACCURATE_PASSES: 116,
  KEY_PASSES: 117,
  RATING: 118,
  MINUTES_PLAYED: 119,
  TACKLES: 78,
  PASSES: 80,
  YELLOWCARDS: 84,
  REDCARDS: 83,
  AERIALS_WON: 107,
  APPEARANCES: 321,
  LINEUPS: 322,
  BIG_CHANCES_CREATED: 580,
  BIG_CHANCES_MISSED: 581,
  ACCURATE_PASSES_PCT: 1584,
} as const;

/** 경기 이벤트 type_id */
export const EVENT_TYPE_ID = {
  GOAL: 14,
  OWN_GOAL: 15,
  PENALTY_SCORED: 16,
  MISSED_PENALTY: 17,
  SUBSTITUTION: 18,
  YELLOW_CARD: 19,
  RED_CARD: 20,
  YELLOW_RED_CARD: 21,
} as const;

/** 라인업 type_id */
export const LINEUP_TYPE_ID = {
  STARTING: 11,
  BENCH: 12,
  SIDELINED: 13,
} as const;

/** 스코어 type_id */
export const SCORE_TYPE_ID = {
  FIRST_HALF: 1,
  SECOND_HALF: 2,
  CURRENT: 1525,
} as const;

/** SportMonks position_id → 앱 포지션 매핑 */
export const POSITION_MAP: Record<number, string> = {
  24: "GK",
  25: "DEF",
  26: "MID",
  27: "FWD",
  // 세부 포지션 → 상위 그룹
  148: "DEF", // Centre Back
  149: "MID", // Defensive Midfield
  150: "MID", // Attacking Midfield
  151: "FWD", // Centre Forward
  152: "FWD", // Left Wing
  153: "MID", // Central Midfield
  154: "DEF", // Right Back
  155: "DEF", // Left Back
  156: "FWD", // Right Wing
  157: "MID", // Left Midfield
  158: "MID", // Right Midfield
};

/** SportMonks state developer_name → 앱 FixtureStatus */
export const FIXTURE_STATE_MAP: Record<string, "NS" | "LIVE" | "FT"> = {
  // 라이브 상태
  inplay: "LIVE",
  "1st-half": "LIVE",
  "2nd-half": "LIVE",
  ht: "LIVE",
  et: "LIVE",
  "et-half": "LIVE",
  "1st-et-half": "LIVE",
  "2nd-et-half": "LIVE",
  pen: "LIVE",
  break: "LIVE",
  // 종료 상태
  ft: "FT",
  aet: "FT",
  "pen-ft": "FT",
  awarded: "FT",
  // 예정 상태
  ns: "NS",
  tba: "NS",
  postp: "NS",
  delayed: "NS",
  susp: "NS",
  cancelled: "NS",
  abandoned: "NS",
};
