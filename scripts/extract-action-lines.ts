// 기존 Storage 이미지에서 일괄 라인 추출 CLI
//
// 사용법:
//   npm run extract:action-lines                       # lines=[] 인 전체
//   npm run extract:action-lines -- --player-id=42     # 특정 선수
//   npm run extract:action-lines -- --limit=50         # 50개만
//   npm run extract:action-lines -- --dry-run          # API 호출만, DB 저장 안 함

import path from "node:path";
import { parseArgs } from "node:util";

import dotenv from "dotenv";

// .env.local → .env 순서로 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";

import type { AllActionLines } from "./scraper/lib/vision-extractor";
import {
  downloadImage,
  extractAllActionLinesFromImage,
  logExtractionSummary,
} from "./scraper/lib/vision-extractor";

// ── CLI 인자 파싱 ──

const { values } = parseArgs({
  options: {
    "player-id": { type: "string" },
    limit: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    /** 재추출 (기존 lines 덮어쓰기) */
    force: { type: "boolean", default: false },
  },
  strict: false,
});

const playerId = values["player-id"]
  ? parseInt(String(values["player-id"]), 10)
  : undefined;
const limit = values.limit ? parseInt(String(values.limit), 10) : undefined;
const dryRun = Boolean(values["dry-run"]);
const force = Boolean(values.force);

// ── Supabase 클라이언트 ──

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.",
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── 색상 유틸 ──

const C = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
} as const;

// ── 메인 ──

interface ActionMapRow {
  id: number;
  player_id: number;
  season: string;
  action_type: "carries" | "passes" | "crosses";
  image_url: string | null;
  total_count: number;
  lines: unknown[];
  scoutlab_players: { name: string } | null;
}

async function main(): Promise<void> {
  console.log(
    `${C.cyan}[INFO]${C.reset} 액션 라인 배치 추출 시작 (dryRun=${dryRun}, force=${force})`,
  );

  const supabase = createAdminClient();

  // lines가 비어있고 이미지가 있는 레코드 조회
  let query = supabase
    .from("scoutlab_action_maps")
    .select(
      "id, player_id, season, action_type, image_url, total_count, lines, scoutlab_players(name)",
    )
    .not("image_url", "is", null);

  if (!force) {
    query = query.eq("lines", "[]");
  }

  if (playerId) {
    query = query.eq("player_id", playerId);
  }

  query = query.order("player_id", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: rows, error } = await query;

  if (error) {
    console.error(`${C.red}[ERROR]${C.reset} 쿼리 실패: ${error.message}`);
    process.exit(1);
  }

  const actionMaps = (rows ?? []) as unknown as ActionMapRow[];
  console.log(
    `${C.cyan}[INFO]${C.reset} 추출 대상: ${actionMaps.length}개 레코드`,
  );

  if (actionMaps.length === 0) {
    console.log(`${C.green}[OK]${C.reset} 추출할 레코드가 없습니다.`);
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let totalLinesExtracted = 0;
  const startTime = Date.now();

  // 같은 이미지 URL을 공유하는 레코드 그룹핑 (이미지 1회 다운로드 + 1회 API 호출)
  const imageGroups = new Map<string, ActionMapRow[]>();
  for (const row of actionMaps) {
    if (!row.image_url) {
      failCount++;
      continue;
    }
    const key = row.image_url;
    if (!imageGroups.has(key)) imageGroups.set(key, []);
    imageGroups.get(key)!.push(row);
  }

  let groupIdx = 0;
  const totalGroups = imageGroups.size;

  for (const [imageUrl, rows] of imageGroups) {
    groupIdx++;
    const firstRow = rows[0]!;
    const playerName =
      firstRow.scoutlab_players?.name ?? `player_${firstRow.player_id}`;
    const label = `${playerName} / ${firstRow.season}`;

    const pct = Math.round((groupIdx / totalGroups) * 100);
    process.stdout.write(
      `\r${C.cyan}[${pct}%]${C.reset} (${groupIdx}/${totalGroups}) ${label}`,
    );

    const imgBuf = await downloadImage(imageUrl);
    if (!imgBuf) {
      process.stdout.write("\n");
      console.error(`${C.red}[ERROR]${C.reset} ${label}: 이미지 다운로드 실패`);
      failCount += rows.length;
      continue;
    }

    let allLines: AllActionLines | null = null;
    try {
      allLines = await extractAllActionLinesFromImage(imgBuf);
    } catch (e) {
      process.stdout.write("\n");
      console.error(
        `${C.red}[ERROR]${C.reset} ${label}: ${e instanceof Error ? e.message : "unknown"}`,
      );
      failCount += rows.length;
      continue;
    }

    process.stdout.write("\n");

    for (const row of rows) {
      const lines = allLines[row.action_type] ?? [];
      logExtractionSummary(row.action_type, lines.length, row.total_count);
      totalLinesExtracted += lines.length;

      // DB 업데이트
      if (!dryRun && lines.length > 0) {
        const { error: updateError } = await supabase
          .from("scoutlab_action_maps")
          .update({ lines })
          .eq("id", row.id);

        if (updateError) {
          console.error(
            `${C.red}[ERROR]${C.reset} DB 업데이트 실패 (id=${row.id}): ${updateError.message}`,
          );
          failCount++;
          continue;
        }
      }

      successCount++;
    }
  }

  // 요약
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n" + "=".repeat(50));
  console.log(`${C.cyan}액션 라인 추출 결과 요약${C.reset}`);
  console.log("=".repeat(50));
  console.log(`전체: ${actionMaps.length}개`);
  console.log(`${C.green}성공: ${successCount}${C.reset}`);
  console.log(`${C.red}실패: ${failCount}${C.reset}`);
  console.log(`추출된 라인: ${totalLinesExtracted}개`);
  console.log(`소요 시간: ${duration}s`);
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error(
    `${C.red}[FATAL]${C.reset} ${error instanceof Error ? error.message : "unknown"}`,
  );
  process.exit(1);
});
