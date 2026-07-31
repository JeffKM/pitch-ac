"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    // Supabase 브라우저 SDK(184KB)를 클릭 시점에만 로드 — 전 라우트 초기 번들에서 제외
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button onClick={logout} size="sm" variant="outline">
      Logout
    </Button>
  );
}
