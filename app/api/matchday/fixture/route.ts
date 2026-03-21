// 경기 상세 데이터 폴링 API 엔드포인트
// GET /api/matchday/fixture?id=N

import { type NextRequest, NextResponse } from "next/server";

import { getFixtureById } from "@/lib/repositories";
import { assembleFixtureDetail } from "@/lib/services/fixture-detail-service";
import { getLiveFixtureById } from "@/lib/services/live/live-fixture-service";
import { writebackFinishedFixture } from "@/lib/services/live/live-writeback";

export async function GET(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get("id");
  const id = Number(idParam);

  if (!id || isNaN(id) || id <= 0) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_ID", message: "유효하지 않은 경기 ID" },
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  try {
    const dbFixture = await getFixtureById(id);

    if (!dbFixture) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "경기를 찾을 수 없습니다" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    // 킥오프 시각이 지났고 아직 FT가 아닌 경우 → SportMonks 실시간 데이터로 교체
    let fixture = dbFixture;
    const now = new Date();
    if (dbFixture.status !== "FT" && new Date(dbFixture.date) <= now) {
      const liveFixture = await getLiveFixtureById(id);
      if (liveFixture) {
        // FT 전환 감지 → 비동기 DB writeback (응답 지연 없이)
        if (liveFixture.status === "FT") {
          writebackFinishedFixture(liveFixture).catch(() => {});
        }
        fixture = liveFixture;
      }
    }

    // 공통 로직: 팀/순위/H2H/부상자 병렬 조회
    const data = await assembleFixtureDetail(fixture);

    if (!data) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "TEAM_NOT_FOUND",
            message: "팀 정보를 찾을 수 없습니다",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    const isLive = data.fixture.status === "LIVE";
    const cacheControl = isLive
      ? "public, s-maxage=10, stale-while-revalidate=30"
      : "public, s-maxage=60, stale-while-revalidate=120";

    return NextResponse.json(
      { data, error: null, timestamp: new Date().toISOString() },
      { headers: { "Cache-Control": cacheControl } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL",
          message: error instanceof Error ? error.message : "서버 오류",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
