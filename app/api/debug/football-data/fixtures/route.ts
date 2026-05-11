// 디버그: football-data.org 경기 조회
import { NextResponse } from "next/server";

import { getCompetitionMatches } from "@/lib/api/football-data";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const matches = await getCompetitionMatches("PL");
    const statusCounts = matches.reduce(
      (acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return NextResponse.json({
      total: matches.length,
      statusCounts,
      sample: matches.slice(0, 3),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
