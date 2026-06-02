// 이미지에서 Action Maps 텍스트 메타데이터 배치 추출
//
// ScoutLab 이미지 상단의 "Carries (165 | 6.9 P90)" 텍스트를
// Sharp(크롭/전처리) + Tesseract(로컬 OCR)로 읽어 DB에 업데이트
//
// 사전 요구: brew install tesseract
//
// 사용법:
//   npx tsx scripts/extract-action-text.ts                   # totalCount=0 인 전체
//   npx tsx scripts/extract-action-text.ts --player-id=42    # 특정 선수
//   npx tsx scripts/extract-action-text.ts --limit=10        # 10개만
//   npx tsx scripts/extract-action-text.ts --dry-run         # DB 저장 안 함

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

// ── CLI 인자 파싱 ──

const { values } = parseArgs({
  options: {
    "player-id": { type: "string" },
    limit: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
  },
  strict: false,
});

const playerId = values["player-id"] ? Number(values["player-id"]) : null;
const limit = values["limit"] ? Number(values["limit"]) : null;
const dryRun = values["dry-run"] ?? false;
const force = values["force"] ?? false;

// ── Supabase ──

function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수 누락");
  return createClient(url, key);
}

// ── 타입 ──

interface ActionMapRow {
  id: number;
  player_id: number;
  action_type: string;
  image_url: string;
  total_count: number;
  per90: number;
}

interface ExtractedStats {
  carries: { totalCount: number; per90: number } | null;
  passes: { totalCount: number; per90: number } | null;
  crosses: { totalCount: number; per90: number } | null;
}

// ── 로컬 OCR (Sharp + Tesseract) ──

const TMP_FILE = path.join(process.cwd(), ".tmp_ocr_header.png");

/**
 * 이미지 버퍼에서 헤더 텍스트 추출
 *
 * 파이프라인: 상단 45px 크롭 → 반전 → 정규화 → 5x 확대 → 회색조 → 샤프닝
 * → Tesseract OCR → 정규식 파싱
 */
async function extractStatsFromImage(
  imageBuffer: Buffer,
): Promise<ExtractedStats> {
  const empty: ExtractedStats = { carries: null, passes: null, crosses: null };

  try {
    // Sharp 전처리: 헤더 영역 크롭 + OCR 최적화
    await sharp(imageBuffer)
      .extract({ left: 0, top: 0, width: 1460, height: 45 })
      .negate({ alpha: false })
      .normalise()
      .resize(7300, 225, { kernel: "lanczos3" })
      .greyscale()
      .sharpen({ sigma: 2 })
      .toFile(TMP_FILE);

    // Tesseract OCR
    const ocrText = execSync(
      `tesseract ${TMP_FILE} stdout --psm 6 --dpi 300 2>/dev/null`,
      { encoding: "utf-8" },
    ).trim();

    if (!ocrText) return empty;

    // 정규식 파싱: "Carries (36 | 1.5 P90)"
    const regex =
      /(carries|passes|crosses)\s*\(\s*(\d+)\s*\|\s*([\d.]+)\s*P\s*9\s*0\s*\)/gi;
    let match;
    const result: ExtractedStats = {
      carries: null,
      passes: null,
      crosses: null,
    };

    while ((match = regex.exec(ocrText)) !== null) {
      const type = match[1]!.toLowerCase() as keyof ExtractedStats;
      result[type] = {
        totalCount: parseInt(match[2]!, 10),
        per90: parseFloat(match[3]!),
      };
    }

    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  OCR 실패: ${msg.slice(0, 200)}`);
    return empty;
  }
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  이미지 다운로드 실패: ${response.status}`);
      return null;
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error(
      "  이미지 다운로드 오류:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

// ── 색상 유틸 ──

const C = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
} as const;

// ── 메인 ──

async function main() {
  console.log(
    `${C.cyan}=== Action Maps 텍스트 메타데이터 추출 (Tesseract OCR) ===${C.reset}`,
  );
  console.log(
    `옵션: playerId=${playerId}, limit=${limit}, dryRun=${dryRun}, force=${force}`,
  );

  // Tesseract 설치 확인
  try {
    execSync("which tesseract", { encoding: "utf-8" });
  } catch {
    console.error(
      `${C.red}Tesseract 미설치. brew install tesseract 실행 필요${C.reset}`,
    );
    process.exit(1);
  }

  const supabase = createSupabase();

  // totalCount=0인 레코드 전체 조회 (Supabase 기본 1000행 제한 우회)
  const allRows: ActionMapRow[] = [];
  const PAGE_SIZE = 1000;
  let offset = 0;

  while (true) {
    let query = supabase
      .from("scoutlab_action_maps")
      .select("id, player_id, action_type, image_url, total_count, per90")
      .not("image_url", "is", null);

    if (!force) {
      query = query.eq("total_count", 0);
    }
    if (playerId) {
      query = query.eq("player_id", playerId);
    }

    const { data: rows, error: qErr } = await query
      .order("player_id")
      .range(offset, offset + PAGE_SIZE - 1);

    if (qErr) throw qErr;
    if (!rows || rows.length === 0) break;

    allRows.push(...(rows as ActionMapRow[]));
    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  if (allRows.length === 0) {
    console.log(
      `${C.green}추출 대상 없음 — 모든 레코드에 count/p90 데이터가 있습니다${C.reset}`,
    );
    return;
  }

  // player_id 기준으로 그룹핑 (같은 이미지 1회만 다운로드+OCR)
  const byPlayer = new Map<number, ActionMapRow[]>();
  for (const row of allRows) {
    const list = byPlayer.get(row.player_id) ?? [];
    list.push(row);
    byPlayer.set(row.player_id, list);
  }

  const playerIds = [...byPlayer.keys()];
  const total = limit ? Math.min(limit, playerIds.length) : playerIds.length;
  console.log(`대상: ${total}명 선수 (${allRows.length}개 레코드)\n`);

  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < total; i++) {
    const pid = playerIds[i]!;
    const playerRows = byPlayer.get(pid)!;
    const imageUrl = playerRows[0]!.image_url;

    const pct = Math.round(((i + 1) / total) * 100);
    process.stdout.write(
      `\r${C.cyan}[${pct}%]${C.reset} (${i + 1}/${total}) player_id=${pid}`,
    );

    // 이미지 다운로드
    const imgBuf = await downloadImage(imageUrl);
    if (!imgBuf) {
      failCount++;
      process.stdout.write(` ${C.red}다운로드 실패${C.reset}\n`);
      continue;
    }

    // 로컬 OCR
    const extracted = await extractStatsFromImage(imgBuf);
    const hasData = extracted.carries || extracted.passes || extracted.crosses;

    if (!hasData) {
      failCount++;
      process.stdout.write(` ${C.red}OCR 실패${C.reset}\n`);
      continue;
    }

    // 결과 로그
    const parts: string[] = [];
    for (const type of ["carries", "passes", "crosses"] as const) {
      const v = extracted[type];
      if (v) parts.push(`${type[0]!.toUpperCase()}:${v.totalCount}/${v.per90}`);
    }
    process.stdout.write(` ${C.green}${parts.join(" ")}${C.reset}\n`);

    // DB 업데이트
    if (!dryRun) {
      for (const row of playerRows) {
        const type = row.action_type as keyof ExtractedStats;
        const vals = extracted[type];
        if (!vals) continue;

        const { error: updateError } = await supabase
          .from("scoutlab_action_maps")
          .update({
            total_count: vals.totalCount,
            per90: vals.per90,
          })
          .eq("id", row.id);

        if (updateError) {
          console.error(
            `  ${C.red}DB 업데이트 실패 (id=${row.id}): ${updateError.message}${C.reset}`,
          );
        }
      }
    }

    successCount++;
  }

  // 임시 파일 정리
  try {
    fs.unlinkSync(TMP_FILE);
  } catch {
    // 무시
  }

  // 결과 요약
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${"=".repeat(45)}`);
  console.log(`${C.cyan}결과 요약${C.reset}`);
  console.log(`${"=".repeat(45)}`);
  console.log(`${C.green}성공: ${successCount}${C.reset}`);
  console.log(`${C.red}실패: ${failCount}${C.reset}`);
  console.log(`소요: ${duration}s`);
  if (dryRun) console.log(`${C.yellow}(DRY-RUN: DB 미반영)${C.reset}`);
  console.log(`${"=".repeat(45)}`);
}

main().catch((err) => {
  console.error(`${C.red}치명적 오류:${C.reset}`, err);
  process.exit(1);
});
