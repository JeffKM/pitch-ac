// ScoutLab Playwright 스크래퍼 — CLI 엔트리 포인트
//
// 사용법:
//   npm run scrape:scoutlab
//   npm run scrape:scoutlab -- --player="Mohamed Salah" --headless=false
//   npm run scrape:scoutlab -- --team="Arsenal" --league="Premier League"
//   npm run scrape:scoutlab -- --dry-run

import path from "node:path";
import { parseArgs } from "node:util";

import dotenv from "dotenv";

// .env.local → .env 순서로 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import type { FrameLocator, Page } from "@playwright/test";

import {
  launchBrowser,
  navigateToScoutLab,
  refreshAndReconnect,
} from "./lib/browser";
import { DEFAULT_DELAY, DEFAULT_LEAGUE, DEFAULT_SEASON } from "./lib/constants";
import {
  upsertMetrics,
  upsertPlayer,
  upsertSimilarity,
  writeSyncLog,
} from "./lib/db";
import {
  logError,
  logInfo,
  logProgress,
  logSuccess,
  logSummary,
  logWarn,
} from "./lib/logger";
import {
  extractPlayerList,
  extractTeamList,
  searchPlayer,
  selectLeague,
  selectPlayer,
  selectSeason,
  selectSidebarTab,
  selectTeam,
  toggleAdjustment,
  toggleComparisonPosition,
  toggleMode,
} from "./lib/navigation";
import {
  groupMetricsByCategory,
  parseMetrics,
  parsePlayerInfo,
  parseSimilarPlayers,
} from "./lib/parsers";
import { createScraperClient } from "./lib/supabase";
import type { ScraperOptions, ScrapeStats } from "./lib/types";

/** 유효한 mode/adjustment 조합 */
const ALL_MODES = ["per90", "total"] as const;
const ALL_ADJUSTMENTS = ["padj", "raw"] as const;
const ALL_COMPARISON_POSITIONS = ["CB", "FB", "MF", "AM/W", "FW"] as const;

/** CLI 인자 파싱 */
function parseCliArgs(): ScraperOptions {
  const { values } = parseArgs({
    options: {
      season: { type: "string", default: DEFAULT_SEASON },
      league: { type: "string", default: DEFAULT_LEAGUE },
      team: { type: "string" },
      player: { type: "string" },
      headless: { type: "string", default: "true" },
      "dry-run": { type: "boolean", default: false },
      delay: { type: "string", default: String(DEFAULT_DELAY) },
      mode: { type: "string" },
      adjustment: { type: "string" },
      "skip-positions": { type: "boolean", default: false },
    },
    strict: false,
  });

  const modeVal = values.mode as string | undefined;
  const adjVal = values.adjustment as string | undefined;

  return {
    season: String(values.season ?? DEFAULT_SEASON),
    league: String(values.league ?? DEFAULT_LEAGUE),
    team: values.team != null ? String(values.team) : undefined,
    player: values.player != null ? String(values.player) : undefined,
    headless: String(values.headless) !== "false",
    dryRun: Boolean(values["dry-run"]),
    delay: parseInt(String(values.delay ?? DEFAULT_DELAY), 10),
    mode:
      modeVal && (ALL_MODES as readonly string[]).includes(modeVal)
        ? (modeVal as "per90" | "total")
        : undefined,
    adjustment:
      adjVal && (ALL_ADJUSTMENTS as readonly string[]).includes(adjVal)
        ? (adjVal as "padj" | "raw")
        : undefined,
    skipPositions: Boolean(values["skip-positions"]),
  };
}

/** 선수 DOM 파싱 + DB 저장 */
async function parseAndSave(
  iframe: FrameLocator,
  page: Page,
  supabase: ReturnType<typeof createScraperClient>,
  playerName: string,
  league: string,
  season: string,
  dryRun: boolean,
  mode: "per90" | "total" = "per90",
  adjustment: "padj" | "raw" = "padj",
  comparisonPosition: string = "AM/W",
): Promise<boolean> {
  const playerInfo = await parsePlayerInfo(iframe);
  const metrics = await parseMetrics(iframe);

  // 유사 선수는 기본 조합(per90+padj+자체포지션)에서만 수집
  const isDefault = mode === "per90" && adjustment === "padj";
  const similar = isDefault ? await parseSimilarPlayers(iframe, page) : [];

  logInfo(
    `  ${playerInfo.name} | ${mode}/${adjustment}/${comparisonPosition} | 메트릭 ${metrics.length}개`,
  );

  if (dryRun) {
    logWarn("  [DRY-RUN] DB 쓰기 스킵");
    return true;
  }

  const grouped = groupMetricsByCategory(metrics);
  const playerId = await upsertPlayer(supabase, playerInfo, league);
  await upsertMetrics(
    supabase,
    playerId,
    season,
    grouped,
    mode,
    adjustment,
    comparisonPosition,
  );

  if (similar.length > 0) {
    await upsertSimilarity(supabase, playerId, season, similar);
  }

  logSuccess(`  ${playerInfo.name} 저장 완료 (id: ${playerId})`);
  return true;
}

/** 현재 선수에 대해 mode×adjustment×position 조합 순회 스크래핑 */
async function scrapeAllCombinations(
  iframe: FrameLocator,
  page: Page,
  supabase: ReturnType<typeof createScraperClient>,
  playerName: string,
  league: string,
  season: string,
  opts: ScraperOptions,
  stats: ScrapeStats,
): Promise<void> {
  const modes = opts.mode ? [opts.mode] : [...ALL_MODES];
  const adjustments = opts.adjustment
    ? [opts.adjustment]
    : [...ALL_ADJUSTMENTS];
  const positions = opts.skipPositions
    ? ["AM/W"]
    : [...ALL_COMPARISON_POSITIONS];

  for (const mode of modes) {
    await toggleMode(iframe, page, mode);
    for (const adj of adjustments) {
      await toggleAdjustment(iframe, page, adj);
      for (const pos of positions) {
        await toggleComparisonPosition(iframe, page, pos);
        try {
          const success = await parseAndSave(
            iframe,
            page,
            supabase,
            playerName,
            league,
            season,
            opts.dryRun,
            mode,
            adj,
            pos,
          );
          if (success) stats.successCount++;
          else {
            stats.failCount++;
            stats.failedPlayers.push(`${playerName}(${mode}/${adj}/${pos})`);
          }
        } catch (error) {
          logError(`  ${playerName} (${mode}/${adj}/${pos}) 실패`, error);
          stats.failCount++;
          stats.failedPlayers.push(`${playerName}(${mode}/${adj}/${pos})`);
        }
      }
    }
  }
}

/** 메인 실행 */
async function main(): Promise<void> {
  const opts = parseCliArgs();
  logInfo("ScoutLab 스크래퍼 시작");
  logInfo(
    `설정: season=${opts.season}, league=${opts.league}, team=${opts.team ?? "전체"}, player=${opts.player ?? "전체"}, headless=${opts.headless}, dryRun=${opts.dryRun}`,
  );

  const supabase = createScraperClient();
  const stats: ScrapeStats = {
    totalPlayers: 0,
    successCount: 0,
    failCount: 0,
    failedPlayers: [],
    startTime: Date.now(),
  };

  const { browser, page } = await launchBrowser(opts.headless);

  try {
    let iframe = await navigateToScoutLab(page);

    // Player Card 탭 + 시즌 선택
    await selectSidebarTab(iframe, page, "Player Card");
    await selectSeason(iframe, page, opts.season);

    if (opts.player && !opts.team) {
      // 모드 A: 글로벌 검색 (--player만 지정)
      stats.totalPlayers = 1;
      try {
        await searchPlayer(iframe, page, opts.player);
        await selectSidebarTab(iframe, page, "Player Card");
        await scrapeAllCombinations(
          iframe,
          page,
          supabase,
          opts.player,
          opts.league,
          opts.season,
          opts,
          stats,
        );
      } catch (error) {
        logError(`  ${opts.player} 스크래핑 실패`, error);
        stats.failCount++;
        stats.failedPlayers.push(opts.player);
      }
    } else {
      // 모드 B/C: 리그 선택 후 팀/선수 처리
      await selectLeague(iframe, page, opts.league);

      if (opts.player && opts.team) {
        // 모드 B: 팀+선수 지정
        await selectTeam(iframe, page, opts.team);
        stats.totalPlayers = 1;
        try {
          await selectPlayer(iframe, page, opts.player);
          await scrapeAllCombinations(
            iframe,
            page,
            supabase,
            opts.player,
            opts.league,
            opts.season,
            opts,
            stats,
          );
        } catch (error) {
          logError(`  ${opts.player} 스크래핑 실패`, error);
          stats.failCount++;
          stats.failedPlayers.push(opts.player);
        }
      } else {
        // 모드 C: 팀 반복 (--team 지정 시 1개, 미지정 시 전체)
        const teams = opts.team
          ? [opts.team]
          : await extractTeamList(iframe, page);
        logInfo(`팀 ${teams.length}개 발견`);

        for (let ti = 0; ti < teams.length; ti++) {
          const team = teams[ti]!;
          logInfo(`\n[${ti + 1}/${teams.length}] 팀: ${team}`);

          try {
            await selectTeam(iframe, page, team);
            const players = await extractPlayerList(iframe, page);
            logInfo(`  선수 ${players.length}명 발견`);
            stats.totalPlayers += players.length;

            for (let pi = 0; pi < players.length; pi++) {
              const playerName = players[pi]!;
              logProgress(pi + 1, players.length, playerName);

              try {
                await selectPlayer(iframe, page, playerName);
                await scrapeAllCombinations(
                  iframe,
                  page,
                  supabase,
                  playerName,
                  opts.league,
                  opts.season,
                  opts,
                  stats,
                );
              } catch (error) {
                logError(`  ${playerName} 스크래핑 실패`, error);
                stats.failCount++;
                stats.failedPlayers.push(playerName);
              }

              if (pi < players.length - 1) {
                await page.waitForTimeout(opts.delay);
              }
            }
          } catch (error) {
            logError(`팀 ${team} 처리 중 오류, 페이지 새로고침`, error);
            try {
              iframe = await refreshAndReconnect(page);
              await selectSidebarTab(iframe, page, "Player Card");
              await selectSeason(iframe, page, opts.season);
              await selectLeague(iframe, page, opts.league);
            } catch (refreshError) {
              logError("페이지 복구 실패, 다음 팀으로 건너뜀", refreshError);
            }
          }
        }
      }
    }

    // 동기화 로그
    if (!opts.dryRun) {
      await writeSyncLog(supabase, {
        scraper: "player-card",
        season: opts.season,
        league: opts.league,
        status: stats.failCount === 0 ? "success" : "error",
        recordsSynced: stats.successCount,
        recordsFailed: stats.failCount,
        errorMessage:
          stats.failedPlayers.length > 0
            ? `실패 선수: ${stats.failedPlayers.join(", ")}`
            : undefined,
        durationMs: Date.now() - stats.startTime,
      });
    }

    logSummary(stats);
  } finally {
    await browser.close();
    logInfo("브라우저 종료");
  }
}

main().catch((error) => {
  logError("스크래퍼 치명적 오류", error);
  process.exit(1);
});
