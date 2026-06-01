// ScoutLab 스카우팅 데이터 타입 정의

// ── 기본 열거형 ──

export type ScoutlabPosition = "CB" | "FB" | "MF" | "AM" | "W" | "AM/W" | "FW";

export type ScoutlabLeague =
  | "Premier League"
  | "La Liga"
  | "Serie A"
  | "Bundesliga"
  | "Ligue 1";

export type ScoutlabSeason = "25/26" | "24/25" | "23/24" | "22/23" | "21/22";

export type ScoutlabMode = "per90" | "total";

export type ScoutlabAdjustment = "padj" | "raw";

/** 포지션 비교 그룹 (백분위 비교 대상) */
export type ScoutlabComparisonPosition = "CB" | "FB" | "MF" | "AM/W" | "FW";

export type ScoutlabActionType = "carries" | "passes" | "crosses";

// ── 메트릭 카테고리명 ──

export type ScoutlabCategory =
  | "final_product"
  | "shooting"
  | "creation"
  | "passing"
  | "ball_carrying"
  | "defending"
  | "set_pieces"
  | "aerial"
  | "possession"
  | "vaep_overview"
  | "misc";

// 카테고리 표시명 매핑
export const SCOUTLAB_CATEGORY_LABELS: Record<ScoutlabCategory, string> = {
  final_product: "Final Product",
  shooting: "Shooting",
  creation: "Creation",
  passing: "Passing",
  ball_carrying: "Ball Carrying",
  defending: "Defending",
  set_pieces: "Set Pieces",
  aerial: "Aerial",
  possession: "Possession",
  vaep_overview: "VAEP Overview",
  misc: "Misc",
};

// ── 데이터 타입 ──

/** 개별 메트릭 수치 + 백분위 */
export interface ScoutlabMetricValue {
  value: number;
  percentile: number;
}

/** 카테고리 내 메트릭 집합 */
export type ScoutlabCategoryMetrics = Record<string, ScoutlabMetricValue>;

/** ScoutLab 선수 마스터 */
export interface ScoutlabPlayer {
  id: number;
  name: string;
  team: string;
  league: ScoutlabLeague;
  position: ScoutlabPosition;
  season: string;
  nationality: string | null;
  age: number | null;
  height: number | null;
  minutesPlayed: number;
  pitchAcPlayerId: number | null;
}

/** 메트릭 데이터 (카테고리별) */
export interface ScoutlabMetrics {
  id: number;
  playerId: number;
  season: string;
  mode: ScoutlabMode;
  adjustment: ScoutlabAdjustment;
  comparisonPosition: ScoutlabComparisonPosition;
  finalProduct: ScoutlabCategoryMetrics;
  shooting: ScoutlabCategoryMetrics;
  creation: ScoutlabCategoryMetrics;
  passing: ScoutlabCategoryMetrics;
  ballCarrying: ScoutlabCategoryMetrics;
  defending: ScoutlabCategoryMetrics;
  setPieces: ScoutlabCategoryMetrics;
  aerial: ScoutlabCategoryMetrics;
  possession: ScoutlabCategoryMetrics;
  vaepOverview: ScoutlabCategoryMetrics;
  misc: ScoutlabCategoryMetrics;
}

/** 레이더 차트 축 */
export interface ScoutlabRadarAxis {
  label: string;
  percentile: number;
}

/** 레이더 차트 데이터 */
export interface ScoutlabRadar {
  id: number;
  playerId: number;
  season: string;
  axes: ScoutlabRadarAxis[];
}

/** 액션맵 라인 */
export interface ScoutlabActionLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progressive: boolean;
  threatening: boolean;
  /** 기대 위협 값 (원 크기 비례) */
  xt?: number;
}

/** 액션맵 데이터 */
export interface ScoutlabActionMap {
  id: number;
  playerId: number;
  season: string;
  actionType: ScoutlabActionType;
  lines: ScoutlabActionLine[];
  totalCount: number;
  per90: number;
}

/** 유사 선수 항목 */
export interface ScoutlabSimilarPlayer {
  rank: number;
  name: string;
  team: string;
  league: string;
  age: number;
  position: string;
  score: number;
}

/** 유사 선수 데이터 */
export interface ScoutlabSimilarity {
  id: number;
  playerId: number;
  season: string;
  similarPlayers: ScoutlabSimilarPlayer[];
}

/** 산점도 데이터 포인트 */
export interface ScoutlabScatterPoint {
  playerId: number;
  name: string;
  team: string;
  league: ScoutlabLeague;
  position: ScoutlabPosition;
  x: number;
  y: number;
}

/** 필터 옵션 (드롭다운용) */
export interface ScoutlabFilterOptions {
  leagues: ScoutlabLeague[];
  teams: string[];
  /** 리그별 팀 목록 (클라이언트 필터링용) */
  teamsByLeague: Record<string, string[]>;
  positions: ScoutlabPosition[];
  seasons: string[];
}

/** 검색 필터 파라미터 */
export interface ScoutlabSearchFilters {
  season?: string;
  league?: ScoutlabLeague;
  team?: string;
  position?: ScoutlabPosition;
  minMinutes?: number;
  maxAge?: number;
}
