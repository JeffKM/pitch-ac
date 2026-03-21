// 디버그 API — 현재 라운드 경기 목록 반환 (개발 환경 전용)

import { NextResponse } from "next/server";

import { getCurrentRound, getFixturesByRound } from "@/lib/api/sportmonks";
import { mapSmFixtureToFixture } from "@/lib/api/sportmonks/mappers";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  try {
    const round = await getCurrentRound();
    if (!round) {
      return NextResponse.json(
        { error: "현재 라운드를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const rawFixtures = await getFixturesByRound(round.id);
    const fixtures = rawFixtures.map(mapSmFixtureToFixture);

    return NextResponse.json({
      round: {
        id: round.id,
        name: round.name,
        is_current: round.is_current,
        starting_at: round.starting_at,
        ending_at: round.ending_at,
      },
      fixtures,
      raw_count: rawFixtures.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
