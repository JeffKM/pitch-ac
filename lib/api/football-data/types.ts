// football-data.org v4 API 응답 타입 정의

// ──────────────────────────────────────────────────────
// 공통
// ──────────────────────────────────────────────────────

export interface FdCompetition {
  id: number;
  name: string;
  code: string; // "PL", "PD", "SA", "BL1", "FL1"
  type: string;
  emblem: string;
}

export interface FdSeason {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
  winner: unknown | null;
}

export interface FdArea {
  id: number;
  name: string;
  code: string;
  flag: string | null;
}

// ──────────────────────────────────────────────────────
// Team (팀)
// ──────────────────────────────────────────────────────

export interface FdTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string; // 3글자 약어 (MCI, ARS 등)
  crest: string; // SVG 로고 URL
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  coach: FdCoach | null;
  squad: FdSquadPlayer[];
}

export interface FdCoach {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  dateOfBirth: string;
  nationality: string;
}

export interface FdSquadPlayer {
  id: number;
  name: string;
  position: string | null; // "Goalkeeper", "Defence", "Midfield", "Offence"
  dateOfBirth: string;
  nationality: string;
}

/** /competitions/{code}/teams 응답 */
export interface FdTeamsResponse {
  count: number;
  competition: FdCompetition;
  season: FdSeason;
  teams: FdTeam[];
}

// ──────────────────────────────────────────────────────
// Match (경기)
// ──────────────────────────────────────────────────────

export interface FdMatchTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface FdScore {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT";
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface FdReferee {
  id: number;
  name: string;
  type: string;
  nationality: string;
}

/** 경기 상태 (football-data.org) */
export type FdMatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export interface FdMatch {
  id: number;
  utcDate: string; // ISO 8601
  status: FdMatchStatus;
  matchday: number;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: FdMatchTeam;
  awayTeam: FdMatchTeam;
  score: FdScore;
  referees: FdReferee[];
  competition: FdCompetition;
  season: FdSeason;
  area: FdArea;
}

/** /competitions/{code}/matches 응답 */
export interface FdMatchesResponse {
  count: number;
  filters: Record<string, unknown>;
  competition: FdCompetition;
  matches: FdMatch[];
}

/** /matches/{id} 응답 */
export interface FdMatchDetailResponse extends FdMatch {
  head2head: {
    numberOfMatches: number;
    totalGoals: number;
    homeTeam: {
      id: number;
      name: string;
      wins: number;
      draws: number;
      losses: number;
    };
    awayTeam: {
      id: number;
      name: string;
      wins: number;
      draws: number;
      losses: number;
    };
  };
}

// ──────────────────────────────────────────────────────
// Standings (순위)
// ──────────────────────────────────────────────────────

export interface FdStandingEntry {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  form: string | null; // "W,D,L,W,W"
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface FdStandingTable {
  stage: string;
  type: string; // "TOTAL", "HOME", "AWAY"
  group: string | null;
  table: FdStandingEntry[];
}

/** /competitions/{code}/standings 응답 */
export interface FdStandingsResponse {
  competition: FdCompetition;
  season: FdSeason;
  standings: FdStandingTable[];
}

// ──────────────────────────────────────────────────────
// Scorers (득점 순위)
// ──────────────────────────────────────────────────────

export interface FdScorerPlayer {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  section: string; // "OFFENCE", "MIDFIELD" 등
  position: string | null;
  shirtNumber: number | null;
  lastUpdated: string;
}

export interface FdScorer {
  player: FdScorerPlayer;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedMatches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

/** /competitions/{code}/scorers 응답 */
export interface FdScorersResponse {
  count: number;
  competition: FdCompetition;
  season: FdSeason;
  scorers: FdScorer[];
}
