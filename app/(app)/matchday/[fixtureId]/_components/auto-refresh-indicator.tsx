"use client";

// 자동 갱신 인디케이터 — LIVE 경기 시 실시간 카운트다운 표시

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import type { FixtureStatus } from "@/types";

interface AutoRefreshIndicatorProps {
  status: FixtureStatus;
}

export function AutoRefreshIndicator({ status }: AutoRefreshIndicatorProps) {
  // LIVE 경기에서만 60초 카운트다운, 그 외는 표시하지 않음
  const intervalSeconds = status === "LIVE" ? 60 : 0;
  const [remaining, setRemaining] = useState(intervalSeconds);

  useEffect(() => {
    if (intervalSeconds === 0) return;
    setRemaining(intervalSeconds);

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) return intervalSeconds; // 카운트다운 리셋
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intervalSeconds]);

  if (intervalSeconds === 0) return null;

  return (
    <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
      <RefreshCw className="size-3" />
      <span>{remaining}초 후 갱신</span>
    </div>
  );
}
