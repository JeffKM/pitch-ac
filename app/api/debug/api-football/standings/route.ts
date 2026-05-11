// GET /api/debug/api-football/standings — PL 순위표 확인

import { NextResponse } from "next/server";

import {
  getStandings,
  mapAfStandingToTeamStanding,
} from "@/lib/api/api-football";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "디버그 전용" }, { status: 403 });
  }

  const standingsRes = await getStandings();
  if (!standingsRes?.league.standings?.[0]) {
    return NextResponse.json({ error: "순위표 없음" }, { status: 404 });
  }

  const standings = standingsRes.league.standings[0].map(
    mapAfStandingToTeamStanding,
  );

  return NextResponse.json({ total: standings.length, standings });
}
