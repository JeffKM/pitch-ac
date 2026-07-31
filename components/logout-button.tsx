"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    try {
      // Supabase 브라우저 SDK(184KB)를 클릭 시점에만 로드 — 전 라우트 초기 번들에서 제외
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      // 배포 직후 청크 해시 변경 등으로 동적 import가 실패할 수 있음 — 조용한 실패 방지
      console.error("[logout] 로그아웃 실패:", error);
      toast.error("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Button onClick={logout} size="sm" variant="outline">
      Logout
    </Button>
  );
}
