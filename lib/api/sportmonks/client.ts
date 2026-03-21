// SportMonks API HTTP 클라이언트 — 서버 사이드 전용
import "server-only";

import { SPORTMONKS_BASE_URL } from "./constants";

/** SportMonks API 기본 에러 */
export class SportMonksApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "SportMonksApiError";
  }
}

/** Rate limit 초과 에러 */
export class RateLimitError extends SportMonksApiError {
  constructor(public readonly retryAfterSeconds: number) {
    super(
      429,
      "RATE_LIMIT_EXCEEDED",
      `Rate limit 초과. ${retryAfterSeconds}초 후 재시도`,
    );
    this.name = "RateLimitError";
  }
}

/** API 요청 옵션 */
export interface SportMonksFetchOptions {
  /** include 파라미터 (중첩 데이터, 세미콜론으로 합쳐짐) */
  includes?: string[];
  /** 필터 (filters=key:value;key:value 형식) */
  filters?: Record<string, string | number>;
  /** 추가 쿼리 파라미터 */
  params?: Record<string, string | number>;
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 항목 수 */
  perPage?: number;
  /** 타임아웃 ms (기본 10초) */
  timeout?: number;
  /** Next.js 캐시 revalidate 초 (false = no-store) */
  revalidate?: number | false;
  /** Next.js 캐시 태그 (revalidateTag로 무효화) */
  tags?: string[];
}

/**
 * SportMonks API fetch 래퍼
 * - Authorization 헤더로 인증
 * - Next.js fetch 캐싱 활용
 * - rate limit/timeout 에러 처리
 */
export async function sportMonksFetch<T>(
  endpoint: string,
  options: SportMonksFetchOptions = {},
): Promise<T> {
  const apiKey = process.env.SPORTMONKS_API_KEY;
  if (!apiKey) {
    throw new SportMonksApiError(
      500,
      "MISSING_API_KEY",
      "SPORTMONKS_API_KEY 환경변수가 설정되지 않았습니다",
    );
  }

  const url = buildUrl(endpoint, options);
  const controller = new AbortController();
  const timeoutMs = options.timeout ?? 10_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      next: {
        revalidate: options.revalidate ?? 300, // 기본 5분 캐시
        tags: options.tags,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("Retry-After") ?? "60",
          10,
        );
        throw new RateLimitError(retryAfter);
      }
      const errorBody = await response.text().catch(() => "");
      throw new SportMonksApiError(
        response.status,
        `HTTP_${response.status}`,
        `SportMonks API 오류 ${response.status}: ${errorBody}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof SportMonksApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new SportMonksApiError(
        408,
        "TIMEOUT",
        `API 요청 타임아웃 (${timeoutMs}ms)`,
      );
    }
    throw new SportMonksApiError(
      500,
      "NETWORK_ERROR",
      `네트워크 오류: ${String(error)}`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/** URL 빌드 — includes, filters, params 조합 */
function buildUrl(endpoint: string, options: SportMonksFetchOptions): URL {
  const url = new URL(`${SPORTMONKS_BASE_URL}${endpoint}`);

  // include: 세미콜론으로 구분
  if (options.includes?.length) {
    url.searchParams.set("include", options.includes.join(";"));
  }

  // filters: filters=key:value;key:value 형식 (SportMonks v3 공식 포맷)
  if (options.filters && Object.keys(options.filters).length > 0) {
    const filterString = Object.entries(options.filters)
      .map(([key, value]) => `${key}:${value}`)
      .join(";");
    url.searchParams.set("filters", filterString);
  }

  // 기타 쿼리 파라미터
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, String(value));
    }
  }

  if (options.page) url.searchParams.set("page", String(options.page));
  if (options.perPage)
    url.searchParams.set("per_page", String(options.perPage));

  return url;
}
