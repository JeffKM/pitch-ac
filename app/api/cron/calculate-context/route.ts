import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/services/sync/auth";
import { calculateContext } from "@/lib/services/sync/calculate-context";

export const maxDuration = 60;

/** 맥락 데이터 계산 — sync-stats 완료 후 실행 (매일 07:30 UTC) */
export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const result = await calculateContext();

    // 동기화 성공분이 있으면 use cache 캐시 무효화 (stale-while-revalidate)
    if (result.status === "success") {
      revalidateTag("fixtures", "max");
      revalidateTag("players", "max");
    }

    return NextResponse.json({
      ok: result.status === "success",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
