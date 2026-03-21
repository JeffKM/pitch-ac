// SportMonks API v3 Raw 응답 타입 정의

/** 공통 응답 래퍼 */
export interface SmApiResponse<T> {
  data: T;
  subscription: SmSubscription[];
  rate_limit: SmRateLimit;
  timezone: string;
}

/** 페이지네이션 응답 래퍼 */
export interface SmPaginatedResponse<T> {
  data: T[];
  pagination: SmPagination;
  subscription: SmSubscription[];
  rate_limit: SmRateLimit;
  timezone: string;
}

export interface SmPagination {
  count: number;
  per_page: number;
  current_page: number;
  next_page: string | null;
  has_more: boolean;
}

export interface SmSubscription {
  meta: {
    current_timestamp: number;
    next_billing_cycle: string;
  };
  plans: Array<{
    plan: string;
    sport: string;
    category: string;
  }>;
  add_ons: unknown[];
  widgets: unknown[];
  bundles: unknown[];
}

export interface SmRateLimit {
  resets_in_seconds: number;
  remaining: number;
  requested_entity: string;
}

/** 팀 */
export interface SmTeam {
  id: number;
  sport_id: number;
  country_id: number;
  venue_id: number;
  gender: string;
  name: string;
  short_code: string;
  image_path: string;
  founded: number;
  type: string;
  placeholder: boolean;
  last_played_at: string;
}

/** 포지션 */
export interface SmPosition {
  id: number;
  name: string;
  code: string;
  developer_name: string;
  model_type: string;
}

/** 국적 */
export interface SmNationality {
  id: number;
  name: string;
  image_path: string;
}

/** 선수 팀 소속 정보 */
export interface SmPlayerTeam {
  id: number;
  transfer_id: number | null;
  player_id: number;
  team_id: number;
  position_id: number;
  detailed_position_id: number | null;
  start: string | null;
  end: string | null;
  captain: boolean;
  jersey_number: number;
  team?: SmTeam;
}

/** 선수 */
export interface SmPlayer {
  id: number;
  sport_id: number;
  country_id: number;
  nationality_id: number;
  city_id: number | null;
  position_id: number;
  detailed_position_id: number | null;
  type_id: number;
  common_name: string;
  firstname: string;
  lastname: string;
  name: string;
  display_name: string;
  image_path: string;
  height: number | null;
  weight: number | null;
  date_of_birth: string;
  gender: string;
  // include로 가져오는 중첩 데이터
  statistics?: SmPlayerStatistic[];
  teams?: SmPlayerTeam[];
  nationality?: SmNationality;
  position?: SmPosition;
}

/** 선수 시즌 통계 */
export interface SmPlayerStatistic {
  id: number;
  player_id: number;
  team_id: number;
  season_id: number;
  has_values: boolean;
  position_id: number;
  jersey_number: number;
  details?: SmStatDetail[];
}

/** 통계 상세 (type_id + value) */
export interface SmStatDetail {
  id: number;
  player_statistic_id: number;
  type_id: number;
  value: SmStatValue;
}

export type SmStatValue =
  | { total: number; goals?: number; penalties?: number }
  | { total: number; home?: number; away?: number }
  | {
      total: number;
      won?: number;
      scored?: number;
      committed?: number;
      saved?: number;
      missed?: number;
    }
  | { average: number; highest: number; lowest: number }
  | { in: number; out: number }
  | number
  | string;

/** 경기 참가 팀 (meta 포함) */
export interface SmFixtureParticipant extends SmTeam {
  meta: {
    location: "home" | "away";
    winner: boolean | null;
    position: number;
  };
}

/** 스코어 */
export interface SmScore {
  id: number;
  fixture_id: number;
  type_id: number;
  description: string;
  participant_id: number;
  score: {
    goals: number;
    participant: "home" | "away";
  };
}

/** 경기 이벤트 */
export interface SmEvent {
  id: number;
  fixture_id: number;
  period_id: number;
  participant_id: number;
  type_id: number;
  sub_type_id: number | null;
  section: string;
  player_id: number | null;
  related_player_id: number | null;
  player_name: string | null;
  related_player_name: string | null;
  result: string | null;
  info: string | null;
  addition: string | null;
  minute: number;
  extra_minute: number | null;
  injured: boolean | null;
  on_bench: boolean;
  coach_id: number | null;
  rescinded: boolean | null;
  sort_order: number;
  player?: SmPlayer;
  related_player?: SmPlayer;
}

/** 라인업 */
export interface SmLineup {
  id: number;
  sport_id: number;
  fixture_id: number;
  player_id: number;
  team_id: number;
  position_id: number;
  detailed_position_id: number | null;
  formation_field: string | null;
  formation_position: number | null;
  jersey_number: number;
  type_id: number;
  player?: SmPlayer;
}

/** 경기 팀별 통계 */
export interface SmFixtureStatistic {
  id: number;
  fixture_id: number;
  type_id: number;
  participant_id: number;
  data: {
    value: number | string | null;
  };
  location: string;
}

/** 라운드(게임위크) */
export interface SmRound {
  id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  name: string;
  finished: boolean;
  is_current: boolean;
  starting_at: string;
  ending_at: string;
  games_in_current_week: boolean;
}

/** 경기 상태 */
export interface SmState {
  id: number;
  state: string;
  name: string;
  short_name: string;
  developer_name: string;
}

/** 경기 */
export interface SmFixture {
  id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  group_id: number | null;
  aggregate_id: number | null;
  round_id: number;
  state_id: number;
  venue_id: number;
  name: string;
  starting_at: string;
  result_info: string | null;
  leg: string;
  details: string | null;
  length: number;
  placeholder: boolean;
  has_odds: boolean;
  has_premium_odds: boolean;
  starting_at_timestamp: number;
  // include로 가져오는 중첩 데이터
  participants?: SmFixtureParticipant[];
  scores?: SmScore[];
  events?: SmEvent[];
  lineups?: SmLineup[];
  statistics?: SmFixtureStatistic[];
  round?: SmRound;
  state?: SmState;
}

/** 순위표 */
export interface SmStanding {
  id: number;
  participant_id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  group_id: number | null;
  round_id: number;
  standing_rule_id: number;
  position: number;
  result: string;
  points: number;
  participant?: SmTeam;
  details?: SmStandingDetail[];
}

export interface SmStandingDetail {
  id: number;
  standing_id: number;
  type_id: number;
  value: number | string;
}
