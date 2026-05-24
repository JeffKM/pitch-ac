// ScoutLab Ranking API — 메트릭별 랭킹 데이터 조회
import { NextResponse } from "next/server";

import { getRankingData } from "@/lib/repositories/scoutlab-repository";
import type { ScoutlabCategory } from "@/types";

const VALID_CATEGORIES: ScoutlabCategory[] = [
  "final_product",
  "shooting",
  "creation",
  "passing",
  "ball_carrying",
  "defending",
  "set_pieces",
  "aerial",
  "possession",
  "vaep_overview",
  "misc",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as ScoutlabCategory | null;
  const metric = searchParams.get("metric");
  const season = searchParams.get("season") ?? "25/26";
  const league = searchParams.get("league") ?? undefined;

  if (!category || !metric || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "category와 metric 파라미터 필수" },
      { status: 400 },
    );
  }

  try {
    const data = await getRankingData(
      metric,
      category,
      {
        season,
        league: league as Parameters<typeof getRankingData>[2]["league"],
      },
      50,
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "서버 오류" },
      { status: 500 },
    );
  }
}
