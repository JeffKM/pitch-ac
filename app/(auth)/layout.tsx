import Link from "next/link";

/**
 * 인증 라우트 그룹 공통 레이아웃.
 * - 본문 랜드마크(<main id="main-content">)를 제공해 스킵 링크 타깃을 보장한다.
 * - 홈으로 돌아갈 수 있는 로고 링크를 상단에 노출한다.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full flex-col bg-background">
      <header className="w-full border-comic-black border-b-[var(--comic-border-width)] bg-comic-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-[var(--comic-panel-padding)]">
          <Link
            href="/"
            aria-label="pitch-ac 홈으로 이동"
            className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-2xl)] tracking-[var(--comic-tracking-wide)] text-comic-black hover:opacity-80"
          >
            pitch-ac
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        className="flex w-full flex-1 items-center justify-center p-6 md:p-10"
      >
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
