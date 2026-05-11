// football-data.org 분당 10회 슬라이딩 윈도우 레이트 리미터

const RATE_LIMIT = 10; // 분당 최대 요청 수
const WINDOW_MS = 60_000; // 1분

/** 요청 타임스탬프 배열 (슬라이딩 윈도우) */
const timestamps: number[] = [];

/** 만료된 타임스탬프 정리 */
function pruneExpired(): void {
  const now = Date.now();
  while (timestamps.length > 0 && timestamps[0]! < now - WINDOW_MS) {
    timestamps.shift();
  }
}

/** 요청 가능 여부 확인 */
export function canMakeRequest(): boolean {
  pruneExpired();
  return timestamps.length < RATE_LIMIT;
}

/** 요청 기록 */
export function recordRequest(): void {
  pruneExpired();
  timestamps.push(Date.now());
  if (timestamps.length >= RATE_LIMIT - 1) {
    console.warn(
      `[football-data] 분당 요청 ${timestamps.length}/${RATE_LIMIT}`,
    );
  }
}

/** 다음 요청 가능 시간까지 대기해야 하는 ms */
export function getWaitTime(): number {
  pruneExpired();
  if (timestamps.length < RATE_LIMIT) return 0;
  const oldest = timestamps[0]!;
  return oldest + WINDOW_MS - Date.now();
}

/** 현재 사용량 조회 (디버그용) */
export function getUsage(): {
  used: number;
  remaining: number;
  limit: number;
  windowMs: number;
} {
  pruneExpired();
  return {
    used: timestamps.length,
    remaining: Math.max(0, RATE_LIMIT - timestamps.length),
    limit: RATE_LIMIT,
    windowMs: WINDOW_MS,
  };
}
