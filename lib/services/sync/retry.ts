import "server-only";

import { RateLimitError } from "@/lib/api/sportmonks/client";

/**
 * Rate limit 대응 재시도 래퍼
 * RateLimitError 발생 시 retryAfterSeconds만큼 대기 후 재시도
 * 그 외 에러는 즉시 throw
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 1,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (error instanceof RateLimitError && attempt < maxRetries) {
        const waitMs = Math.min(error.retryAfterSeconds * 1000, 30_000);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
