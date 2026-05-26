// 에펨코리아 HTML 크롤링 클라이언트

import { FMKOREA_BASE_URL } from "@/lib/constants/fmkorea";

import { waitForRateLimit } from "./rate-limiter";

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Referer: "https://www.fmkorea.com/",
};

export class FmkoreaFetchError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "FmkoreaFetchError";
  }
}

export async function fmkoreaFetch(path: string): Promise<string> {
  await waitForRateLimit();

  const res = await fetch(`${FMKOREA_BASE_URL}${path}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(15000),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new FmkoreaFetchError(
      res.status,
      `FMKorea 요청 실패: ${res.status} ${res.statusText}`,
    );
  }

  return res.text();
}
