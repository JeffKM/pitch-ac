import "server-only";

import { RateLimitError } from "@/lib/api/football-data/client";

/**
 * 레이트 리밋 대응 재시도 래퍼
 * RateLimitError 발생 시 즉시 throw (분당 한도 초과는 대기 필요)
 * 그 외 에러는 1회 재시도
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
      if (error instanceof RateLimitError) {
        throw error;
      }
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
