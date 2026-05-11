// GET /api/debug/api-football/live — 라이브 경기 확인

import { NextResponse } from "next/server";

import { getLiveFixtures, mapAfFixtureToFixture } from "@/lib/api/api-football";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "디버그 전용" }, { status: 403 });
  }

  const liveFixtures = await getLiveFixtures();
  const fixtures = liveFixtures.map(mapAfFixtureToFixture);

  return NextResponse.json({ total: fixtures.length, fixtures });
}
