// 에펨코리아 HTML 파싱 (cheerio 기반)
// 축구 소식통 게시판: <table class="bd_lst"> 기반 테이블 레이아웃

import * as cheerio from "cheerio";

import type { FmkRawPost } from "./types";

// 리스트 페이지 파싱 → 게시글 목록
export function parsePostList(html: string): FmkRawPost[] {
  const $ = cheerio.load(html);
  const posts: FmkRawPost[] = [];

  // 게시판 테이블의 각 행 순회 (공지 제외)
  $("table.bd_lst tbody tr").each((_, el) => {
    const $row = $(el);

    // 공지글 스킵
    if ($row.hasClass("notice")) return;

    // 제목 셀에서 게시글 링크 추출
    const $titleLink = $row.find("td.title > a").first();
    const href = $titleLink.attr("href");
    if (!href) return;

    // document_srl 추출 (href="/9873510066" 형식)
    const idMatch = href.match(/\/(\d+)$/);
    if (!idMatch) return;
    const id = parseInt(idMatch[1], 10);
    if (isNaN(id)) return;

    // 제목 텍스트 (댓글 수, 아이콘 등 제외)
    const title = $titleLink.text().trim();
    if (!title) return;

    // 작성자
    const author =
      $row.find("td.author span a").first().text().trim() || "익명";

    // 조회수 ("6만", "1730" 등 → 숫자)
    const viewText = $row
      .find("td.m_no")
      .not(".m_no_voted")
      .first()
      .text()
      .trim();
    const viewCount = parseKoreanNumber(viewText);

    // 추천수
    const voteText = $row.find("td.m_no_voted").text().trim();
    const likeCount = parseKoreanNumber(voteText);

    // 댓글수
    const commentText = $row.find("a.replyNum").text().trim();
    const commentCount = parseInt(commentText.replace(/,/g, ""), 10) || 0;

    // 게시 시간
    const timeText = $row.find("td.time").text().trim();
    const publishedAt = parseTimeText(timeText);

    posts.push({
      id,
      title,
      author,
      viewCount,
      likeCount,
      commentCount,
      publishedAt,
    });
  });

  return posts;
}

// 본문 페이지에서 외부 링크 추출
export function parseArticleUrls(html: string): string[] {
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  // 본문 영역의 링크만 추출
  $(".xe_content a, .rd_body a, article a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    try {
      const url = new URL(href);
      // 에펨코리아 내부 링크 제외
      if (url.hostname.includes("fmkorea.com")) return;
      // http/https만 허용
      if (url.protocol === "http:" || url.protocol === "https:") {
        urls.add(url.href);
      }
    } catch {
      // 잘못된 URL은 무시
    }
  });

  return [...urls];
}

// 한국어 숫자 표기 파싱 ("6만" → 60000, "1730" → 1730)
function parseKoreanNumber(text: string): number {
  const manMatch = text.match(/([\d.]+)\s*만/);
  if (manMatch) {
    return Math.round(parseFloat(manMatch[1]) * 10000);
  }

  const cheonMatch = text.match(/([\d.]+)\s*천/);
  if (cheonMatch) {
    return Math.round(parseFloat(cheonMatch[1]) * 1000);
  }

  return parseInt(text.replace(/,/g, ""), 10) || 0;
}

// 시간 텍스트 파싱 → ISO 8601
function parseTimeText(text: string): string {
  const now = new Date();

  // "N분 전", "N시간 전" 패턴
  const minutesAgo = text.match(/(\d+)\s*분\s*전/);
  if (minutesAgo) {
    now.setMinutes(now.getMinutes() - parseInt(minutesAgo[1], 10));
    return now.toISOString();
  }

  const hoursAgo = text.match(/(\d+)\s*시간\s*전/);
  if (hoursAgo) {
    now.setHours(now.getHours() - parseInt(hoursAgo[1], 10));
    return now.toISOString();
  }

  // "14:01" 패턴 (오늘 시간)
  const timeOnly = text.match(/^(\d{2}):(\d{2})$/);
  if (timeOnly) {
    now.setHours(parseInt(timeOnly[1], 10), parseInt(timeOnly[2], 10), 0, 0);
    return now.toISOString();
  }

  // "05.26" 패턴 (올해 날짜)
  const shortDate = text.match(/^(\d{2})\.(\d{2})$/);
  if (shortDate) {
    return new Date(
      now.getFullYear(),
      parseInt(shortDate[1], 10) - 1,
      parseInt(shortDate[2], 10),
    ).toISOString();
  }

  // "26.05.26" 또는 "17.10.27" 패턴 (YY.MM.DD)
  const yyDate = text.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (yyDate) {
    const year = 2000 + parseInt(yyDate[1], 10);
    return new Date(
      year,
      parseInt(yyDate[2], 10) - 1,
      parseInt(yyDate[3], 10),
    ).toISOString();
  }

  // "2026.05.26" 패턴
  const fullDate = text.match(/(\d{4})\.(\d{2})\.(\d{2})/);
  if (fullDate) {
    return new Date(
      parseInt(fullDate[1], 10),
      parseInt(fullDate[2], 10) - 1,
      parseInt(fullDate[3], 10),
    ).toISOString();
  }

  // 파싱 실패 시 현재 시각
  return now.toISOString();
}
