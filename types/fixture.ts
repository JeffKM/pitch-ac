// 경기(Fixture) 관련 타입 정의

import type { Team, TeamStanding } from "./team";

/** 경기 상태 */
export type FixtureStatus = "NS" | "LIVE" | "FT" | "POSTP";

/** 경기 이벤트 타입 */
export type FixtureEventType =
  | "goal"
  | "substitution"
  | "yellow_card"
  | "red_card";

/** 경기 이벤트 (골, 교체, 카드 등) */
export interface FixtureEvent {
  type: FixtureEventType;
  /** 발생 분 */
  minute: number;
  teamId: number;
  playerId: number;
  playerName: string;
  /** 골 이벤트일 때만 존재하는 Expected Goals 수치 */
  xg?: number;
}

/** 팀별 실시간 스탯 */
export interface TeamLiveStats {
  /** 점유율 (%) */
  possession: number;
  shots: number;
  shotsOnTarget: number;
  /** xG — Starter 플랜 미지원 시 null */
  xg: number | null;
  corners: number;
  fouls: number;
}

/** 홈/어웨이 실시간 스탯 */
export interface FixtureLiveStats {
  home: TeamLiveStats;
  away: TeamLiveStats;
}

/** 라인업 선수 */
export interface LineupPlayer {
  playerId: number;
  playerName: string;
  number: number;
  position: string;
  /** 그리드 포지션 (예: "1:1", "2:3") */
  grid?: string;
}

/** 팀 라인업 */
export interface Lineup {
  /** 포메이션 (예: "4-3-3") */
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

/** H2H 경기 결과 */
export interface H2HResult {
  fixtureId: number;
  date: string;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
}

/** 부상/결장 선수 */
export interface InjuredPlayer {
  playerId: number;
  playerName: string;
  teamId: number;
  reason: string;
  expectedReturn: string | null;
}

/** 경기 상세 페이지 데이터 (SSR + API 폴링 공통) */
export interface FixtureDetailData {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  homeStanding: TeamStanding | null;
  awayStanding: TeamStanding | null;
  h2hResults: H2HResult[];
  homeInjuries: InjuredPlayer[];
  awayInjuries: InjuredPlayer[];
}

/** 경기 정보 */
export interface Fixture {
  id: number;
  /** PL 게임위크 (컵 경기는 가장 가까운 GW 할당, 시즌 외이면 null) */
  gameweek: number | null;
  date: string;
  homeTeamId: number;
  awayTeamId: number;
  status: FixtureStatus;
  /** NS(예정)일 때 null */
  homeScore: number | null;
  /** NS(예정)일 때 null */
  awayScore: number | null;
  /** LIVE 경기의 현재 진행 분 (LIVE가 아닐 때 null) */
  minute: number | null;
  /** 이벤트 목록 (NS일 때 빈 배열) */
  events: FixtureEvent[];
  /** 실시간 스탯 (NS일 때 null) */
  liveStats: FixtureLiveStats | null;
  /** 라인업 (NS일 때 null) */
  lineups: { home: Lineup; away: Lineup } | null;
  /** SportMonks league_id (PL=8) */
  leagueId: number;
  /** 대회 표시명 (PL이면 null, 컵 경기만 표시) */
  competitionName: string | null;
}
