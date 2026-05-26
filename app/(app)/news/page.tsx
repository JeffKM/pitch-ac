// 뉴스 페이지 — 이적뉴스 피드

import type { Metadata } from "next";

import { NewsFeed } from "./_components/news-feed";

export const metadata: Metadata = {
  title: "Transfer News",
  description: "최신 이적뉴스와 루머를 소셜 피드 형태로 확인하세요",
};

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-3xl)] leading-[var(--comic-leading-snug)] tracking-[var(--comic-tracking-wide)] text-comic-black">
          Transfer News
        </h1>
        <p className="mt-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] tracking-[var(--comic-tracking-wide)] text-comic-black/60">
          최신 이적뉴스와 루머
        </p>
      </div>

      <NewsFeed />
    </div>
  );
}
