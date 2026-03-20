import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Fluid compute 환경: 전역 변수 사용 금지, 매 요청마다 새 인스턴스 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // createServerClient와 getClaims() 사이에 다른 코드를 넣지 말 것.
  // 사용자 로그아웃 문제를 유발할 수 있음.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // 보호가 필요한 경로 목록 (향후 추가: /settings, /favorites 등)
  const protectedPaths: string[] = [];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: supabaseResponse 객체를 반드시 그대로 반환해야 함.
  // 새 Response 객체 생성 시 쿠키를 반드시 복사해야 세션이 유지됨.
  return supabaseResponse;
}
