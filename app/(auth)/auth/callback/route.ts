import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/matchday";

  // 내부 경로만 허용 (//evil.com 같은 open redirect 방지)
  const safePath =
    next.startsWith("/") && !next.startsWith("//") ? next : "/matchday";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(safePath, request.url));
    }

    const errorUrl = new URL("/auth/error", request.url);
    errorUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(errorUrl);
  }

  const errorUrl = new URL("/auth/error", request.url);
  errorUrl.searchParams.set("error", "No authorization code provided");
  return NextResponse.redirect(errorUrl);
}
