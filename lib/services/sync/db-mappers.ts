// 앱 내부 타입(camelCase) → DB row(snake_case) 변환
// 기존 mappers.ts는 수정하지 않고, DB 저장 시점에만 이 함수들을 사용
import "server-only";

import type {
  Fixture,
  Player,
  PlayerMatchStats,
  PlayerSeasonStats,
  Team,
  TeamStanding,
} from "@/types";

/** Team → teams 테이블 행 */
export function teamToDbRow(team: Team) {
  return {
    id: team.id,
    name: team.name,
    short_code: team.shortName,
    logo_url: team.logoUrl,
    season: team.season,
  };
}

/** Player → players 테이블 행 */
export function playerToDbRow(player: Player) {
  return {
    id: player.id,
    team_id: player.teamId || null,
    name: player.name,
    position: player.position,
    jersey_number: player.number || null,
    nationality: player.nationality,
    photo_url: player.photoUrl,
  };
}

/** PlayerSeasonStats → player_season_stats 테이블 행 */
export function seasonStatsToDbRow(stats: PlayerSeasonStats) {
  // 각 필드별 StatContext를 하나의 JSONB 객체로 합침
  const context = {
    goals: stats.goalsContext,
    assists: stats.assistsContext,
    xg: stats.xgContext,
    xa: stats.xaContext,
    keyPasses: stats.keyPassesContext,
    dribbles: stats.dribblesContext,
    averageRating: stats.averageRatingContext,
  };

  return {
    player_id: stats.playerId,
    season: stats.season,
    goals: stats.goals,
    assists: stats.assists,
    xg: stats.xg,
    xa: stats.xa,
    key_passes: stats.keyPasses,
    dribbles: stats.dribbles,
    average_rating: stats.averageRating,
    context,
    radar_data: stats.radarData,
  };
}

/** PlayerMatchStats → player_match_stats 테이블 행 */
export function matchStatsToDbRow(stats: PlayerMatchStats) {
  return {
    player_id: stats.playerId,
    fixture_id: stats.fixtureId,
    rating: stats.rating,
    goals: stats.goals,
    assists: stats.assists,
    minutes_played: stats.minutesPlayed,
  };
}

/** Fixture → fixtures 테이블 행 */
export function fixtureToDbRow(fixture: Fixture) {
  return {
    id: fixture.id,
    gameweek: fixture.gameweek,
    date: fixture.date,
    home_team_id: fixture.homeTeamId || null,
    away_team_id: fixture.awayTeamId || null,
    status: fixture.status,
    home_score: fixture.homeScore,
    away_score: fixture.awayScore,
    minute: fixture.minute,
    events: fixture.events,
    live_stats: fixture.liveStats,
    lineups: fixture.lineups,
    league_id: fixture.leagueId,
    competition_name: fixture.competitionName,
  };
}

/**
 * TeamStanding → standings 테이블 행
 * goal_difference는 GENERATED ALWAYS AS 컬럼이므로 반드시 제외
 */
export function standingToDbRow(standing: TeamStanding, season: string) {
  return {
    team_id: standing.teamId,
    season,
    position: standing.position,
    played: standing.played,
    won: standing.won,
    drawn: standing.drawn,
    lost: standing.lost,
    goals_for: standing.goalsFor,
    goals_against: standing.goalsAgainst,
    // goal_difference 제외 (GENERATED ALWAYS AS 컬럼)
    points: standing.points,
    form: standing.form,
  };
}
