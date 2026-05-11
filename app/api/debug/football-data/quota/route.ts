// 디버그: football-data.org 레이트 리미터 상태 조회
import { NextResponse } from "next/server";

import { getUsage } from "@/lib/api/football-data";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(getUsage());
}
