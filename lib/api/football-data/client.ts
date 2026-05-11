// football-data.org v4 HTTP 클라이언트
import "server-only";

/** football-data.org API 에러 */
export class FootballDataError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "FootballDataError";
  }
}

/** 분당 요청 한도 초과 에러 */
export class RateLimitError extends FootballDataError {
  constructor() {
    super(429, "분당 API 요청 한도(10)를 초과했습니다");
    this.name = "RateLimitError";
  }
}

const BASE_URL = "https://api.football-data.org/v4";

interface FetchOptions {
  /** 쿼리 파라미터 */
  params?: Record<string, string | number | boolean>;
  /** Next.js revalidate 초 (기본: 300 = 5분) */
  revalidate?: number;
  /** Next.js 캐시 태그 */
  tags?: string[];
  /** 타임아웃 ms (기본: 15000) */
  timeout?: number;
  /** 캐시 비활성화 */
  noCache?: boolean;
}

/**
 * football-data.org API 호출 공통 함수
 * - `X-Auth-Token` 헤더 인증
 * - 분당 10회 슬라이딩 윈도우 레이트 리미팅
 * - 429 응답 시 자동 대기 후 재시도 (1회)
 */
export async function footballDataFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY 환경 변수가 설정되지 않았습니다");
  }

  const {
    params = {},
    revalidate = 300,
    tags,
    timeout = 15000,
    noCache = false,
  } = options;

  // URL 조립
  const url = new URL(`${BASE_URL}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  // rate limiter 체크
  const { canMakeRequest, recordRequest, getWaitTime } =
    await import("./rate-limiter");

  if (!canMakeRequest()) {
    const waitMs = getWaitTime();
    if (waitMs > 0 && waitMs <= 60_000) {
      console.warn(`[football-data] 레이트 리밋 대기: ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs + 100));
    }
    if (!canMakeRequest()) {
      throw new RateLimitError();
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit & {
      next?: { revalidate?: number; tags?: string[] };
    } = {
      headers: {
        "X-Auth-Token": apiKey,
      },
      signal: controller.signal,
    };

    if (noCache) {
      fetchOptions.cache = "no-store";
    } else {
      fetchOptions.next = { revalidate, ...(tags ? { tags } : {}) };
    }

    const response = await fetch(url.toString(), fetchOptions);

    // 429: 대기 후 1회 재시도
    if (response.status === 429) {
      const retryAfter = response.headers.get("X-RequestCounter-Reset");
      const waitSec = retryAfter ? parseInt(retryAfter, 10) : 60;
      console.warn(`[football-data] 429 응답, ${waitSec}초 대기 후 재시도`);
      await new Promise((resolve) => setTimeout(resolve, waitSec * 1000 + 100));

      const retryResponse = await fetch(url.toString(), fetchOptions);
      if (!retryResponse.ok) {
        throw new FootballDataError(
          retryResponse.status,
          `football-data ${endpoint} 재시도 실패: ${retryResponse.status}`,
        );
      }
      recordRequest();
      return (await retryResponse.json()) as T;
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new FootballDataError(
        response.status,
        `football-data ${endpoint} 요청 실패: ${response.status} ${errorBody}`,
      );
    }

    recordRequest();
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof FootballDataError || error instanceof RateLimitError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new FootballDataError(
        408,
        `football-data ${endpoint} 타임아웃 (${timeout}ms)`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
