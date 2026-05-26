// 소스 유형 판별 (도메인 매칭)

import {
  ARTICLE_DOMAINS,
  TWEET_DOMAINS,
  VIDEO_DOMAINS,
} from "@/lib/constants/fmkorea";
import type { SourceType } from "@/types";

// 우선순위: tweet > article > video > summary
export function classifySourceType(urls: string[]): SourceType {
  for (const url of urls) {
    const domain = extractDomain(url);
    if (!domain) continue;

    if (TWEET_DOMAINS.some((d) => domain.endsWith(d))) return "tweet";
  }

  for (const url of urls) {
    const domain = extractDomain(url);
    if (!domain) continue;

    if (ARTICLE_DOMAINS.some((d) => domain.endsWith(d))) return "article";
  }

  for (const url of urls) {
    const domain = extractDomain(url);
    if (!domain) continue;

    if (VIDEO_DOMAINS.some((d) => domain.endsWith(d))) return "video";
  }

  return "summary";
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
