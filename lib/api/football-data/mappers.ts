// football-data.org Raw 타입 → 앱 내부 타입 변환

import {
  FIXTURE_STATUS_MAP,
  LEAGUE_NAME_MAP,
  POSITION_MAP,
  SCOUTLAB_POSITION_MAP,
} from "@/lib/constants/football";
import type {
  Fixture,
  FixtureEvent,
  FixtureStatus,
  H2HResult,
  Player,
  PlayerPosition,
  Team,
  TeamStanding,
} from "@/types";

import type {
  FdMatch,
  FdMatchTeam,
  FdSquadPlayer,
  FdStandingEntry,
  FdTeam,
} from "./types";

// ─────────────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────────────

/** 생년월일 → 현재 나이 (만 나이) */
export function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

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

// ─────────────────────────────────────────────
// 선수 매퍼
// ─────────────────────────────────────────────

/** FdSquadPlayer → Player (players 테이블용) */
export function mapFdSquadPlayerToPlayer(
  raw: FdSquadPlayer,
  teamId: number,
): Player {
  const position = (
    raw.position ? (POSITION_MAP[raw.position] ?? "MID") : "MID"
  ) as PlayerPosition;

  return {
    id: raw.id,
    name: raw.name,
    photoUrl: "",
    teamId,
    position,
    number: 0,
    nationality: raw.nationality,
  };
}

/** ScoutLab DB row 타입 (scoutlab_players 테이블) */
export interface ScoutlabPlayerRow {
  name: string;
  team: string;
  league: string;
  position: string;
  season: string;
  nationality: string | null;
  age: number | null;
  minutes_played: number;
  pitch_ac_player_id: number;
}

/** FdSquadPlayer → scoutlab_players DB row (GK 제외) */
export function mapFdSquadPlayerToScoutlabRow(
  raw: FdSquadPlayer,
  teamName: string,
  league: string,
  season: string,
  positionOverride?: string | null,
): ScoutlabPlayerRow | null {
  // 1차: API position → SCOUTLAB_POSITION_MAP
  let scoutlabPos: string | null | undefined = raw.position
    ? SCOUTLAB_POSITION_MAP[raw.position]
    : undefined;

  // GK는 scoutlab 제외
  if (scoutlabPos === null) return null;

  // 2차: positionOverride (scorers section 등 외부 소스)
  if (scoutlabPos === undefined && positionOverride) {
    const overridePos = SCOUTLAB_POSITION_MAP[positionOverride];
    // override가 GK(null)면 제외
    if (overridePos === null) return null;
    if (overridePos !== undefined) scoutlabPos = overridePos;
  }

  // 3차: 여전히 없으면 "MF" 기본값 (football-data.org 무료 티어 position null 대응)
  if (!scoutlabPos) {
    scoutlabPos = "MF";
  }

  const age = raw.dateOfBirth ? calculateAge(raw.dateOfBirth) : null;

  return {
    name: raw.name,
    team: teamName,
    league,
    position: scoutlabPos,
    season,
    nationality: raw.nationality || null,
    age,
    minutes_played: 0,
    pitch_ac_player_id: raw.id,
  };
}
