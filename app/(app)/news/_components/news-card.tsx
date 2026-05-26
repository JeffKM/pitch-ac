// 뉴스 카드 UI

import { ExternalLink, Eye, Heart, MessageCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { TransferNewsItem } from "@/types";

import { SourceTypeBadge } from "./source-type-badge";

interface NewsCardProps {
  item: TransferNewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const primaryUrl =
    item.sourceType !== "summary" ? item.sourceUrls[0] : undefined;

  return (
    <Card className="transition-colors hover:bg-comic-cream/50">
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* 헤더: 뱃지 + 시간 */}
          <div className="flex items-center justify-between gap-2">
            <SourceTypeBadge type={item.sourceType} />
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
              className="hover:text-comic-blue block font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-base)] leading-snug text-comic-black"
            >
              {item.title}
            </a>
          ) : (
            <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-base)] leading-snug text-comic-black">
              {item.title}
            </p>
          )}

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
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
          </div>

          {/* 소스 링크 목록 */}
          {item.sourceUrls.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.sourceUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:border-comic-blue hover:text-comic-blue inline-flex items-center gap-1 rounded border border-comic-black/10 px-2 py-0.5 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/60 transition-colors"
                >
                  <ExternalLink className="size-3" />
                  {extractDomainLabel(url)}
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 상대 시간 포맷
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

// 조회수 축약 포맷
function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}천`;
  return String(n);
}

// URL에서 도메인 라벨 추출
function extractDomainLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }
}
