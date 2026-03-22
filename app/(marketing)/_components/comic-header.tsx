"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── 네비게이션 항목 (피그마 SpeechBubbleNav) ── */
const navItems = [
  { href: "/", label: "HOME", sub: null },
  { href: "/squad", label: "PLAYERS", sub: "PROFILES" },
  { href: "/matchday", label: "MATCHDAY", sub: "LIVE!" },
  { href: "/gallery", label: "SHARE", sub: "VIRAL!" },
] as const;

/* ── 다이아몬드 장식 ── */
function Diamonds() {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      <span className="size-[17px] rotate-45 border-[var(--comic-border-width)] border-comic-black bg-comic-yellow" />
      <span className="size-[17px] rotate-45 border-[var(--comic-border-width)] border-comic-black bg-comic-yellow" />
      <span className="size-[20px] rotate-45 border-[var(--comic-border-width)] border-comic-black bg-comic-skyblue" />
    </span>
  );
}

export function ComicHeader() {
  const pathname = usePathname();

  return (
    <header className="border-comic-black border-b-[var(--comic-border-width)] bg-comic-white pb-4">
      {/* 로고 섹션 */}
      <div className="flex items-center justify-center gap-4 px-4 pt-6">
        <Diamonds />
        <div className="text-center">
          <h1
            className="font-[family-name:var(--font-bangers)] text-comic-black"
            style={{
              fontSize: "var(--comic-text-6xl)",
              lineHeight: "var(--comic-leading-tight)",
              letterSpacing: "var(--comic-tracking-ultra)",
            }}
          >
            PITCH-AC
          </h1>
          <div className="mt-1 flex justify-center">
            <span
              className="inline-block bg-comic-black px-3 py-1 font-[family-name:var(--font-permanent-marker)] text-comic-white"
              style={{
                fontSize: "var(--comic-body-base)",
                letterSpacing: "var(--comic-tracking-wide)",
              }}
            >
              MAN CITY CARTOON WORLD
            </span>
          </div>
        </div>
        <Diamonds />
      </div>

      {/* 말풍선 네비게이션 */}
      <nav className="mt-6 flex items-end justify-center gap-3 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black px-6 py-3 text-center transition-transform hover:scale-105 ${isActive ? "bg-comic-yellow" : "bg-comic-black"} `}
            >
              {/* 말풍선 꼬리 */}
              <span
                className={`absolute -bottom-2 left-1/2 size-3 -translate-x-1/2 rotate-45 border-comic-black border-r-[var(--comic-border-width)] border-b-[var(--comic-border-width)] ${isActive ? "bg-comic-yellow" : "bg-comic-black"} `}
                aria-hidden
              />
              <span
                className={`block font-[family-name:var(--font-bangers)] ${isActive ? "text-comic-black" : "text-comic-white"} `}
                style={{
                  fontSize: "var(--comic-text-lg)",
                  lineHeight: "var(--comic-leading-relaxed)",
                  letterSpacing: "var(--comic-tracking-wide)",
                }}
              >
                {item.label}
              </span>
              {item.sub && (
                <span
                  className={`block font-[family-name:var(--font-permanent-marker)] ${isActive ? "text-comic-black/70" : "text-comic-white/70"} `}
                  style={{
                    fontSize: "var(--comic-body-xs)",
                    letterSpacing: "var(--comic-tracking-tight)",
                  }}
                >
                  {item.sub}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
