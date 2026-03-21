import { type NextRequest, NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/services/sync/auth";
import { syncPlayers } from "@/lib/services/sync/sync-players";

export const maxDuration = 60;

/** 선수 기본정보 동기화 (주 1회: 매주 월요일 05:00 UTC) */
export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const result = await syncPlayers();

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
