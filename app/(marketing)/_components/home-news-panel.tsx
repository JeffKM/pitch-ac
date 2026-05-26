// 홈 화면 뉴스 패널 — 최신 뉴스 3건 표시

import { ExternalLink, Eye, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

import type { SourceType, TransferNewsItem } from "@/types";

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

interface HomeNewsPanelProps {
  items: TransferNewsItem[];
}

export function HomeNewsPanel({ items }: HomeNewsPanelProps) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="NEWS" subtitle="LATEST TRANSFERS" />

      <div className="space-y-3">
        {items.map((item) => (
          <CompactNewsCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-3 flex justify-center">
        <Link
          href="/news"
          className="inline-block rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow px-3 py-1.5 font-[family-name:var(--font-bangers)] text-comic-black transition-transform hover:scale-105"
          style={{ fontSize: "var(--comic-text-sm)" }}
        >
          MORE NEWS →
        </Link>
      </div>
    </ComicPanel>
  );
}

// 홈용 컴팩트 뉴스 카드
function CompactNewsCard({ item }: { item: TransferNewsItem }) {
  const primaryUrl =
    item.sourceType !== "summary" ? item.sourceUrls[0] : undefined;

  return (
    <div className="rounded-lg border border-comic-black/10 bg-comic-cream/30 p-3 transition-colors hover:bg-comic-cream/60">
      {/* 헤더: 뱃지 + 시간 */}
      <div className="flex items-center justify-between gap-2">
        <SourceBadge type={item.sourceType} />
        <time
          dateTime={item.publishedAt}
          className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50"
        >
          {formatRelativeTime(item.publishedAt)}
        </time>
      </div>

      {/* 제목 */}
      {primaryUrl ? (
        <a
          href={primaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-comic-blue mt-1.5 block font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-base)] leading-snug text-comic-black"
        >
          {item.title}
        </a>
      ) : (
        <p className="mt-1.5 font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-base)] leading-snug text-comic-black">
          {item.title}
        </p>
      )}

      {/* 메타 + 소스 링크 */}
      <div className="mt-1.5 flex items-center gap-3 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
        <span className="inline-flex items-center gap-1">
          <Eye className="size-3" />
          {formatCount(item.viewCount)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Heart className="size-3" />
          {item.likeCount}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="size-3" />
          {item.commentCount}
        </span>
        {/* 첫 번째 소스 링크만 표시 */}
        {item.sourceUrls[0] && (
          <a
            href={item.sourceUrls[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-comic-blue ml-auto inline-flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="size-3" />
            {extractDomainLabel(item.sourceUrls[0])}
          </a>
        )}
      </div>
    </div>
  );
}

// 소스 타입 뱃지 (인라인 — 홈 전용 경량 버전)
const BADGE_STYLES: Record<SourceType, string> = {
  tweet: "bg-sky-100 text-sky-700",
  article: "bg-emerald-100 text-emerald-700",
  video: "bg-red-100 text-red-700",
  summary: "bg-amber-100 text-amber-700",
};

const BADGE_LABELS: Record<SourceType, string> = {
  tweet: "Tweet",
  article: "Article",
  video: "Video",
  summary: "Summary",
};

function SourceBadge({ type }: { type: SourceType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] ${BADGE_STYLES[type]}`}
    >
      {BADGE_LABELS[type]}
    </span>
  );
}

// 빈 상태 — 뉴스가 없을 때
function EmptyState() {
  return (
    <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="NEWS" subtitle="LATEST" />
      <div className="flex flex-col items-center justify-center py-4">
        <span
          className="font-[family-name:var(--font-bangers)] text-comic-black/30"
          style={{ fontSize: "var(--comic-text-xl)" }}
        >
          NO NEWS YET
        </span>
        <Link
          href="/news"
          className="mt-3 inline-block rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow px-3 py-1.5 font-[family-name:var(--font-bangers)] text-comic-black transition-transform hover:scale-105"
          style={{ fontSize: "var(--comic-text-sm)" }}
        >
          GO TO NEWS →
        </Link>
      </div>
    </ComicPanel>
  );
}

// 유틸리티 함수들
function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}천`;
  return String(n);
}

function extractDomainLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }
}
