// 디버그: football-data.org 순위표 조회
import { type NextRequest, NextResponse } from "next/server";

import { getCompetitionStandings } from "@/lib/api/football-data";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const code = request.nextUrl.searchParams.get("code") ?? "PL";

  try {
    const res = await getCompetitionStandings(code);
    const total = res.standings.find((s) => s.type === "TOTAL");

    return NextResponse.json({
      competition: res.competition.name,
      season: res.season,
      standings: total?.table ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
