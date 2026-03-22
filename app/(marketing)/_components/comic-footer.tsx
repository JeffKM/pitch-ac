type FooterColumn = {
  title: string;
  sub: string;
  accent?: boolean;
};

const footerColumns: FooterColumn[] = [
  { title: "CONTACT", sub: "PITCH-AC.COM" },
  { title: "JOIN US", sub: "COMMUNITY" },
  { title: "SOCIAL", sub: "FOLLOW US" },
  { title: "CITY!", sub: "EST. 1894", accent: true },
];

export function ComicFooter() {
  return (
    <footer className="border-comic-black border-t-[var(--comic-border-width)] bg-comic-white">
      {/* 상단 컬러 스트라이프 */}
      <div className="flex h-2">
        <div className="flex-1 bg-comic-skyblue" />
        <div className="flex-1 bg-comic-black" />
        <div className="flex-1 bg-comic-skyblue" />
        <div className="flex-1 bg-comic-black" />
      </div>

      {/* 푸터 컬럼 */}
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 p-[var(--comic-panel-padding)] md:grid-cols-4">
        {footerColumns.map((col) => (
          <div
            key={col.title}
            className={`rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black px-4 py-5 text-center ${col.accent ? "bg-comic-yellow" : "bg-comic-skyblue/20"} `}
          >
            <span
              className="block font-[family-name:var(--font-bangers)] text-comic-black"
              style={{
                fontSize: col.accent
                  ? "var(--comic-text-xl)"
                  : "var(--comic-text-base)",
                lineHeight: col.accent
                  ? "var(--comic-leading-normal)"
                  : "var(--comic-leading-loose)",
                letterSpacing: "var(--comic-tracking-normal)",
              }}
            >
              {col.title}
            </span>
            <span
              className="mt-1 block font-[family-name:var(--font-permanent-marker)] text-comic-black/60"
              style={{
                fontSize: "var(--comic-body-sm)",
              }}
            >
              {col.sub}
            </span>
          </div>
        ))}
      </div>
    </footer>
  );
}
