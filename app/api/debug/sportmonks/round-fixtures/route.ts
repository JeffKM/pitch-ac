import { NextRequest, NextResponse } from "next/server";

import { getFixturesByRound } from "@/lib/api/sportmonks";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const roundId = Number(
    request.nextUrl.searchParams.get("roundId") ?? "372195",
  );

  const fixtures = await getFixturesByRound(roundId);

  return NextResponse.json({
    roundId,
    count: fixtures.length,
    sample: fixtures.slice(0, 2).map((f) => ({
      id: f.id,
      name: f.name,
      season_id: f.season_id,
      round_id: f.round_id,
      gameweek: f.round?.name,
      starting_at: f.starting_at,
    })),
  });
}
