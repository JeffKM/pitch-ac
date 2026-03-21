import "server-only";

import { type NextRequest, NextResponse } from "next/server";

/**
 * Vercel Cron 인증 검증
 * Vercel이 CRON_SECRET을 Authorization: Bearer <CRON_SECRET> 헤더로 전송
 * 로컬 개발 환경에서는 인증 스킵
 *
 * @returns null — 인증 통과, NextResponse — 인증 실패 응답
 */
export function verifyCronAuth(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET 환경변수가 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  return null;
}
