// ScoutLab 스크래퍼 상수

export const SCOUTLAB_URL = "https://scoutlab.streamlit.app/";

/** 포지션 매핑 (ScoutLab → DB) */
export const POSITION_MAP: Record<string, string> = {
  CB: "CB",
  FB: "FB",
  MF: "MF",
  "AM/W": "AM/W",
  FW: "FW",
};

/** 기본 시즌 */
export const DEFAULT_SEASON = "25/26";

/** 기본 리그 */
export const DEFAULT_LEAGUE = "Premier League";

/** Streamlit 로딩 대기 타임아웃 (ms) */
export const STREAMLIT_LOAD_TIMEOUT = 30_000;

/** 선수 간 기본 딜레이 (ms) */
export const DEFAULT_DELAY = 1_000;
