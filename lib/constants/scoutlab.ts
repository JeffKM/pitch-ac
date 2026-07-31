// ScoutLab 활성 시즌 — 데이터 수집이 끝난 시즌만 노출한다.
// 26/27 데이터 수집 전환은 Phase SR04에서 이 상수 하나만 변경한다.

import type { ScoutlabSeason } from "@/types";

/** ScoutLab 화면·API·동기화가 공통으로 사용하는 활성 시즌 */
export const SCOUTLAB_ACTIVE_SEASON: ScoutlabSeason = "25/26";
