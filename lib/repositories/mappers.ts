// DB row(snake_case) → 앱 타입(camelCase) 역방향 변환
// fixtureToDbRow 등이 camelCase 객체를 JSONB에 그대로 저장하므로
// JSONB 내부(events, live_stats, lineups)는 변환 없이 타입 캐스팅만 수행

import type {
  Fixture,
  FixtureEvent,
  FixtureLiveStats,
  Lineup,
  Team,
  TeamStanding,
} from "@/types";

/** fixtures 테이블 행 타입 (Supabase 반환값) */
export interface FixtureRow {
  id: number;
  gameweek: number;
  date: string;
  home_team_id: number | null;
  away_team_id: number | null;
  status: "NS" | "LIVE" | "FT";
  home_score: number | null;
  away_score: number | null;
  minute: number | null;
  events: FixtureEvent[] | null;
  live_stats: FixtureLiveStats | null;
  lineups: { home: Lineup; away: Lineup } | null;
}

/** teams 테이블 행 타입 */
export interface TeamRow {
  id: number;
  name: string;
  short_code: string;
  logo_url: string;
  season: string;
}

/** standings 테이블 행 타입 */
export interface StandingRow {
  team_id: number;
  season: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: Array<"W" | "D" | "L"> | null;
}

/** fixtures 테이블 행 → Fixture 앱 타입 */
export function fixtureRowToFixture(row: FixtureRow): Fixture {
  return {
    id: row.id,
    gameweek: row.gameweek,
    date: row.date,
    homeTeamId: row.home_team_id ?? 0,
    awayTeamId: row.away_team_id ?? 0,
    status: row.status,
    homeScore: row.home_score,
    awayScore: row.away_score,
    minute: row.minute,
    events: row.events ?? [],
    liveStats: row.live_stats,
    lineups: row.lineups,
  };
}

/** teams 테이블 행 → Team 앱 타입 */
export function teamRowToTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_code,
    logoUrl: row.logo_url,
    season: row.season,
  };
}

/** standings 테이블 행 → TeamStanding 앱 타입 */
export function standingRowToStanding(row: StandingRow): TeamStanding {
  return {
    teamId: row.team_id,
    position: row.position,
    played: row.played,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    goalDifference: row.goal_difference,
    points: row.points,
    form: row.form ?? [],
  };
}
