// API 응답 타입 정의

/** 성공 응답 래퍼 */
export interface ApiResponse<T> {
  data: T;
  error: null;
  timestamp: string;
}

/** 에러 응답 래퍼 */
export interface ApiErrorResponse {
  data: null;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/** 페이지네이션 메타 정보 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** 페이지네이션 응답 래퍼 */
export interface PaginatedResponse<T> {
  data: T[];
  error: null;
  timestamp: string;
  pagination: PaginationMeta;
}

/** 유니온 타입 — 타입 내로잉 지원 */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
