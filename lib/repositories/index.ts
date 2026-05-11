// Repository 레이어 re-export
import "server-only";

export {
  getCurrentGameweek,
  getFixtureById,
  getFixturesByDate,
  getFixturesByGameweek,
} from "./fixture-repository";
export { getInjuriesByTeamId } from "./injury-repository";
export type {
  FixtureRow,
  InjuryRow,
  PlayerMatchStatsRow,
  PlayerRow,
  PlayerSeasonStatsRow,
  StandingRow,
  TeamRow,
} from "./mappers";
export {
  getAllPlayers,
  getMatchStatsByPlayerId,
  getPlayerById,
  getPlayerSeasonStats,
  getPlayerSeasonStatsByIds,
} from "./player-repository";
export type {
  ScoutlabActionMapRow,
  ScoutlabMetricsRow,
  ScoutlabPlayerRow,
  ScoutlabRadarRow,
  ScoutlabSimilarityRow,
} from "./scoutlab-mappers";
export {
  getRankingData,
  getScatterData,
  getScoutlabActionMaps,
  getScoutlabFilterOptions,
  getScoutlabMetrics,
  getScoutlabPlayerById,
  getScoutlabProgression,
  getScoutlabRadar,
  getScoutlabSimilarity,
  searchScoutlabPlayers,
} from "./scoutlab-repository";
export { getAllStandings, getStandingsByTeamIds } from "./standing-repository";
export { getAllTeams, getTeamsByIds } from "./team-repository";
