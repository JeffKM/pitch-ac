// API-Football Raw 타입 → 앱 내부 타입 변환

import {
  FIXTURE_STATUS_MAP,
  LEAGUE_NAME_MAP,
  PL_LEAGUE_ID,
  POSITION_MAP,
} from "@/lib/constants/football";
import type {
  Fixture,
  FixtureEvent,
  FixtureEventType,
  FixtureStatus,
  H2HResult,
  Lineup,
  LineupPlayer,
  Player,
  PlayerMatchStats,
  PlayerPosition,
  PlayerSeasonStats,
  StatContext,
  Team,
  TeamLiveStats,
  TeamStanding,
} from "@/types";

import type {
  AfFixture,
  AfFixtureEvent,
  AfFixtureStatistic,
  AfLineup,
  AfPlayer,
  AfSquadPlayer,
  AfStandingEntry,
  AfTeam,
} from "./types";

// ─────────────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────────────

/** "Regular Season - 10" → 10, 파싱 실패 시 null */
export function parseRoundNumber(round: string): number | null {
  const match = round.match(/(\d+)\s*$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return isNaN(n) ? null : n;
}

/** API-Football fixture status 문자열 → 앱 FixtureStatus */
function mapFixtureStatus(statusShort: string): FixtureStatus {
  return FIXTURE_STATUS_MAP[statusShort] ?? "NS";
}

/** 퍼센트 문자열 ("65%") → 숫자 (65) */
function parsePercentValue(value: string | number | null): number {
  if (value === null) return 0;
  if (typeof value === "number") return value;
  const n = parseInt(value.replace("%", ""), 10);
  return isNaN(n) ? 0 : n;
}

/** 문자열 또는 숫자 → 숫자 */
function toNumber(value: string | number | null): number {
  if (value === null) return 0;
  if (typeof value === "number") return value;
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

// ─────────────────────────────────────────────
// 팀 매퍼
// ─────────────────────────────────────────────

export function mapAfTeamToTeam(raw: AfTeam, season: string): Team {
  return {
    id: raw.team.id,
    name: raw.team.name,
    shortName: raw.team.code ?? raw.team.name.substring(0, 3).toUpperCase(),
    logoUrl: raw.team.logo,
    season,
  };
}

// ─────────────────────────────────────────────
// 선수 매퍼
// ─────────────────────────────────────────────

/** AfPlayer → Player (기본 정보) */
export function mapAfPlayerToPlayer(raw: AfPlayer): Player {
  const stats = raw.statistics?.[0];
  const positionStr = stats?.games.position ?? "Midfielder";
  const position = (POSITION_MAP[positionStr] ?? "MID") as PlayerPosition;
  const teamId = stats?.team.id ?? 0;
  const jerseyNumber = stats?.games.number ?? 0;

  return {
    id: raw.player.id,
    name: raw.player.name,
    photoUrl: raw.player.photo,
    teamId,
    position,
    number: jerseyNumber,
    nationality: raw.player.nationality ?? "",
  };
}

/** AfSquadPlayer → Player (스쿼드에서 가져온 간단 정보) */
export function mapAfSquadPlayerToPlayer(
  raw: AfSquadPlayer,
  teamId: number,
): Player {
  const position = (POSITION_MAP[raw.position] ?? "MID") as PlayerPosition;

  return {
    id: raw.id,
    name: raw.name,
    photoUrl: raw.photo,
    teamId,
    position,
    number: raw.number ?? 0,
    nationality: "",
  };
}

/** context 기본값 */
const DEFAULT_STAT_CONTEXT: StatContext = {
  rank: 0,
  percentile: 0,
  prevSeason: null,
};

export interface PlayerStatsContextMap {
  goals?: StatContext;
  assists?: StatContext;
  xg?: StatContext;
  xa?: StatContext;
  keyPasses?: StatContext;
  dribbles?: StatContext;
  averageRating?: StatContext;
}

type ContextKey =
  | "goals"
  | "assists"
  | "xg"
  | "xa"
  | "keyPasses"
  | "dribbles"
  | "averageRating";

/** AfPlayer → PlayerSeasonStats */
export function mapAfPlayerToSeasonStats(
  raw: AfPlayer,
  season: string,
  contextMap: PlayerStatsContextMap = {},
): PlayerSeasonStats | null {
  const stats = raw.statistics?.[0];
  if (!stats) return null;

  const goals = stats.goals.total ?? 0;
  const assists = stats.goals.assists ?? 0;
  const keyPasses = stats.passes.key ?? 0;
  const dribbles = stats.dribbles.success ?? 0;
  const ratingStr = stats.games.rating;
  const averageRating = ratingStr ? parseFloat(ratingStr) : 0;

  const xg: number | null = null;
  const xa: number | null = null;

  const getCtx = (key: ContextKey): StatContext =>
    contextMap[key] ?? DEFAULT_STAT_CONTEXT;

  const radarData = buildRadarDataFromAfPlayer(raw);

  return {
    playerId: raw.player.id,
    season,
    goals,
    goalsContext: getCtx("goals"),
    assists,
    assistsContext: getCtx("assists"),
    xg,
    xgContext: null,
    xa,
    xaContext: null,
    keyPasses,
    keyPassesContext: getCtx("keyPasses"),
    dribbles,
    dribblesContext: getCtx("dribbles"),
    averageRating,
    averageRatingContext: getCtx("averageRating"),
    radarData,
  };
}

/** 레이더 데이터 빌드 */
function buildRadarDataFromAfPlayer(
  raw: AfPlayer,
): PlayerSeasonStats["radarData"] {
  const stats = raw.statistics?.[0];
  const positionStr = stats?.games.position ?? "Midfielder";
  const position = (POSITION_MAP[positionStr] ?? "MID") as PlayerPosition;

  const goals = stats?.goals.total ?? 0;
  const shots = stats?.shots.total ?? 0;
  const keyPasses = stats?.passes.key ?? 0;
  const passes = stats?.passes.total ?? 0;
  const dribbles = stats?.dribbles.success ?? 0;
  const tackles = stats?.tackles.total ?? 0;
  const rating = stats?.games.rating ? parseFloat(stats.games.rating) : 6;

  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

  const pace = 50;
  const shooting = clamp(position === "GK" ? 10 : goals * 5 + shots * 0.5);
  const passing = clamp(passes * 0.3 + keyPasses * 2);
  const dribbling = clamp(dribbles * 3);
  const defending = clamp(
    position === "DEF" || position === "GK" ? tackles * 2 + 20 : tackles * 1.5,
  );
  const physical = clamp((rating - 6) * 20 + 50);

  const dims = [
    { dimension: "pace" as const, value: pace, label: "스피드" },
    { dimension: "shooting" as const, value: shooting, label: "슈팅" },
    { dimension: "passing" as const, value: passing, label: "패스" },
    { dimension: "dribbling" as const, value: dribbling, label: "드리블" },
    { dimension: "defending" as const, value: defending, label: "수비" },
    { dimension: "physical" as const, value: physical, label: "피지컬" },
  ];

  const sorted = [...dims].sort((a, b) => b.value - a.value);
  const strengths = sorted.slice(0, 3).map((d) => d.dimension);
  const weaknesses = sorted.slice(-3).map((d) => d.dimension);

  return {
    player: dims,
    positionAverage: dims.map((d) => ({ ...d, value: 50 })),
    strengths,
    weaknesses,
  };
}

/** AfPlayer → PlayerMatchStats */
export function mapAfPlayerToMatchStats(
  raw: AfPlayer,
  fixtureId: number,
): PlayerMatchStats | null {
  const stats = raw.statistics?.[0];
  if (!stats) return null;

  return {
    playerId: raw.player.id,
    fixtureId,
    rating: stats.games.rating ? parseFloat(stats.games.rating) : 0,
    goals: stats.goals.total ?? 0,
    assists: stats.goals.assists ?? 0,
    minutesPlayed: stats.games.minutes ?? 0,
  };
}

// ─────────────────────────────────────────────
// 경기 매퍼
// ─────────────────────────────────────────────

/** AfFixture → Fixture */
export function mapAfFixtureToFixture(raw: AfFixture): Fixture {
  const status = mapFixtureStatus(raw.fixture.status.short);
  const minute =
    status === "LIVE" ? (raw.fixture.status.elapsed ?? null) : null;

  const homeScore = raw.goals.home;
  const awayScore = raw.goals.away;

  const gameweek = parseRoundNumber(raw.league.round);

  const leagueId = raw.league.id;
  const competitionName =
    leagueId !== PL_LEAGUE_ID
      ? (LEAGUE_NAME_MAP[leagueId] ?? raw.league.name)
      : null;

  return {
    id: raw.fixture.id,
    gameweek,
    date: raw.fixture.date,
    homeTeamId: raw.teams.home.id,
    awayTeamId: raw.teams.away.id,
    status,
    homeScore,
    awayScore,
    minute,
    events: [],
    liveStats: null,
    lineups: null,
    leagueId,
    competitionName,
  };
}

/** AfFixtureEvent → FixtureEvent */
export function mapAfEventToFixtureEvent(
  event: AfFixtureEvent,
): FixtureEvent | null {
  let type: FixtureEventType | null = null;

  switch (event.type) {
    case "Goal":
      type = "goal";
      break;
    case "subst":
      type = "substitution";
      break;
    case "Card":
      if (event.detail.includes("Yellow")) type = "yellow_card";
      else if (event.detail.includes("Red")) type = "red_card";
      break;
    default:
      return null;
  }

  if (!type) return null;

  return {
    type,
    minute: event.time.elapsed,
    teamId: event.team.id,
    playerId: event.player.id,
    playerName: event.player.name,
  };
}

/** AfLineup → { home: Lineup, away: Lineup } */
export function mapAfLineupsToLineups(
  lineups: AfLineup[],
  homeTeamId: number,
): { home: Lineup; away: Lineup } | null {
  if (lineups.length < 2) return null;

  const homeLineup = lineups.find((l) => l.team.id === homeTeamId);
  const awayLineup = lineups.find((l) => l.team.id !== homeTeamId);
  if (!homeLineup || !awayLineup) return null;

  function buildLineup(raw: AfLineup): Lineup {
    const startXI: LineupPlayer[] = raw.startXI.map((entry) => ({
      playerId: entry.player.id,
      playerName: entry.player.name,
      number: entry.player.number,
      position: entry.player.pos ?? "",
      grid: entry.player.grid ?? undefined,
    }));

    const substitutes: LineupPlayer[] = raw.substitutes.map((entry) => ({
      playerId: entry.player.id,
      playerName: entry.player.name,
      number: entry.player.number,
      position: entry.player.pos ?? "",
    }));

    return {
      formation: raw.formation ?? "4-4-2",
      startXI,
      substitutes,
    };
  }

  return {
    home: buildLineup(homeLineup),
    away: buildLineup(awayLineup),
  };
}

/** AfFixtureStatistic[] → FixtureLiveStats */
export function mapAfStatisticsToLiveStats(
  statistics: AfFixtureStatistic[],
  homeTeamId: number,
): { home: TeamLiveStats; away: TeamLiveStats } | null {
  if (statistics.length < 2) return null;

  const homeStat = statistics.find((s) => s.team.id === homeTeamId);
  const awayStat = statistics.find((s) => s.team.id !== homeTeamId);
  if (!homeStat || !awayStat) return null;

  function getStatValue(stats: AfFixtureStatistic, type: string): number {
    const item = stats.statistics.find((s) => s.type === type);
    if (!item || item.value === null) return 0;
    if (type === "Ball Possession") return parsePercentValue(item.value);
    return toNumber(item.value);
  }

  function buildStats(stats: AfFixtureStatistic): TeamLiveStats {
    return {
      possession: getStatValue(stats, "Ball Possession"),
      shots: getStatValue(stats, "Total Shots"),
      shotsOnTarget: getStatValue(stats, "Shots on Goal"),
      xg: null, // 무료 플랜 미지원
      corners: getStatValue(stats, "Corner Kicks"),
      fouls: getStatValue(stats, "Fouls"),
    };
  }

  return {
    home: buildStats(homeStat),
    away: buildStats(awayStat),
  };
}

/** AfFixture → H2HResult */
export function mapAfFixtureToH2HResult(raw: AfFixture): H2HResult | null {
  if (raw.goals.home === null || raw.goals.away === null) return null;

  return {
    fixtureId: raw.fixture.id,
    date: raw.fixture.date,
    homeTeamId: raw.teams.home.id,
    awayTeamId: raw.teams.away.id,
    homeScore: raw.goals.home,
    awayScore: raw.goals.away,
  };
}

// ─────────────────────────────────────────────
// 순위표 매퍼
// ─────────────────────────────────────────────

/** AfStandingEntry → TeamStanding */
export function mapAfStandingToTeamStanding(
  raw: AfStandingEntry,
): TeamStanding {
  const form: Array<"W" | "D" | "L"> = raw.form
    ? (raw.form.split("").filter((c) => ["W", "D", "L"].includes(c)) as Array<
        "W" | "D" | "L"
      >)
    : [];

  return {
    teamId: raw.team.id,
    position: raw.rank,
    played: raw.all.played,
    won: raw.all.win,
    drawn: raw.all.draw,
    lost: raw.all.lose,
    goalsFor: raw.all.goals.for,
    goalsAgainst: raw.all.goals.against,
    goalDifference: raw.goalsDiff,
    points: raw.points,
    form,
  };
}
