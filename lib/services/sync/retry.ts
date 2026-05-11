import "server-only";

import { DailyLimitError } from "@/lib/api/api-football/client";

/**
 * 일일 한도 대응 재시도 래퍼
 * DailyLimitError 발생 시 즉시 throw (일일 한도 초과는 재시도 무의미)
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
      // 일일 한도 초과는 재시도 무의미
      if (error instanceof DailyLimitError) {
        throw error;
      }
      if (attempt < maxRetries) {
        // 짧은 대기 후 재시도
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
