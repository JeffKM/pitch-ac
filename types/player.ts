// 선수 관련 타입 정의

import type { RadarData } from "./radar";

/** 선수 포지션 */
export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";

/** 선수 기본 정보 */
export interface Player {
  id: number;
  name: string;
  photoUrl: string;
  teamId: number;
  position: PlayerPosition;
  /** 등번호 */
  number: number;
  nationality: string;
}

/** 수치에 부여하는 맥락 정보 — "모든 숫자에 맥락" 규칙 충족 */
export interface StatContext {
  /** 리그 내 순위 */
  rank: number;
  /** 백분위 (0~100) */
  percentile: number;
  /** 전 시즌 동일 수치 (신규 선수는 null) */
  prevSeason: number | null;
}

/** 시즌 누적 스탯 — 핵심 7개 수치 */
export interface PlayerSeasonStats {
  playerId: number;
  season: string;
  goals: number;
  goalsContext: StatContext;
  assists: number;
  assistsContext: StatContext;
  /** Expected Goals — Starter 플랜 미지원 시 null */
  xg: number | null;
  xgContext: StatContext | null;
  /** Expected Assists — Starter 플랜 미지원 시 null */
  xa: number | null;
  xaContext: StatContext | null;
  keyPasses: number;
  keyPassesContext: StatContext;
  dribbles: number;
  dribblesContext: StatContext;
  /** 평균 평점 (10점 만점) */
  averageRating: number;
  averageRatingContext: StatContext;
  /** 레이더 차트 데이터 */
  radarData: RadarData;
}

/** 경기별 스탯 */
export interface PlayerMatchStats {
  playerId: number;
  fixtureId: number;
  /** 평점 (10점 만점) */
  rating: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
}

/** 외부 API ID 매핑 */
export interface PlayerIdMapping {
  playerId: number;
  sportmonksId: number | null;
  apiFootballId: number | null;
  /** 수동 검증 완료 여부 */
  verified: boolean;
}
