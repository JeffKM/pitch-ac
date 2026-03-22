// 카툰 에셋 URL 리졸버 — 선수 + 감정 → 이미지 URL

import type { CartoonMood } from "@/types/cartoon";

/** Supabase Storage 버킷 기본 경로 */
const CARTOON_BUCKET_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL +
  "/storage/v1/object/public/cartoon-assets";

/** 카툰 에셋 전신 이미지 URL 반환 */
export function getCartoonImageUrl(
  playerId: number,
  mood: CartoonMood,
): string {
  return `${CARTOON_BUCKET_URL}/players/${playerId}/${mood}.webp`;
}

/** 카툰 에셋 썸네일 URL 반환 */
export function getCartoonThumbUrl(
  playerId: number,
  mood: CartoonMood,
): string {
  return `${CARTOON_BUCKET_URL}/players/${playerId}/${mood}-thumb.webp`;
}

/** 에셋이 존재하지 않을 때 폴백 감정 (neutral → 기본 플레이스홀더) */
export const FALLBACK_MOOD: CartoonMood = "neutral";

/** 폴백 카툰 이미지 (에셋 미등록 선수용 실루엣) */
export function getFallbackImageUrl(): string {
  return `${CARTOON_BUCKET_URL}/fallback/silhouette.webp`;
}

/** 폴백 썸네일 */
export function getFallbackThumbUrl(): string {
  return `${CARTOON_BUCKET_URL}/fallback/silhouette-thumb.webp`;
}
