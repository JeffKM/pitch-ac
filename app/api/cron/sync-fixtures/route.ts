import { type NextRequest, NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/services/sync/auth";
import { syncFixtures } from "@/lib/services/sync/sync-fixtures";

export const maxDuration = 60;

/** 시즌 전체 경기 동기화 (매일 06:00 UTC) */
export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const result = await syncFixtures();

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
