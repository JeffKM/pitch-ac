// 날짜/시간 포맷 유틸리티 — KST(Asia/Seoul) 기준

/** UTC 날짜 문자열 → 킥오프 시간 문자열 (예: "오후 8:00") */
export function formatKickoffTime(dateStr: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(dateStr));
}

/** UTC 날짜 문자열 → 킥오프 날짜 문자열 (예: "3월 16일 (일)") */
export function formatKickoffDate(dateStr: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(dateStr));
}

/** UTC 날짜 문자열 → 날짜 레이블 (예: "3월 16일 일요일") */
export function formatDateLabel(dateStr: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(dateStr));
}

/** UTC 날짜 문자열 → 짧은 날짜 (예: "3월 16일") */
export function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(dateStr));
}

/** UTC 날짜 문자열 → H2H 날짜 (예: "24년 3월 16일") */
export function formatH2HDate(dateStr: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(dateStr));
}

/** UTC 날짜 문자열 → 날짜 키 YYYY-MM-DD (KST 기준) */
export function toDateKey(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });
}
