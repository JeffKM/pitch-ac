// 탭 내비게이션 시 선수 컨텍스트 파라미터를 유지하기 위한 query string 빌더

import {
  DEFAULT_ADJUSTMENT,
  DEFAULT_MODE,
  DEFAULT_SEASON,
} from "./scoutlab-constants";

/** 탭 전환 시 유지할 컨텍스트 파라미터 키 목록 */
export const CONTEXT_PARAMS = [
  "playerId",
  "season",
  "mode",
  "adjustment",
] as const;

/** 현재 searchParams에서 컨텍스트 파라미터만 추출하여 query string 생성 */
export function buildContextQuery(searchParams: URLSearchParams): string {
  const params = new URLSearchParams();

  for (const key of CONTEXT_PARAMS) {
    const value = searchParams.get(key);
    if (!value) continue;

    // 기본값은 URL에 포함하지 않음
    if (key === "season" && value === DEFAULT_SEASON) continue;
    if (key === "mode" && value === DEFAULT_MODE) continue;
    if (key === "adjustment" && value === DEFAULT_ADJUSTMENT) continue;

    params.set(key, value);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
