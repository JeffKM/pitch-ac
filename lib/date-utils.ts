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

// ─── 매치데이 날짜 네비게이션용 ──────────────────────────────────

/** 오늘 KST 기준 YYYY-MM-DD */
export function getTodayDateKey(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

/** YYYY-MM-DD 형식 검증 */
export function isValidDateKey(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + "T00:00:00");
  return !isNaN(d.getTime());
}

/** 날짜 덧셈 (YYYY-MM-DD 기준) */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00+09:00"); // KST 정오 기준
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

/** 날짜 스트립용 짧은 레이블 */
export function formatStripDate(dateStr: string): {
  day: string;
  weekday: string;
} {
  const d = new Date(dateStr + "T12:00:00+09:00");
  const dayNum = d.toLocaleDateString("ko-KR", {
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
  // ko-KR day: "numeric"은 "11" 또는 "11일"을 반환 — 숫자만 추출 후 "일" 접미사
  const dayDigits = dayNum.replace(/\D/g, "");
  const weekday = new Intl.DateTimeFormat("ko-KR", {
    weekday: "short",
    timeZone: "Asia/Seoul",
  }).format(d);
  return { day: `${dayDigits}일`, weekday };
}

/** YYYY-MM-DD → "5월 11일 일요일" 형태 */
export function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00+09:00");
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Seoul",
  }).format(d);
}
