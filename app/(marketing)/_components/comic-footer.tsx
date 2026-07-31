// 푸터 — BUILDUP 스타일 3컬럼 레이아웃

import { cacheLife } from "next/cache";
import Link from "next/link";

/**
 * 저작권 표기용 연도.
 * cacheComponents 환경에서는 서버 컴포넌트가 현재 시각을 직접 읽을 수 없으므로
 * "use cache" 스코프 안에서 계산한다(하루 단위로 갱신).
 */
async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const serviceLinks = [
  { href: "/ranking", label: "순위" },
  { href: "/matchday", label: "일정/결과" },
  { href: "/scouting", label: "스카우팅" },
  { href: "/news", label: "뉴스" },
];

const companyLinks = [
  { href: "#", label: "About Us" },
  { href: "#", label: "이용약관" },
  { href: "#", label: "개인정보처리방침" },
  { href: "#", label: "쿠키정책" },
  { href: "#", label: "버그리포트" },
];

export async function ComicFooter() {
  const currentYear = await getCurrentYear();

  return (
    <footer className="border-comic-black border-t-[var(--comic-border-width)] bg-comic-black">
      {/* 메인 컨텐츠 — 3컬럼 */}
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-3">
        {/* 로고 + 설명 */}
        <div>
          <span
            className="font-[family-name:var(--font-bangers)] text-comic-yellow-ink"
            style={{
              fontSize: "var(--comic-text-2xl)",
              letterSpacing: "var(--comic-tracking-ultra)",
            }}
          >
            PITCH-AC
          </span>
          <p
            className="mt-2 font-[family-name:var(--font-permanent-marker)] text-comic-white/70"
            style={{ fontSize: "var(--comic-body-sm)" }}
          >
            THE ULTIMATE 5-LEAGUE DATA HUB.
            <br />
            모든 숫자에 맥락을 더합니다.
          </p>
        </div>

        {/* 서비스 */}
        <div>
          <span
            className="font-[family-name:var(--font-bangers)] text-comic-white"
            style={{
              fontSize: "var(--comic-text-base)",
              letterSpacing: "var(--comic-tracking-wide)",
            }}
          >
            서비스
          </span>
          <ul className="mt-3 space-y-2">
            {serviceLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-[family-name:var(--font-permanent-marker)] text-comic-white/70 transition-colors hover:text-comic-yellow-ink"
                  style={{ fontSize: "var(--comic-body-sm)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 회사 */}
        <div>
          <span
            className="font-[family-name:var(--font-bangers)] text-comic-white"
            style={{
              fontSize: "var(--comic-text-base)",
              letterSpacing: "var(--comic-tracking-wide)",
            }}
          >
            회사
          </span>
          <ul className="mt-3 space-y-2">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="font-[family-name:var(--font-permanent-marker)] text-comic-white/70 transition-colors hover:text-comic-yellow-ink"
                  style={{ fontSize: "var(--comic-body-sm)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 하단 바 */}
      <div className="border-t border-comic-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 sm:flex-row">
          <span
            className="font-[family-name:var(--font-permanent-marker)] text-comic-white/70"
            style={{ fontSize: "var(--comic-body-xs)" }}
          >
            © {currentYear} PITCH-AC. All rights reserved.
          </span>
          <div className="flex gap-4">
            <Link
              href="#"
              className="font-[family-name:var(--font-permanent-marker)] text-comic-white/70 transition-colors hover:text-comic-white"
              style={{ fontSize: "var(--comic-body-xs)" }}
            >
              이용약관
            </Link>
            <Link
              href="#"
              className="font-[family-name:var(--font-permanent-marker)] text-comic-white/70 transition-colors hover:text-comic-white"
              style={{ fontSize: "var(--comic-body-xs)" }}
            >
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
