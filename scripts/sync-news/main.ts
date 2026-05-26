// 이적뉴스 크롤링 스크립트 (Playwright 기반)
//
// 사용법:
//   npm run sync:news

import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { chromium } from "playwright";

// .env.local → .env 순서로 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import {
  classifySourceType,
  isBannedPost,
  parseArticleUrls,
  parsePostList,
  rawPostToDbRow,
  rawPostToMetaUpdate,
} from "@/lib/api/fmkorea";
import { FMKOREA_BASE_URL, FMKOREA_BOARD } from "@/lib/constants/fmkorea";

// ── 랜덤 대기 (봇 감지 회피) ──

const MIN_WAIT_MS = 5000;
const MAX_JITTER_MS = 3000;

function randomDelay(): number {
  return MIN_WAIT_MS + Math.floor(Math.random() * MAX_JITTER_MS);
}

// ── Supabase admin 클라이언트 (스크립트용, server-only 우회) ──

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE 환경변수 누락 (URL 또는 SERVICE_ROLE_KEY)");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── 메인 크롤링 로직 ──

async function main() {
  console.log("=== 이적뉴스 크롤링 시작 (Playwright) ===\n");

  const supabase = createAdminClient();
  let synced = 0;
  let skipped = 0;
  let updated = 0;

  // Playwright 브라우저 launch (봇 감지 우회 설정)
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
    locale: "ko-KR",
  });

  try {
    // 1) 리스트 페이지 크롤링
    const listUrl = `${FMKOREA_BASE_URL}/${FMKOREA_BOARD}`;
    console.log(`[1/4] 리스트 페이지 접속: ${listUrl}`);
    await page.goto(listUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    // 게시판 테이블 로딩 대기
    await page.waitForSelector("table.bd_lst tbody tr", { timeout: 10_000 });
    const listHtml = await page.content();
    const posts = parsePostList(listHtml);
    console.log(`  → ${posts.length}개 게시글 파싱 완료\n`);

    if (posts.length === 0) {
      console.log(
        "파싱된 게시글이 없습니다. HTML 구조가 변경되었을 수 있습니다.",
      );
      return;
    }

    // 2) 금칙어 필터링
    const filtered = posts.filter((p) => !isBannedPost(p.title));
    const banned = posts.length - filtered.length;
    if (banned > 0) {
      console.log(`[2/4] 금칙어 필터링: ${banned}개 제외\n`);
    } else {
      console.log("[2/4] 금칙어 필터링: 해당 없음\n");
    }

    // 3) 기존 글 조회
    const postIds = filtered.map((p) => p.id);
    const { data: existingRows } = await supabase
      .from("transfer_news")
      .select("id, body_crawled")
      .in("id", postIds);

    const existingIds = new Set(existingRows?.map((r) => r.id) ?? []);
    console.log(
      `[3/4] DB 조회: ${existingIds.size}개 기존 / ${filtered.length - existingIds.size}개 신규\n`,
    );

    // 4) 처리
    console.log("[4/4] 게시글 처리 시작\n");

    for (const post of filtered) {
      if (existingIds.has(post.id)) {
        // 기존 글 → 메타데이터만 업데이트
        const meta = rawPostToMetaUpdate(post);
        await supabase.from("transfer_news").update(meta).eq("id", post.id);
        updated++;
        continue;
      }

      // 새 글 → 본문 크롤링
      console.log(`  📰 [${post.id}] ${post.title}`);

      try {
        const postUrl = `${FMKOREA_BASE_URL}/${post.id}`;
        await page.goto(postUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30_000,
        });
        const bodyHtml = await page.content();
        const urls = parseArticleUrls(bodyHtml);

        if (urls.length === 0) {
          console.log(`    ⏭  소스 링크 없음 — 스킵`);
          skipped++;
          // 다음 요청 전 대기
          await page.waitForTimeout(randomDelay());
          continue;
        }

        const sourceType = classifySourceType(urls);
        const dbRow = rawPostToDbRow(post, sourceType, urls);

        const { error } = await supabase
          .from("transfer_news")
          .upsert(dbRow, { onConflict: "id" });

        if (error) {
          console.error(`    ❌ DB 저장 실패: ${error.message}`);
        } else {
          console.log(`    ✅ 저장 (${sourceType}, 링크 ${urls.length}개)`);
          synced++;
        }
      } catch (err) {
        console.error(
          `    ❌ 본문 크롤링 실패: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // 다음 요청 전 랜덤 대기 (5~8초)
      await page.waitForTimeout(randomDelay());
    }

    // 5) sync_logs 기록
    await supabase.from("sync_logs").insert({
      entity: "transfer-news",
      status: "success",
      records_synced: synced,
      error_message: null,
    });

    console.log(`\n=== 완료 ===`);
    console.log(`  신규 저장: ${synced}개`);
    console.log(`  메타 업데이트: ${updated}개`);
    console.log(`  스킵 (링크 없음): ${skipped}개`);
    console.log(`  금칙어 제외: ${banned}개`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ 크롤링 실패: ${msg}`);

    await supabase.from("sync_logs").insert({
      entity: "transfer-news",
      status: "error",
      records_synced: synced,
      error_message: msg,
    });

    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
