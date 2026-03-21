import { NextResponse } from "next/server";

import { sportMonksFetch } from "@/lib/api/sportmonks/client";
import { CURRENT_SEASON_ID } from "@/lib/api/sportmonks/constants";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const raw = await sportMonksFetch<unknown>(
    `/football/statistics/seasons/players/${CURRENT_SEASON_ID}`,
    {
      includes: ["details"],
      // filters: { playerLeagueIds: PL_LEAGUE_ID }, // 필터 미지원 가능성 테스트
      page: 1,
      perPage: 2,
      revalidate: false,
    },
  );

  return NextResponse.json({
    topLevelKeys: Object.keys(raw as object),
    raw,
  });
}
