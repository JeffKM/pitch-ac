"use client";

// 감정 전환 애니메이션 래퍼 — CSS transition으로 부드러운 전환

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { CartoonMood } from "@/types/cartoon";

interface MoodTransitionProps {
  mood: CartoonMood;
  children: ReactNode;
  /** 전환 시간 (ms) */
  duration?: number;
  className?: string;
}

export function MoodTransition({
  mood,
  children,
  duration = 300,
  className,
}: MoodTransitionProps) {
  const prevMood = useRef<CartoonMood>(mood);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (prevMood.current !== mood) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        prevMood.current = mood;
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [mood, duration]);

  return (
    <div
      className={cn(
        "transition-all",
        isTransitioning && "scale-110 opacity-80",
        className,
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
