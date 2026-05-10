// 스크래퍼 전용 Supabase admin client
// Next.js "server-only" 없이 dotenv 로드

import path from "node:path";

import dotenv from "dotenv";

// .env.local → .env 순서로 로드 (Next.js 관례)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";

export function createScraperClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.\n" +
        ".env.local 파일을 확인하세요.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
