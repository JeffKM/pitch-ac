"use client";

// 카툰 아바타 컴포넌트 — 선수 카툰 이미지 + 감정 표시

import Image from "next/image";

import {
  FALLBACK_MOOD,
  getCartoonImageUrl,
  getCartoonThumbUrl,
  getFallbackImageUrl,
  getFallbackThumbUrl,
} from "@/lib/services/cartoon/asset-resolver";
import { cn } from "@/lib/utils";
import type { CartoonMood } from "@/types/cartoon";

import { MoodTransition } from "./mood-transition";

interface CartoonAvatarProps {
  playerId: number;
  mood?: CartoonMood;
  /** 에셋 등록 여부 (false면 폴백 실루엣) */
  hasAsset?: boolean;
  /** 전신(full) 또는 썸네일(thumb) */
  variant?: "full" | "thumb";
  /** CSS 클래스 */
  className?: string;
  /** 선수 이름 (alt 텍스트) */
  playerName?: string;
}

export function CartoonAvatar({
  playerId,
  mood = "neutral",
  hasAsset = false,
  variant = "thumb",
  className,
  playerName = "선수",
}: CartoonAvatarProps) {
  const effectiveMood = hasAsset ? mood : FALLBACK_MOOD;

  const imageUrl = hasAsset
    ? variant === "full"
      ? getCartoonImageUrl(playerId, effectiveMood)
      : getCartoonThumbUrl(playerId, effectiveMood)
    : variant === "full"
      ? getFallbackImageUrl()
      : getFallbackThumbUrl();

  const size = variant === "full" ? { w: 400, h: 500 } : { w: 100, h: 125 };

  return (
    <MoodTransition mood={effectiveMood}>
      <div
        className={cn(
          "relative inline-flex items-end justify-center",
          className,
        )}
      >
        <Image
          src={imageUrl}
          alt={`${playerName} 카툰`}
          width={size.w}
          height={size.h}
          className="object-contain"
          sizes={
            variant === "full" ? "(max-width: 768px) 200px, 400px" : "100px"
          }
        />
        {/* 감정 이모지 뱃지 */}
        {hasAsset && (
          <span className="absolute -top-1 -right-1 rounded-full bg-background p-0.5 text-xs shadow-sm">
            {moodEmoji(effectiveMood)}
          </span>
        )}
      </div>
    </MoodTransition>
  );
}

/** 감정 → 이모지 매핑 */
function moodEmoji(mood: CartoonMood): string {
  const map: Record<CartoonMood, string> = {
    neutral: "😐",
    happy: "😊",
    celebrating: "🎉",
    angry: "😤",
    sad: "😢",
    shocked: "😱",
    tired: "😴",
    injured: "🤕",
    focused: "🔥",
    laughing: "😂",
    crying: "😭",
    thinking: "🤔",
  };
  return map[mood];
}
