// 뉴스 섹션 placeholder — COMING SOON

import Link from "next/link";

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

export function NewsPlaceholder() {
  return (
    <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="NEWS" subtitle="LATEST" />

      <div className="flex flex-col items-center justify-center py-8">
        <span
          className="font-[family-name:var(--font-bangers)] text-comic-black/30"
          style={{ fontSize: "var(--comic-text-2xl)" }}
        >
          COMING SOON
        </span>
        <p
          className="mt-2 font-[family-name:var(--font-permanent-marker)] text-comic-black/40"
          style={{ fontSize: "var(--comic-body-sm)" }}
        >
          5대 리그 최신 소식을 전해드립니다
        </p>
        <Link
          href="/news"
          className="mt-4 inline-block rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow px-4 py-2 font-[family-name:var(--font-bangers)] text-comic-black transition-transform hover:scale-105"
          style={{ fontSize: "var(--comic-text-sm)" }}
        >
          GO TO NEWS →
        </Link>
      </div>
    </ComicPanel>
  );
}
