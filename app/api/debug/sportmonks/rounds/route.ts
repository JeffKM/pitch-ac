import { NextResponse } from "next/server";

import { getSeasonRounds } from "@/lib/api/sportmonks";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rounds = await getSeasonRounds();

  return NextResponse.json({
    count: rounds.length,
    rounds: rounds.map((r) => ({
      id: r.id,
      name: r.name,
      is_current: r.is_current,
      finished: r.finished,
      starting_at: r.starting_at,
    })),
  });
}
