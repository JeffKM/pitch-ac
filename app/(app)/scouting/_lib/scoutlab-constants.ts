// ScoutLab 공유 상수 (Server/Client 공용)

import type {
  ScoutlabAdjustment,
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

export const DEFAULT_SEASON = "25/26";
export const DEFAULT_MODE: ScoutlabMode = "per90";
export const DEFAULT_ADJUSTMENT: ScoutlabAdjustment = "padj";
