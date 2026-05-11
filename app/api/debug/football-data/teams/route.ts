// 디버그: football-data.org 팀 목록 조회
import { NextResponse } from "next/server";

import { getCompetitionTeams } from "@/lib/api/football-data";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const res = await getCompetitionTeams("PL");

    return NextResponse.json({
      competition: res.competition.name,
      count: res.count,
      teams: res.teams.map((t) => ({
        id: t.id,
        name: t.name,
        tla: t.tla,
        crest: t.crest,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
