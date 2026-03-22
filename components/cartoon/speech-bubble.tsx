"use client";

// 말풍선 UI 컴포넌트

import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  text: string;
  /** 말풍선 방향: 왼쪽(캐릭터가 왼쪽), 오른쪽(캐릭터가 오른쪽) */
  direction?: "left" | "right";
  className?: string;
}

export function SpeechBubble({
  text,
  direction = "left",
  className,
}: SpeechBubbleProps) {
  return (
    <div
      className={cn(
        "relative max-w-[200px] rounded-2xl border-2 border-foreground/20 bg-background px-3 py-2 text-sm font-medium shadow-md",
        className,
      )}
    >
      {text}
      {/* 꼬리 삼각형 */}
      <div
        className={cn(
          "absolute -bottom-2 size-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-foreground/20",
          direction === "left" ? "left-4" : "right-4",
        )}
      />
      <div
        className={cn(
          "absolute -bottom-[6px] size-0 border-x-[5px] border-t-[7px] border-x-transparent border-t-background",
          direction === "left" ? "left-[17px]" : "right-[17px]",
        )}
      />
    </div>
  );
}
