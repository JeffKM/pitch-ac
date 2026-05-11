// API-Football 일일 요청 카운터 + 안전장치
// 인메모리 카운터 — 00:00 UTC 초기화

const DAILY_LIMIT = 100;
const SOFT_LIMIT = 90; // 이 수치 이후 경고 로그

let counter = 0;
let lastResetDate = getUtcDateString();

function getUtcDateString(): string {
  return new Date().toISOString().slice(0, 10); // "2025-05-11"
}

function resetIfNewDay(): void {
  const today = getUtcDateString();
  if (today !== lastResetDate) {
    counter = 0;
    lastResetDate = today;
  }
}

/** 요청 카운터 증가 */
export function incrementCounter(): void {
  resetIfNewDay();
  counter++;
  if (counter === SOFT_LIMIT) {
    console.warn(
      `[API-Football] 일일 요청 ${SOFT_LIMIT}회 도달. 남은 한도: ${DAILY_LIMIT - counter}`,
    );
  }
  if (counter > SOFT_LIMIT) {
    console.warn(`[API-Football] 일일 요청 ${counter}/${DAILY_LIMIT}`);
  }
}

/** 한도 도달 여부 확인 */
export function isLimitReached(): boolean {
  resetIfNewDay();
  return counter >= DAILY_LIMIT;
}

/** 현재 사용량 조회 (디버그용) */
export function getUsage(): {
  used: number;
  remaining: number;
  limit: number;
  date: string;
} {
  resetIfNewDay();
  return {
    used: counter,
    remaining: Math.max(0, DAILY_LIMIT - counter),
    limit: DAILY_LIMIT,
    date: lastResetDate,
  };
}
