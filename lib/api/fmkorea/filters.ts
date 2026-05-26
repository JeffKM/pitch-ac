// 금칙어 필터링

import { BANNED_KEYWORDS } from "@/lib/constants/fmkorea";

export function isBannedPost(title: string): boolean {
  const lower = title.toLowerCase();
  return BANNED_KEYWORDS.some((keyword) => lower.includes(keyword));
}
