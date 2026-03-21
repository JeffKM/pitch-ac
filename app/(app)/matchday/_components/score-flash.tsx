"use client";

// 스코어 변경 시 2초간 flash 애니메이션을 적용하는 래퍼 컴포넌트

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface ScoreFlashProps {
  score: number | null;
  className?: string;
  children: React.ReactNode;
}

export function ScoreFlash({ score, className, children }: ScoreFlashProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevScoreRef = useRef(score);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      // 첫 렌더링 시 기준값만 저장
      isInitializedRef.current = true;
      prevScoreRef.current = score;
      return;
    }

    const prev = prevScoreRef.current;
    if (score !== null && prev !== null && score > prev) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 2000);
      prevScoreRef.current = score;
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = score;
  }, [score]);

  return (
    <span
      className={cn(
        "transition-colors duration-300",
        isFlashing && "text-green-500",
        className,
      )}
    >
      {children}
    </span>
  );
}
