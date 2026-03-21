"use client";

// 앱 런타임 에러 바운더리 — 예상치 못한 에러 발생 시 표시

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-4xl font-bold text-muted-foreground">오류 발생</p>
      <p className="text-lg font-semibold">예상치 못한 오류가 발생했습니다</p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          오류 코드: {error.digest}
        </p>
      )}
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}
