// 디버그: 5대 리그 전체 동기화 트리거
import { NextResponse } from "next/server";

import {
  syncAllLeagueFixtures,
  syncAllLeagueStandings,
} from "@/lib/services/sync";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const fixtureResults = await syncAllLeagueFixtures();
    const standingResults = await syncAllLeagueStandings();

    return NextResponse.json({
      fixtures: fixtureResults,
      standings: standingResults,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
