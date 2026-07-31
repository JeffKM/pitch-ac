import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/services/sync/auth";
import { syncSeasonStats } from "@/lib/services/sync/sync-stats";

export const maxDuration = 60;

/** 선수 시즌 통계 동기화 (매일 07:00 UTC) */
export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const result = await syncSeasonStats();

    // 동기화 성공분이 있으면 use cache 캐시 무효화 (stale-while-revalidate)
    if (result.status === "success") {
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
