// 에펨코리아 크롤링 rate limiter
// 봇 감지 회피를 위한 랜덤 간격 방식

const MIN_INTERVAL_MS = 5000; // 최소 5초
const MAX_JITTER_MS = 3000; // 최대 3초 추가 랜덤
let lastRequestAt = 0;

export async function waitForRateLimit(): Promise<void> {
  const jitter = Math.floor(Math.random() * MAX_JITTER_MS);
  const requiredGap = MIN_INTERVAL_MS + jitter;
  const elapsed = Date.now() - lastRequestAt;

  if (elapsed < requiredGap) {
    await new Promise((r) => setTimeout(r, requiredGap - elapsed));
  }
  lastRequestAt = Date.now();
}
