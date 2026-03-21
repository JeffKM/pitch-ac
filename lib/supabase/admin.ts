import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin 클라이언트 — service_role key 사용
 * Cron job, 배치 처리 등 cookie 없는 서버 환경 전용
 * RLS를 우회하므로 반드시 서버 사이드에서만 사용
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
