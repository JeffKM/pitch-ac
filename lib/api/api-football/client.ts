// API-Football HTTP 클라이언트
import "server-only";

import type { AfApiResponse } from "./types";

/** API-Football 에러 */
export class ApiFootballError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiFootballError";
  }
}

/** 일일 요청 한도 초과 에러 */
export class DailyLimitError extends ApiFootballError {
  constructor() {
    super(429, "일일 API 요청 한도(100)를 초과했습니다");
    this.name = "DailyLimitError";
  }
}

const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";

interface FetchOptions {
  /** 쿼리 파라미터 */
  params?: Record<string, string | number | boolean>;
  /** Next.js revalidate 초 (기본: 300 = 5분) */
  revalidate?: number;
  /** Next.js 캐시 태그 */
  tags?: string[];
  /** 타임아웃 ms (기본: 10000) */
  timeout?: number;
  /** 캐시 비활성화 */
  noCache?: boolean;
}

/**
 * API-Football API 호출 공통 함수
 * - `x-apisports-key` 헤더 인증
 * - 표준 쿼리 파라미터 (?key=value&key=value)
 * - 에러 처리: 상태 코드 + errors 배열 확인
 */
export async function apiFootballFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<AfApiResponse<T>> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY 환경 변수가 설정되지 않았습니다");
  }

  const {
    params = {},
    revalidate = 300,
    tags,
    timeout = 10000,
    noCache = false,
  } = options;

  // URL 조립
  const url = new URL(`${API_FOOTBALL_BASE_URL}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  // rate limiter 카운트
  const { incrementCounter, isLimitReached } = await import("./rate-limiter");
  if (isLimitReached()) {
    throw new DailyLimitError();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit & {
      next?: { revalidate?: number; tags?: string[] };
    } = {
      headers: {
        "x-apisports-key": apiKey,
      },
      signal: controller.signal,
    };

    if (noCache) {
      fetchOptions.cache = "no-store";
    } else {
      fetchOptions.next = { revalidate, ...(tags ? { tags } : {}) };
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      if (response.status === 429) {
        throw new DailyLimitError();
      }
      throw new ApiFootballError(
        response.status,
        `API-Football ${endpoint} 요청 실패: ${response.status}`,
      );
    }

    const data = (await response.json()) as AfApiResponse<T>;

    // API-Football은 200 반환하면서 errors에 메시지를 담는 경우가 있음
    if (data.errors && Object.keys(data.errors).length > 0) {
      const errorMsg = Object.values(data.errors).join(", ");
      throw new ApiFootballError(400, `API-Football 에러: ${errorMsg}`);
    }

    incrementCounter();
    return data;
  } catch (error) {
    if (error instanceof ApiFootballError || error instanceof DailyLimitError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiFootballError(
        408,
        `API-Football ${endpoint} 타임아웃 (${timeout}ms)`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
