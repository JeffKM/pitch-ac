"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/**
 * 테마 토글 버튼.
 *
 * mounted 플래그로 첫 렌더에서 null을 반환하면, 마운트 이펙트가 실행되는 순간
 * DOM 구조가 바뀌면서 아직 하이드레이션되지 않은 이웃 Suspense 경계와 어긋나
 * React #418(하이드레이션 실패)이 발생한다.
 * 따라서 서버/클라이언트가 항상 동일한 마크업을 렌더하고, 아이콘 노출 여부는
 * CSS(dark 변형)로만 전환한다.
 */
const ThemeSwitcher = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="라이트/다크 모드 전환"
      title="라이트/다크 모드 전환"
    >
      <Sun size={16} className="text-muted-foreground dark:hidden" />
      <Moon size={16} className="hidden text-muted-foreground dark:block" />
    </Button>
  );
};

export { ThemeSwitcher };
