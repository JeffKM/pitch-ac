// API-Football Raw 응답 타입 정의

/** API-Football 공통 응답 래퍼 */
export interface AfApiResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: Record<string, string>;
  results: number;
  paging: { current: number; total: number };
  response: T[];
}

// ──────────────────────────────────────────────────────
// Fixture (경기)
// ──────────────────────────────────────────────────────

export interface AfFixtureStatus {
  long: string;
  short: string; // "1H","2H","HT","FT","NS","PST" 등
  elapsed: number | null;
}

export interface AfFixtureInfo {
  id: number;
  referee: string | null;
  timezone: string;
  date: string; // ISO 8601
  timestamp: number;
  periods: { first: number | null; second: number | null };
  venue: { id: number | null; name: string | null; city: string | null };
  status: AfFixtureStatus;
}

export interface AfLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  round: string; // "Regular Season - 10"
}

export interface AfTeamRef {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

export interface AfGoals {
  home: number | null;
  away: number | null;
}

export interface AfScore {
  halftime: AfGoals;
  fulltime: AfGoals;
  extratime: AfGoals;
  penalty: AfGoals;
}

export interface AfFixture {
  fixture: AfFixtureInfo;
  league: AfLeague;
  teams: { home: AfTeamRef; away: AfTeamRef };
  goals: AfGoals;
  score: AfScore;
}

// ──────────────────────────────────────────────────────
// Fixture Events (경기 이벤트)
// ──────────────────────────────────────────────────────

export interface AfFixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string; // "Goal", "Card", "subst", "Var"
  detail: string; // "Normal Goal", "Yellow Card", "Substitution 1" 등
  comments: string | null;
}

/** /fixtures/events 응답 */
export interface AfFixtureEventsResponse {
  fixture: { id: number };
  events: AfFixtureEvent[];
}

// ──────────────────────────────────────────────────────
// Fixture Lineups (라인업)
// ──────────────────────────────────────────────────────

export interface AfLineupPlayer {
  id: number;
  name: string;
  number: number;
  pos: string; // "G","D","M","F"
  grid: string | null; // "1:1"
}

export interface AfLineup {
  team: { id: number; name: string; logo: string; colors: unknown };
  coach: { id: number; name: string; photo: string };
  formation: string; // "4-3-3"
  startXI: { player: AfLineupPlayer }[];
  substitutes: { player: AfLineupPlayer }[];
}

// ──────────────────────────────────────────────────────
// Fixture Statistics (경기 통계)
// ──────────────────────────────────────────────────────

export interface AfFixtureStatItem {
  type: string; // "Ball Possession", "Total Shots" 등
  value: string | number | null;
}

export interface AfFixtureStatistic {
  team: { id: number; name: string; logo: string };
  statistics: AfFixtureStatItem[];
}

// ──────────────────────────────────────────────────────
// Team (팀)
// ──────────────────────────────────────────────────────

export interface AfTeam {
  team: {
    id: number;
    name: string;
    code: string; // "MCI", "LIV" 등
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

// ──────────────────────────────────────────────────────
// Player (선수)
// ──────────────────────────────────────────────────────

export interface AfPlayerInfo {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birth: { date: string; place: string | null; country: string };
  nationality: string;
  height: string | null;
  weight: string | null;
  injured: boolean;
  photo: string;
}

export interface AfPlayerStatGames {
  appearences: number | null; // API 오타 주의 (appearences)
  lineups: number | null;
  minutes: number | null;
  number: number | null;
  position: string; // "Goalkeeper","Defender","Midfielder","Attacker"
  rating: string | null; // "7.200000"
  captain: boolean;
}

export interface AfPlayerStatGoals {
  total: number | null;
  conceded: number | null;
  assists: number | null;
  saves: number | null;
}

export interface AfPlayerStatPasses {
  total: number | null;
  key: number | null;
  accuracy: number | null;
}

export interface AfPlayerStatTackles {
  total: number | null;
  blocks: number | null;
  interceptions: number | null;
}

export interface AfPlayerStatDribbles {
  attempts: number | null;
  success: number | null;
  past: number | null;
}

export interface AfPlayerStatCards {
  yellow: number | null;
  yellowred: number | null;
  red: number | null;
}

export interface AfPlayerStatistics {
  team: { id: number; name: string; logo: string };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
  };
  games: AfPlayerStatGames;
  substitutes: { in: number | null; out: number | null; bench: number | null };
  shots: { total: number | null; on: number | null };
  goals: AfPlayerStatGoals;
  passes: AfPlayerStatPasses;
  tackles: AfPlayerStatTackles;
  duels: { total: number | null; won: number | null };
  dribbles: AfPlayerStatDribbles;
  fouls: { drawn: number | null; committed: number | null };
  cards: AfPlayerStatCards;
  penalty: {
    won: number | null;
    committed: number | null;
    scored: number | null;
    missed: number | null;
    saved: number | null;
  };
}

export interface AfPlayer {
  player: AfPlayerInfo;
  statistics: AfPlayerStatistics[];
}

// ──────────────────────────────────────────────────────
// Squad (스쿼드)
// ──────────────────────────────────────────────────────

export interface AfSquadPlayer {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string; // "Goalkeeper","Defender","Midfielder","Attacker"
  photo: string;
}

export interface AfSquadResponse {
  team: { id: number; name: string; logo: string };
  players: AfSquadPlayer[];
}

// ──────────────────────────────────────────────────────
// Standings (순위)
// ──────────────────────────────────────────────────────

export interface AfStandingEntry {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string; // "WWDLW"
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  update: string;
}

export interface AfStandingsResponse {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: AfStandingEntry[][];
  };
}

// ──────────────────────────────────────────────────────
// Rounds (라운드)
// ──────────────────────────────────────────────────────

// API-Football rounds는 문자열 배열: ["Regular Season - 1", "Regular Season - 2", ...]
export type AfRound = string;
