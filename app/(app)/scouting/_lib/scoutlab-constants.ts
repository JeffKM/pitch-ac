// ScoutLab 공유 상수 (Server/Client 공용)

import type {
  ScoutlabAdjustment,
  ScoutlabComparisonPosition,
  ScoutlabLeague,
  ScoutlabMode,
  ScoutlabPosition,
} from "@/types";

export const VALID_LEAGUES: ScoutlabLeague[] = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
];

export const VALID_POSITIONS: ScoutlabPosition[] = [
  "CB",
  "FB",
  "MF",
  "AM",
  "W",
  "AM/W",
  "FW",
];

export const VALID_MODES: ScoutlabMode[] = ["per90", "total"];

export const VALID_ADJUSTMENTS: ScoutlabAdjustment[] = ["padj", "raw"];

export const VALID_COMPARISON_POSITIONS: ScoutlabComparisonPosition[] = [
  "CB",
  "FB",
  "MF",
  "AM/W",
  "FW",
];

export const COMPARISON_POSITION_LABELS: Record<
  ScoutlabComparisonPosition,
  string
> = {
  CB: "Centre-Backs",
  FB: "Full-Backs",
  MF: "Midfielders",
  "AM/W": "Att Mid/Wingers",
  FW: "Forwards",
};

export const DEFAULT_SEASON = "25/26";
export const DEFAULT_MODE: ScoutlabMode = "per90";
export const DEFAULT_ADJUSTMENT: ScoutlabAdjustment = "padj";
export const DEFAULT_COMPARISON_POSITION: ScoutlabComparisonPosition = "AM/W";

/** 선수 포지션 → 비교 포지션 그룹 매핑 */
export function positionToComparisonPosition(
  position: ScoutlabPosition,
): ScoutlabComparisonPosition {
  switch (position) {
    case "AM":
    case "W":
    case "AM/W":
      return "AM/W";
    case "CB":
    case "FB":
    case "MF":
    case "FW":
      return position;
  }
}
