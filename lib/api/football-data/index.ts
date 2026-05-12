// football-data.org 모듈 진입점

export * from "./client";
export * from "./fixtures";
export * from "./mappers";
export { getUsage } from "./rate-limiter";
export * from "./scorers";
export * from "./standings";
export * from "./teams";
export type {
  FdMatch,
  FdMatchesResponse,
  FdScorer,
  FdScorersResponse,
  FdSquadPlayer,
  FdStandingEntry,
  FdStandingsResponse,
  FdTeam,
  FdTeamsResponse,
} from "./types";
