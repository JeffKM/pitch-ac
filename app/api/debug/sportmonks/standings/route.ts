// 디버그 API — PL 리그 순위표 반환 (개발 환경 전용)

import { NextResponse } from "next/server";

import { getStandings } from "@/lib/api/sportmonks";
import {
  mapSmStandingToTeamStanding,
  mapSmTeamToTeam,
} from "@/lib/api/sportmonks/mappers";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  try {
    const rawStandings = await getStandings();

    const standings = rawStandings.map((raw) => ({
      standing: mapSmStandingToTeamStanding(raw),
      team: raw.participant
        ? mapSmTeamToTeam(raw.participant, "2025/2026")
        : null,
    }));

    // position 순으로 정렬
    standings.sort((a, b) => a.standing.position - b.standing.position);

    return NextResponse.json({ count: standings.length, standings });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
