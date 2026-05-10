// ScoutLab searchParams 파싱 유틸 (Server Component용)
import "server-only";

import type {
  ScoutlabAdjustment,
  ScoutlabLeague,
  ScoutlabMode,
  ScoutlabPosition,
} from "@/types";

import {
  DEFAULT_ADJUSTMENT,
  DEFAULT_MODE,
  DEFAULT_SEASON,
  VALID_ADJUSTMENTS,
  VALID_LEAGUES,
  VALID_MODES,
  VALID_POSITIONS,
} from "./scoutlab-constants";

/** ScoutLab 페이지 공통 searchParams 타입 */
export interface ScoutlabPageParams {
  playerId: number | null;
  season: string;
  league: ScoutlabLeague | null;
  team: string | null;
  position: ScoutlabPosition | null;
  mode: ScoutlabMode;
  adjustment: ScoutlabAdjustment;
}

/** searchParams를 파싱하여 타입 안전한 객체로 변환 */
export function parseScoutlabParams(
  searchParams: Record<string, string | string[] | undefined>,
): ScoutlabPageParams {
  const raw = (key: string): string | undefined => {
    const val = searchParams[key];
    return Array.isArray(val) ? val[0] : val;
  };

  const playerIdStr = raw("playerId");
  const playerId = playerIdStr ? parseInt(playerIdStr, 10) : null;

  const season = raw("season") || DEFAULT_SEASON;

  const leagueStr = raw("league");
  const league =
    leagueStr && VALID_LEAGUES.includes(leagueStr as ScoutlabLeague)
      ? (leagueStr as ScoutlabLeague)
      : null;

  const teamStr = raw("team");
  const team = teamStr || null;

  const posStr = raw("position");
  const position =
    posStr && VALID_POSITIONS.includes(posStr as ScoutlabPosition)
      ? (posStr as ScoutlabPosition)
      : null;

  const modeStr = raw("mode");
  const mode =
    modeStr && VALID_MODES.includes(modeStr as ScoutlabMode)
      ? (modeStr as ScoutlabMode)
      : DEFAULT_MODE;

  const adjStr = raw("adjustment");
  const adjustment =
    adjStr && VALID_ADJUSTMENTS.includes(adjStr as ScoutlabAdjustment)
      ? (adjStr as ScoutlabAdjustment)
      : DEFAULT_ADJUSTMENT;

  return {
    playerId: playerId && !isNaN(playerId) ? playerId : null,
    season,
    league,
    team,
    position,
    mode,
    adjustment,
  };
}
