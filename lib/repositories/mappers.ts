// DB row(snake_case) → 앱 타입(camelCase) 역방향 변환
// fixtureToDbRow 등이 camelCase 객체를 JSONB에 그대로 저장하므로
// JSONB 내부(events, live_stats, lineups)는 변환 없이 타입 캐스팅만 수행

import type {
  Fixture,
  FixtureEvent,
  FixtureLiveStats,
  InjuredPlayer,
  Lineup,
  Player,
  PlayerMatchStats,
  PlayerPosition,
  PlayerSeasonStats,
  StatContext,
  Team,
  TeamStanding,
} from "@/types";
import type { RadarData } from "@/types/radar";

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

/** injuries 테이블 행 타입 */
export interface InjuryRow {
  player_id: number;
  team_id: number;
  player_name: string;
  reason: string;
  expected_return: string | null;
}

/** injuries 테이블 행 → InjuredPlayer 앱 타입 */
export function injuryRowToInjuredPlayer(row: InjuryRow): InjuredPlayer {
  return {
    playerId: row.player_id,
    playerName: row.player_name,
    teamId: row.team_id,
    reason: row.reason,
    expectedReturn: row.expected_return,
  };
}

/** players 테이블 행 타입 */
export interface PlayerRow {
  id: number;
  team_id: number | null;
  name: string;
  position: string;
  jersey_number: number | null;
  nationality: string;
  photo_url: string;
}

/** player_season_stats 테이블 행 타입 */
export interface PlayerSeasonStatsRow {
  id: number;
  player_id: number;
  season: string;
  goals: number;
  assists: number;
  xg: number | null;
  xa: number | null;
  key_passes: number;
  dribbles: number;
  average_rating: number;
  context: Record<string, StatContext | null>;
  radar_data: RadarData;
}

/** player_match_stats 테이블 행 타입 */
export interface PlayerMatchStatsRow {
  id: number;
  player_id: number;
  fixture_id: number;
  rating: number;
  goals: number;
  assists: number;
  minutes_played: number;
}

/** context JSONB 기본값 */
const DEFAULT_STAT_CONTEXT: StatContext = {
  rank: 0,
  percentile: 0,
  prevSeason: null,
};

/** players 테이블 행 → Player 앱 타입 */
export function playerRowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    photoUrl: row.photo_url,
    teamId: row.team_id ?? 0,
    position: row.position as PlayerPosition,
    number: row.jersey_number ?? 0,
    nationality: row.nationality,
  };
}

/** player_season_stats 테이블 행 → PlayerSeasonStats 앱 타입 */
export function playerSeasonStatsRowToStats(
  row: PlayerSeasonStatsRow,
): PlayerSeasonStats {
  const ctx = row.context ?? {};
  const getCtx = (key: string): StatContext =>
    (ctx[key] as StatContext) ?? DEFAULT_STAT_CONTEXT;

  return {
    playerId: row.player_id,
    season: row.season,
    goals: row.goals,
    goalsContext: getCtx("goals"),
    assists: row.assists,
    assistsContext: getCtx("assists"),
    xg: row.xg,
    xgContext: row.xg !== null ? getCtx("xg") : null,
    xa: row.xa,
    xaContext: row.xa !== null ? getCtx("xa") : null,
    keyPasses: row.key_passes,
    keyPassesContext: getCtx("keyPasses"),
    dribbles: row.dribbles,
    dribblesContext: getCtx("dribbles"),
    averageRating: row.average_rating,
    averageRatingContext: getCtx("averageRating"),
    radarData: row.radar_data as RadarData,
  };
}

/** player_match_stats 테이블 행 → PlayerMatchStats 앱 타입 */
export function playerMatchStatsRowToStats(
  row: PlayerMatchStatsRow,
): PlayerMatchStats {
  return {
    playerId: row.player_id,
    fixtureId: row.fixture_id,
    rating: row.rating,
    goals: row.goals,
    assists: row.assists,
    minutesPlayed: row.minutes_played,
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
