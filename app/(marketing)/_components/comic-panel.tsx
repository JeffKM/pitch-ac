import type { ReactNode } from "react";

type ComicPanelProps = {
  children: ReactNode;
  className?: string;
  bg?: "skyblue" | "green" | "yellow" | "white" | "cream";
};

/* ── 코믹 패널 박스 (피그마 ComicPanelBox) ── */
export function ComicPanel({
  children,
  className = "",
  bg = "white",
}: ComicPanelProps) {
  const bgMap = {
    skyblue: "bg-comic-skyblue",
    green: "bg-comic-green",
    yellow: "bg-comic-yellow",
    white: "bg-comic-white",
    cream: "bg-comic-cream",
  } as const;

  return (
    <div
      className={`overflow-hidden rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black ${bgMap[bg]} ${className} `}
    >
      {children}
    </div>
  );
}

/* ── 코믹 패널 제목 (피그마 공통 헤딩 패턴) ── */
export function ComicPanelTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 border-comic-black/30 border-b-[var(--comic-border-thin)] pb-3">
      <h3
        className="font-[family-name:var(--font-bangers)] text-comic-black"
        style={{
          fontSize: "var(--comic-text-lg)",
          lineHeight: "var(--comic-leading-relaxed)",
          letterSpacing: "var(--comic-tracking-wide)",
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          className="mt-0.5 font-[family-name:var(--font-permanent-marker)] text-comic-black/60"
          style={{
            fontSize: "var(--comic-body-base)",
            letterSpacing: "var(--comic-tracking-wide)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── 코믹 패널 대제목 (피그마 30px Bangers) ── */
export function ComicPanelHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 border-comic-black/30 border-b-[var(--comic-border-thin)] pb-3">
      <h2
        className="font-[family-name:var(--font-bangers)] text-comic-black"
        style={{
          fontSize: "var(--comic-text-2xl)",
          lineHeight: "var(--comic-leading-snug)",
          letterSpacing: "0.75px",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-1 font-[family-name:var(--font-permanent-marker)] text-comic-black/60"
          style={{
            fontSize: "var(--comic-body-base)",
            letterSpacing: "var(--comic-tracking-wide)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
