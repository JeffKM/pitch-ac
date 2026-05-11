// GET /api/debug/api-football/fixtures — PL 시즌 경기 목록 확인

import { NextResponse } from "next/server";

import {
  getAllSeasonFixtures,
  mapAfFixtureToFixture,
} from "@/lib/api/api-football";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "디버그 전용" }, { status: 403 });
  }

  const rawFixtures = await getAllSeasonFixtures();
  const fixtures = rawFixtures.map(mapAfFixtureToFixture);

  return NextResponse.json({
    total: fixtures.length,
    fixtures: fixtures.slice(0, 20),
    summary: {
      ns: fixtures.filter((f) => f.status === "NS").length,
      ft: fixtures.filter((f) => f.status === "FT").length,
      live: fixtures.filter((f) => f.status === "LIVE").length,
      postp: fixtures.filter((f) => f.status === "POSTP").length,
    },
  });
}
