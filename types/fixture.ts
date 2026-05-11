// 경기(Fixture) 관련 타입 정의

import type { Team, TeamStanding } from "./team";

/** 경기 상태 */
export type FixtureStatus = "NS" | "LIVE" | "FT" | "POSTP";

/** 경기 이벤트 타입 — football-data.org 무료 티어에서는 goal만 활용 */
export type FixtureEventType = "goal";

/** 경기 이벤트 (골) */
export interface FixtureEvent {
  type: FixtureEventType;
  /** 발생 분 */
  minute: number;
  teamId: number;
  playerId: number;
  playerName: string;
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
  /** 게임위크 (matchday) */
  gameweek: number | null;
  date: string;
  homeTeamId: number;
  awayTeamId: number;
  status: FixtureStatus;
  /** NS(예정)일 때 null */
  homeScore: number | null;
  /** NS(예정)일 때 null */
  awayScore: number | null;
  /** 이벤트 목록 (NS일 때 빈 배열) */
  events: FixtureEvent[];
  /** football-data.org competition id (PL=2021) */
  leagueId: number;
  /** 대회 표시명 */
  competitionName: string | null;
}
