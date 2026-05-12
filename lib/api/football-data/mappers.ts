// football-data.org Raw 타입 → 앱 내부 타입 변환

import { FIXTURE_STATUS_MAP, LEAGUE_NAME_MAP } from "@/lib/constants/football";
import type {
  Fixture,
  FixtureEvent,
  FixtureStatus,
  H2HResult,
  Team,
  TeamStanding,
} from "@/types";

import type { FdMatch, FdMatchTeam, FdStandingEntry, FdTeam } from "./types";

// ─────────────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────────────

/** football-data.org match status → 앱 FixtureStatus */
function mapMatchStatus(status: string): FixtureStatus {
  return FIXTURE_STATUS_MAP[status] ?? "NS";
}

// ─────────────────────────────────────────────
// 팀 매퍼
// ─────────────────────────────────────────────

/** FdTeam → Team */
export function mapFdTeamToTeam(raw: FdTeam, season: string): Team {
  return {
    id: raw.id,
    name: raw.name,
    shortName:
      raw.tla ?? raw.shortName ?? raw.name.substring(0, 3).toUpperCase(),
    logoUrl: raw.crest,
    season,
  };
}

/** FdMatchTeam (경기 내 팀 정보) → Team */
export function mapFdMatchTeamToTeam(raw: FdMatchTeam, season: string): Team {
  return {
    id: raw.id,
    name: raw.name,
    shortName:
      raw.tla ?? raw.shortName ?? raw.name.substring(0, 3).toUpperCase(),
    logoUrl: raw.crest,
    season,
  };
}

// ─────────────────────────────────────────────
// 경기 매퍼
// ─────────────────────────────────────────────

/** FdMatch → Fixture */
export function mapFdMatchToFixture(raw: FdMatch): Fixture {
  const status = mapMatchStatus(raw.status);
  const homeScore = raw.score.fullTime.home;
  const awayScore = raw.score.fullTime.away;
  const leagueId = raw.competition.id;

  const competitionName = LEAGUE_NAME_MAP[leagueId] ?? raw.competition.name;

  // events: football-data.org 무료 티어에서는 goals만 제공 (scorers 엔드포인트)
  // 개별 경기 이벤트는 제공 안 됨 — 빈 배열
  const events: FixtureEvent[] = [];

  return {
    id: raw.id,
    gameweek: raw.matchday ?? null,
    date: raw.utcDate,
    homeTeamId: raw.homeTeam.id,
    awayTeamId: raw.awayTeam.id,
    status,
    homeScore,
    awayScore,
    events,
    leagueId,
    competitionName,
  };
}

/** FdMatch → H2HResult (FT 경기만) */
export function mapFdMatchToH2HResult(raw: FdMatch): H2HResult | null {
  if (raw.score.fullTime.home === null || raw.score.fullTime.away === null) {
    return null;
  }

  return {
    fixtureId: raw.id,
    date: raw.utcDate,
    homeTeamId: raw.homeTeam.id,
    awayTeamId: raw.awayTeam.id,
    homeScore: raw.score.fullTime.home,
    awayScore: raw.score.fullTime.away,
  };
}

// ─────────────────────────────────────────────
// 순위표 매퍼
// ─────────────────────────────────────────────

/** FdStandingEntry → TeamStanding */
export function mapFdStandingToTeamStanding(
  raw: FdStandingEntry,
  leagueId: number = 2021,
): TeamStanding {
  // form: "W,D,L,W,W" → ["W","D","L","W","W"]
  const form: Array<"W" | "D" | "L"> = raw.form
    ? (raw.form.split(",").filter((c) => ["W", "D", "L"].includes(c)) as Array<
        "W" | "D" | "L"
      >)
    : [];

  return {
    teamId: raw.team.id,
    leagueId,
    position: raw.position,
    played: raw.playedGames,
    won: raw.won,
    drawn: raw.draw,
    lost: raw.lost,
    goalsFor: raw.goalsFor,
    goalsAgainst: raw.goalsAgainst,
    goalDifference: raw.goalDifference,
    points: raw.points,
    form,
  };
}
