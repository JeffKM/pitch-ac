// 베스트 XI 섹션 placeholder — COMING SOON

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

export function BestElevenPlaceholder() {
  return (
    <ComicPanel bg="skyblue" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="BEST XI" subtitle="TEAM OF THE WEEK" />

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
          라운드별 베스트 일레븐을 선정합니다
        </p>
      </div>
    </ComicPanel>
  );
}
