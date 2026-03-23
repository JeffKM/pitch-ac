// SportMonks Raw 타입 → 앱 내부 타입 변환

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

import {
  EVENT_TYPE_ID,
  FIXTURE_STATE_MAP,
  LEAGUE_NAME_MAP,
  LINEUP_TYPE_ID,
  PL_LEAGUE_ID,
  POSITION_MAP,
  SCORE_TYPE_ID,
  STAT_TYPE_ID,
} from "./constants";
import type {
  SmEvent,
  SmFixture,
  SmFixtureStatistic,
  SmLineup,
  SmPlayer,
  SmStanding,
  SmStatDetail,
  SmStatValue,
  SmTeam,
} from "./types";

// ─────────────────────────────────────────────
// 순위표 상세 type_id (SportMonks v3 기준, 검증 필요)
// ─────────────────────────────────────────────
const STANDING_DETAIL_TYPE = {
  // Overall 통계 type_id — 실제 API 응답으로 검증 후 수정 필요
  GAMES_PLAYED: 129,
  WON: 130,
  DRAW: 131,
  LOST: 132,
  GOALS_FOR: 133,
  GOALS_AGAINST: 134,
  GOAL_DIFFERENCE: 182,
} as const;

// ─────────────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────────────

/** SmStatDetail 배열에서 type_id에 해당하는 숫자 값 추출 */
export function extractStatValue(
  details: SmStatDetail[] | undefined,
  typeId: number,
): number | null {
  if (!details) return null;
  const detail = details.find((d) => d.type_id === typeId);
  if (!detail) return null;
  return extractNumericFromSmStatValue(detail.value);
}

/** SmStatValue에서 숫자 추출 (다양한 구조 처리) */
function extractNumericFromSmStatValue(value: SmStatValue): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return isNaN(n) ? null : n;
  }
  if (typeof value === "object" && value !== null) {
    // { total: number } 구조
    if ("total" in value && typeof value.total === "number") return value.total;
    // { average: number } 구조 (평점)
    if ("average" in value && typeof value.average === "number")
      return value.average;
    // { in: number, out: number } 구조 — in 값 사용
    if ("in" in value && typeof (value as { in: number }).in === "number")
      return (value as { in: number }).in;
  }
  return null;
}

/** SmFixtureStatistic 배열에서 팀별 스탯 값 추출 */
function extractFixtureStatByParticipant(
  statistics: SmFixtureStatistic[],
  typeId: number,
  participantId: number,
): number | null {
  const stat = statistics.find(
    (s) => s.type_id === typeId && s.participant_id === participantId,
  );
  if (!stat || stat.data.value === null) return null;
  const val =
    typeof stat.data.value === "string"
      ? parseFloat(stat.data.value)
      : stat.data.value;
  return isNaN(val as number) ? null : (val as number);
}

/** SmStandingDetail 배열에서 type_id에 해당하는 숫자 추출 */
function extractStandingDetail(
  details: Array<{ type_id: number; value: number | string }> | undefined,
  typeId: number,
): number {
  if (!details) return 0;
  const d = details.find((item) => item.type_id === typeId);
  if (!d) return 0;
  const n = typeof d.value === "number" ? d.value : parseFloat(String(d.value));
  return isNaN(n) ? 0 : n;
}

/** 현재 시즌 문자열 반환 (예: "2025/2026") */
export function formatSeasonLabel(seasonId: number): string {
  // CURRENT_SEASON_ID = 25583 → "2025/2026"
  // SportMonks season id 패턴: 2자리 연도 두 개 조합 (예: 25583)
  // 단순화: 하드코딩 매핑 또는 API에서 name 가져옴
  // 여기서는 fallback으로 문자열 변환
  return String(seasonId);
}

// ─────────────────────────────────────────────
// 팀 매퍼
// ─────────────────────────────────────────────

export function mapSmTeamToTeam(raw: SmTeam, season: string): Team {
  return {
    id: raw.id,
    name: raw.name,
    shortName: raw.short_code ?? raw.name.substring(0, 3).toUpperCase(),
    logoUrl: raw.image_path,
    season,
  };
}

// ─────────────────────────────────────────────
// 선수 매퍼
// ─────────────────────────────────────────────

export function mapSmPlayerToPlayer(raw: SmPlayer): Player {
  // 포지션: teams[0].position_id 또는 raw.position_id
  const positionId = raw.teams?.[0]?.position_id ?? raw.position_id ?? 0;
  const position = (POSITION_MAP[positionId] ?? "MID") as PlayerPosition;

  // 팀 ID
  const teamId = raw.teams?.[0]?.team_id ?? 0;

  // 등번호
  const jerseyNumber = raw.teams?.[0]?.jersey_number ?? 0;

  // 국적
  const nationality = raw.nationality?.name ?? "";

  return {
    id: raw.id,
    name: raw.display_name || raw.common_name || raw.name,
    photoUrl: raw.image_path,
    teamId,
    position,
    number: jerseyNumber,
    nationality,
  };
}

/** context 기본값 — DB에서 실제 context를 넣기 전 placeholder */
const DEFAULT_STAT_CONTEXT: StatContext = {
  rank: 0,
  percentile: 0,
  prevSeason: null,
};

/** context 맵 키 */
type ContextKey =
  | "goals"
  | "assists"
  | "xg"
  | "xa"
  | "keyPasses"
  | "dribbles"
  | "averageRating";

export interface PlayerStatsContextMap {
  goals?: StatContext;
  assists?: StatContext;
  xg?: StatContext;
  xa?: StatContext;
  keyPasses?: StatContext;
  dribbles?: StatContext;
  averageRating?: StatContext;
}

/**
 * SmPlayer (statistics include 포함) → PlayerSeasonStats 변환
 * contextMap: DB에서 계산된 순위/백분위 데이터 (없으면 placeholder 사용)
 */
export function mapSmPlayerToSeasonStats(
  raw: SmPlayer,
  season: string,
  contextMap: PlayerStatsContextMap = {},
): PlayerSeasonStats | null {
  const statistic = raw.statistics?.[0];
  if (!statistic) return null;

  const details = statistic.details ?? [];

  const goals = extractStatValue(details, STAT_TYPE_ID.GOALS) ?? 0;
  const assists = extractStatValue(details, STAT_TYPE_ID.ASSISTS) ?? 0;
  const keyPasses = extractStatValue(details, STAT_TYPE_ID.KEY_PASSES) ?? 0;
  const dribbles =
    extractStatValue(details, STAT_TYPE_ID.SUCCESSFUL_DRIBBLES) ?? 0;
  const ratingRaw = extractStatValue(details, STAT_TYPE_ID.RATING);
  const averageRating = ratingRaw ?? 0;

  // xG/xA: Starter 플랜 미지원 → null (향후 플랜 업그레이드 시 자동 채워짐)
  const xg: number | null = null;
  const xa: number | null = null;

  const getCtx = (key: ContextKey): StatContext =>
    contextMap[key] ?? DEFAULT_STAT_CONTEXT;

  // radarData: 실제 집계 데이터 없이는 계산 불가 → 기본 구조 반환
  const radarData = buildRadarData(raw, details);

  return {
    playerId: raw.id,
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

/** 레이더 데이터 기본값 빌드 (집계 데이터 없이 단순 정규화) */
function buildRadarData(
  raw: SmPlayer,
  details: SmStatDetail[],
): PlayerSeasonStats["radarData"] {
  const position = (POSITION_MAP[
    raw.teams?.[0]?.position_id ?? raw.position_id ?? 0
  ] ?? "MID") as PlayerPosition;

  // 포지션별 가중치 기반 0~100 정규화 (실제 집계 없이는 rough estimate)
  const goals = extractStatValue(details, STAT_TYPE_ID.GOALS) ?? 0;
  const keyPasses = extractStatValue(details, STAT_TYPE_ID.KEY_PASSES) ?? 0;
  const dribbles =
    extractStatValue(details, STAT_TYPE_ID.SUCCESSFUL_DRIBBLES) ?? 0;
  const shots = extractStatValue(details, STAT_TYPE_ID.SHOTS_TOTAL) ?? 0;
  const tackles = extractStatValue(details, STAT_TYPE_ID.TACKLES) ?? 0;
  const passes = extractStatValue(details, STAT_TYPE_ID.ACCURATE_PASSES) ?? 0;
  const rating = extractStatValue(details, STAT_TYPE_ID.RATING) ?? 6;

  // 포지션별 rough 정규화 (실제 서비스에서는 리그 전체 백분위 사용)
  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

  const pace = 50; // API에서 직접 제공 안 됨 → 기본값
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

  // 강점/약점 계산
  const sorted = [...dims].sort((a, b) => b.value - a.value);
  const strengths = sorted.slice(0, 3).map((d) => d.dimension);
  const weaknesses = sorted.slice(-3).map((d) => d.dimension);

  return {
    player: dims,
    positionAverage: dims.map((d) => ({ ...d, value: 50 })), // 평균 50 placeholder
    strengths,
    weaknesses,
  };
}

/** SmPlayer → PlayerMatchStats (경기별 스탯) */
export function mapSmPlayerToMatchStats(
  raw: SmPlayer,
  fixtureId: number,
): PlayerMatchStats | null {
  const statistic = raw.statistics?.[0];
  if (!statistic) return null;
  const details = statistic.details ?? [];

  return {
    playerId: raw.id,
    fixtureId,
    rating: extractStatValue(details, STAT_TYPE_ID.RATING) ?? 0,
    goals: extractStatValue(details, STAT_TYPE_ID.GOALS) ?? 0,
    assists: extractStatValue(details, STAT_TYPE_ID.ASSISTS) ?? 0,
    minutesPlayed: extractStatValue(details, STAT_TYPE_ID.MINUTES_PLAYED) ?? 0,
  };
}

// ─────────────────────────────────────────────
// 경기 매퍼
// ─────────────────────────────────────────────

/** SmEvent → FixtureEvent */
function mapSmEvent(event: SmEvent): FixtureEvent | null {
  const typeMap: Record<number, FixtureEventType> = {
    [EVENT_TYPE_ID.GOAL]: "goal",
    [EVENT_TYPE_ID.OWN_GOAL]: "goal",
    [EVENT_TYPE_ID.PENALTY_SCORED]: "goal",
    [EVENT_TYPE_ID.SUBSTITUTION]: "substitution",
    [EVENT_TYPE_ID.YELLOW_CARD]: "yellow_card",
    [EVENT_TYPE_ID.RED_CARD]: "red_card",
    [EVENT_TYPE_ID.YELLOW_RED_CARD]: "red_card",
  };

  const type = typeMap[event.type_id];
  if (!type || !event.player_id) return null;

  return {
    type,
    minute: event.minute,
    teamId: event.participant_id,
    playerId: event.player_id,
    playerName: event.player_name ?? "",
    // xg는 Starter 플랜 미지원
  };
}

/** SmLineup[] → { home: Lineup, away: Lineup } | null */
function mapSmLineups(
  lineups: SmLineup[],
  homeParticipantId: number,
  awayParticipantId: number,
): { home: Lineup; away: Lineup } | null {
  if (!lineups.length) return null;

  function buildLineup(teamId: number): Lineup {
    const teamLineups = lineups.filter((l) => l.team_id === teamId);
    const startXI = teamLineups
      .filter((l) => l.type_id === LINEUP_TYPE_ID.STARTING)
      .map(mapSmLineupPlayer)
      .filter(Boolean) as LineupPlayer[];
    const substitutes = teamLineups
      .filter((l) => l.type_id === LINEUP_TYPE_ID.BENCH)
      .map(mapSmLineupPlayer)
      .filter(Boolean) as LineupPlayer[];

    // 포메이션: 라인업에서 직접 파악하기 어려움 → 참가팀 메타에서 가져오거나 기본값
    const formation = "4-4-2";

    return { formation, startXI, substitutes };
  }

  return {
    home: buildLineup(homeParticipantId),
    away: buildLineup(awayParticipantId),
  };
}

function mapSmLineupPlayer(raw: SmLineup): LineupPlayer | null {
  if (!raw.player) return null;
  return {
    playerId: raw.player_id,
    playerName:
      raw.player.display_name || raw.player.common_name || raw.player.name,
    number: raw.jersey_number,
    position:
      POSITION_MAP[raw.position_id] ??
      raw.player.position?.developer_name ??
      "",
    grid: raw.formation_field ?? undefined,
  };
}

/** SmFixtureStatistic[] → TeamLiveStats */
function mapSmStatisticsToLiveStats(
  statistics: SmFixtureStatistic[],
  homeId: number,
  awayId: number,
): { home: TeamLiveStats; away: TeamLiveStats } {
  const get = (typeId: number, participantId: number) =>
    extractFixtureStatByParticipant(statistics, typeId, participantId);

  const buildStats = (id: number): TeamLiveStats => ({
    possession: get(STAT_TYPE_ID.BALL_POSSESSION, id) ?? 50,
    shots: get(STAT_TYPE_ID.SHOTS_TOTAL, id) ?? 0,
    shotsOnTarget: get(STAT_TYPE_ID.SHOTS_ON_TARGET, id) ?? 0,
    xg: null, // Starter 플랜 미지원
    corners: get(STAT_TYPE_ID.CORNERS, id) ?? 0,
    fouls: get(STAT_TYPE_ID.FOULS, id) ?? 0,
  });

  return {
    home: buildStats(homeId),
    away: buildStats(awayId),
  };
}

export function mapSmFixtureToFixture(raw: SmFixture): Fixture {
  const participants = raw.participants ?? [];
  const homePart = participants.find((p) => p.meta?.location === "home");
  const awayPart = participants.find((p) => p.meta?.location === "away");
  const homeId = homePart?.id ?? 0;
  const awayId = awayPart?.id ?? 0;

  // 상태 매핑
  const developerName = raw.state?.developer_name?.toLowerCase() ?? "";
  const status: FixtureStatus = FIXTURE_STATE_MAP[developerName] ?? "NS";

  // LIVE 진행 분: 이벤트 최대값 또는 상태에서 추론
  const minute =
    status === "LIVE"
      ? (raw.events?.reduce((max, e) => Math.max(max, e.minute), 0) ?? null)
      : null;

  // 스코어 (type_id=1525: Current)
  let homeScore: number | null = null;
  let awayScore: number | null = null;
  if (raw.scores) {
    const homeCurrent = raw.scores.find(
      (s) =>
        s.type_id === SCORE_TYPE_ID.CURRENT && s.score.participant === "home",
    );
    const awayCurrent = raw.scores.find(
      (s) =>
        s.type_id === SCORE_TYPE_ID.CURRENT && s.score.participant === "away",
    );
    if (homeCurrent) homeScore = homeCurrent.score.goals;
    if (awayCurrent) awayScore = awayCurrent.score.goals;
  }

  // 이벤트
  const events: FixtureEvent[] = (raw.events ?? [])
    .map(mapSmEvent)
    .filter(Boolean) as FixtureEvent[];

  // 실시간 스탯
  const liveStats =
    raw.statistics && raw.statistics.length > 0 && homeId && awayId
      ? mapSmStatisticsToLiveStats(raw.statistics, homeId, awayId)
      : null;

  // 라인업
  const lineups =
    raw.lineups && raw.lineups.length > 0 && homeId && awayId
      ? mapSmLineups(raw.lineups, homeId, awayId)
      : null;

  // 게임위크: PL 경기는 round.name, 컵 경기는 null (나중에 assignGameweek로 할당)
  const gameweekRaw = raw.round?.name ? parseInt(raw.round.name, 10) : null;
  const gameweek =
    gameweekRaw !== null && !isNaN(gameweekRaw) ? gameweekRaw : null;

  // 대회 구분
  const leagueId = raw.league_id ?? PL_LEAGUE_ID;
  const competitionName =
    leagueId !== PL_LEAGUE_ID
      ? (LEAGUE_NAME_MAP[leagueId] ?? `League ${leagueId}`)
      : null;

  return {
    id: raw.id,
    gameweek,
    date: raw.starting_at,
    homeTeamId: homeId,
    awayTeamId: awayId,
    status,
    homeScore,
    awayScore,
    minute,
    events,
    liveStats,
    lineups,
    leagueId,
    competitionName,
  };
}

/** SmFixture → H2HResult (종료 경기만) */
export function mapSmFixtureToH2HResult(raw: SmFixture): H2HResult | null {
  const participants = raw.participants ?? [];
  const homePart = participants.find((p) => p.meta?.location === "home");
  const awayPart = participants.find((p) => p.meta?.location === "away");
  if (!homePart || !awayPart) return null;

  const homeCurrent = raw.scores?.find(
    (s) =>
      s.type_id === SCORE_TYPE_ID.CURRENT && s.score.participant === "home",
  );
  const awayCurrent = raw.scores?.find(
    (s) =>
      s.type_id === SCORE_TYPE_ID.CURRENT && s.score.participant === "away",
  );

  if (homeCurrent === undefined || awayCurrent === undefined) return null;

  return {
    fixtureId: raw.id,
    date: raw.starting_at,
    homeTeamId: homePart.id,
    awayTeamId: awayPart.id,
    homeScore: homeCurrent.score.goals,
    awayScore: awayCurrent.score.goals,
  };
}

// ─────────────────────────────────────────────
// 순위표 매퍼
// ─────────────────────────────────────────────

export function mapSmStandingToTeamStanding(raw: SmStanding): TeamStanding {
  const details = raw.details ?? [];

  const played = extractStandingDetail(
    details,
    STANDING_DETAIL_TYPE.GAMES_PLAYED,
  );
  const won = extractStandingDetail(details, STANDING_DETAIL_TYPE.WON);
  const drawn = extractStandingDetail(details, STANDING_DETAIL_TYPE.DRAW);
  const lost = extractStandingDetail(details, STANDING_DETAIL_TYPE.LOST);
  const goalsFor = extractStandingDetail(
    details,
    STANDING_DETAIL_TYPE.GOALS_FOR,
  );
  const goalsAgainst = extractStandingDetail(
    details,
    STANDING_DETAIL_TYPE.GOALS_AGAINST,
  );

  return {
    teamId: raw.participant_id,
    position: raw.position,
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: raw.points,
    form: [], // form 데이터는 별도 API 요청 또는 최근 경기 결과에서 계산
  };
}
