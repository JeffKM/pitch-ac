// 헬스체크 API — DB 연결 + API 키 확인

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const checks: Record<string, { ok: boolean; message: string }> = {};

  // 1. SportMonks API 키 확인
  const apiKey = process.env.SPORTMONKS_API_KEY;
  checks.sportmonks_api_key = {
    ok: Boolean(apiKey && apiKey.length > 10),
    message: apiKey ? "API 키 설정됨" : "SPORTMONKS_API_KEY 환경변수 없음",
  };

  // 2. Supabase DB 연결 확인
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("glossary")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    checks.supabase_db = {
      ok: true,
      message: `DB 연결 성공 (glossary: ${count ?? 0}행)`,
    };
  } catch (error) {
    checks.supabase_db = {
      ok: false,
      message: `DB 연결 실패: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    { ok: allOk, checks },
    { status: allOk ? 200 : 500 },
  );
}
