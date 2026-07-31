import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * 공개 읽기 전용 Supabase 클라이언트 — 쿠키를 읽지 않음
 *
 * `use cache` 스코프 안에서는 요청 스코프 API(cookies 등)를 호출할 수 없으므로,
 * RLS상 읽기 공개인 테이블(teams, standings, fixtures, players, scoutlab_*, transfer_news,
 * injuries 등) 조회 전용으로 이 클라이언트를 사용한다.
 * 세션이 필요한 경로는 기존 `@/lib/supabase/server`의 createClient()를 유지할 것.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
