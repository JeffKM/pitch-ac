import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/services/sync/auth";
import { syncAllLeagueFixtures } from "@/lib/services/sync/sync-fixtures";

export const maxDuration = 120;

/** 5대 리그 시즌 전체 경기 동기화 (매일 04:00 UTC) */
export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const results = await syncAllLeagueFixtures();

    // 동기화 성공분이 있으면 use cache 캐시 무효화 (stale-while-revalidate)
    if (results.some((r) => r.status === "success")) {
      revalidateTag("fixtures", "max");
    }

    return NextResponse.json({
      ok: results.every((r) => r.status === "success"),
      results,
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
