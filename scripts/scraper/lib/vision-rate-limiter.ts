// Gemini Vision API 분당 15회 슬라이딩 윈도우 레이트 리미터 (무료 티어)

const RATE_LIMIT = 15; // 분당 최대 요청 수 (Gemini 2.0 Flash 무료 티어)
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
export function canMakeVisionRequest(): boolean {
  pruneExpired();
  return timestamps.length < RATE_LIMIT;
}

/** 요청 기록 */
export function recordVisionRequest(): void {
  pruneExpired();
  timestamps.push(Date.now());
  if (timestamps.length >= RATE_LIMIT - 3) {
    console.warn(`[vision] 분당 요청 ${timestamps.length}/${RATE_LIMIT}`);
  }
}

/** 다음 요청 가능 시간까지 대기해야 하는 ms */
export function getVisionWaitTime(): number {
  pruneExpired();
  if (timestamps.length < RATE_LIMIT) return 0;
  const oldest = timestamps[0]!;
  return oldest + WINDOW_MS - Date.now();
}

/** 레이트 리밋 대기 후 요청 기록 */
export async function waitForVisionSlot(): Promise<void> {
  const waitMs = getVisionWaitTime();
  if (waitMs > 0) {
    console.log(`[vision] 레이트 리밋 대기: ${Math.ceil(waitMs / 1000)}초`);
    await new Promise((resolve) => setTimeout(resolve, waitMs + 100));
  }
  recordVisionRequest();
}
