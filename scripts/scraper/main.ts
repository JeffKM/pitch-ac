// ScoutLab Playwright 스크래퍼 — CLI 엔트리 포인트
//
// 사용법:
//   npm run scrape:scoutlab
//   npm run scrape:scoutlab -- --player="Mohamed Salah" --headless=false
//   npm run scrape:scoutlab -- --team="Arsenal" --league="Premier League"
//   npm run scrape:scoutlab -- --dry-run
//   npm run scrape:scoutlab -- --team="Lazio" --league="Serie A" --metrics-only --match-position

import path from "node:path";
import { parseArgs } from "node:util";

import dotenv from "dotenv";

// .env.local → .env 순서로 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import type { FrameLocator, Page } from "@playwright/test";

import type { ScoutlabSeason } from "@/types/scoutlab";
import { SCOUTLAB_SEASONS } from "@/types/scoutlab";

import {
  launchBrowser,
  navigateToScoutLab,
  refreshAndReconnect,
} from "./lib/browser";
import { DEFAULT_DELAY, DEFAULT_LEAGUE, DEFAULT_SEASON } from "./lib/constants";
import {
  upsertActionMaps,
  upsertMetrics,
  upsertPlayer,
  upsertSimilarity,
  writeSyncLog,
} from "./lib/db";
import { dumpActionMapsDom } from "./lib/dom-inspector";
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
  navigateBackToPlayerCard,
  navigateToActionMapsTab,
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
  CardValidationError,
  EmptyMetricsError,
  groupMetricsByCategory,
  parseActionMaps,
  parseMetrics,
  parsePlayerInfo,
  parseSimilarPlayersFromTab,
} from "./lib/parsers";
import { createScraperClient } from "./lib/supabase";
import type { ScraperOptions, ScrapeStats } from "./lib/types";
import {
  downloadImage,
  extractAllActionLinesFromImage,
  logExtractionSummary,
} from "./lib/vision-extractor";

/** 유효한 mode/adjustment 조합 */
const ALL_MODES = ["per90", "total"] as const;
const ALL_ADJUSTMENTS = ["padj", "raw"] as const;
const ALL_COMPARISON_POSITIONS = ["CB", "FB", "MF", "AM/W", "FW"] as const;

/**
 * 배치를 즉시 중단시켜야 하는 치명적 상태.
 * 이 에러는 어디서도 삼키지 않고 main 밖으로 전파되어 프로세스가 exit(1)로 죽는다
 * (조용히 계속 도는 것보다 죽어서 러너가 감지하게 하는 편이 낫다).
 */
class FatalScraperError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FatalScraperError";
  }
}

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
      "match-position": { type: "boolean", default: false },
      positions: { type: "string" },
      "similarity-only": { type: "boolean", default: false },
      "action-maps-only": { type: "boolean", default: false },
      "metrics-only": { type: "boolean", default: false },
      "dump-action-maps-dom": { type: "boolean", default: false },
      "extract-lines": { type: "boolean", default: false },
    },
    strict: false,
  });

  const modeVal = values.mode as string | undefined;
  const adjVal = values.adjustment as string | undefined;

  return {
    season: parseSeasonArg(String(values.season ?? DEFAULT_SEASON)),
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
    matchPosition: Boolean(values["match-position"]),
    positions: parsePositionsArg(values.positions as string | undefined),
    similarityOnly: Boolean(values["similarity-only"]),
    actionMapsOnly: Boolean(values["action-maps-only"]),
    metricsOnly: Boolean(values["metrics-only"]),
    dumpDom: Boolean(values["dump-action-maps-dom"]),
    extractLines: Boolean(values["extract-lines"]),
  };
}

/**
 * --season 값 검증.
 * 저장되는 season의 단일 진실 공급원이므로 값이 어긋나면 즉시 중단한다.
 * 정규식 형식 검사(`^\d{2}\/\d{2}$`)만 하면 "42/25"처럼 연속 연도가 아닌 값도
 * 통과하므로, 실제 지원 시즌 목록(SCOUTLAB_SEASONS)으로 검증한다.
 */
function parseSeasonArg(raw: string): ScoutlabSeason {
  const valid = SCOUTLAB_SEASONS as readonly string[];
  if (!valid.includes(raw)) {
    throw new Error(
      `유효하지 않은 시즌: "${raw}" (가능: ${SCOUTLAB_SEASONS.join(", ")})`,
    );
  }
  return raw as ScoutlabSeason;
}

/** --positions=CB,FB,MF,FW → 유효성 검증 후 배열 반환 */
function parsePositionsArg(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined;
  const valid = new Set<string>(ALL_COMPARISON_POSITIONS);
  const parsed = raw.split(",").map((s) => s.trim());
  const invalid = parsed.filter((p) => !valid.has(p));
  if (invalid.length > 0) {
    throw new Error(
      `유효하지 않은 포지션: ${invalid.join(", ")} (가능: ${[...valid].join(", ")})`,
    );
  }
  return parsed;
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
  const playerInfo = await parsePlayerInfo(iframe, season, playerName);
  const metrics = await parseMetrics(iframe);

  logInfo(
    `  ${playerInfo.name} | ${mode}/${adjustment}/${comparisonPosition} | 메트릭 ${metrics.length}개`,
  );

  // 빈 메트릭을 저장하면 "수집 완료"로 보이는 빈 JSONB 행이 남아 갭 탐지가 무력화된다
  if (metrics.length === 0) {
    throw new EmptyMetricsError(
      `메트릭 0개 (${playerInfo.name}, ${mode}/${adjustment}/${comparisonPosition}) — 저장하지 않고 실패 처리`,
    );
  }

  if (dryRun) {
    logWarn(
      `  [DRY-RUN] DB 쓰기 스킵 (저장 대상 season=${season}, 카드 season=${playerInfo.season})`,
    );
    return true;
  }

  const grouped = groupMetricsByCategory(metrics);
  const playerId = await upsertPlayer(supabase, playerInfo, league, season);
  await upsertMetrics(
    supabase,
    playerId,
    season,
    grouped,
    mode,
    adjustment,
    comparisonPosition,
  );

  logSuccess(`  ${playerInfo.name} 저장 완료 (id: ${playerId})`);
  return true;
}

/**
 * 현재 선수에 대해 Similarity Score 탭 파싱 → DB 저장 (1회)
 * @returns 실제 저장(dry-run은 파싱)에 성공했는지 여부.
 *   에러를 삼키고 성공으로 집계하면 8시간 배치 요약과 sync_logs가 거짓이 되므로
 *   반드시 이 반환값으로 호출부에서 분기한다.
 */
async function scrapeSimilarity(
  iframe: FrameLocator,
  page: Page,
  supabase: ReturnType<typeof createScraperClient>,
  playerName: string,
  league: string,
  season: string,
  dryRun: boolean,
): Promise<boolean> {
  try {
    // 선수 기본 정보에서 playerId 확보 (시즌·선수명 검증 포함)
    const playerInfo = await parsePlayerInfo(iframe, season, playerName);
    const playerId = dryRun
      ? 0
      : await upsertPlayer(supabase, playerInfo, league, season);

    // Similarity Score 탭 → 20명 파싱 → Player Card 복귀
    const similar = await parseSimilarPlayersFromTab(iframe, page);

    if (similar.length === 0) {
      logError(`  ${playerName} similarity 0명 파싱 — 저장 없음(실패 처리)`);
      return false;
    }

    if (dryRun) {
      logWarn(
        `  [DRY-RUN] similarity ${similar.length}명 파싱됨, DB 쓰기 스킵 (저장 대상 season=${season})`,
      );
      return true;
    }

    await upsertSimilarity(supabase, playerId, season, similar);
    logSuccess(
      `  ${playerName} similarity 저장 완료 (${similar.length}명, id: ${playerId})`,
    );
    return true;
  } catch (error) {
    // 카드 검증 실패(시즌·선수명 불일치)는 삼키지 않는다 — 선수 전체를 스킵
    if (error instanceof CardValidationError) throw error;
    logError(`  ${playerName} similarity 수집 실패`, error);
    return false;
  }
}

/**
 * 현재 선수에 대해 Action Maps 탭 파싱 → DB 저장
 * @returns 실제 저장(dry-run은 파싱)에 성공했는지 여부.
 *   0개 파싱·Storage 업로드 실패·탭 미발견을 성공으로 집계하지 않기 위한 반환값이다.
 */
async function scrapeActionMaps(
  iframe: FrameLocator,
  page: Page,
  supabase: ReturnType<typeof createScraperClient>,
  playerName: string,
  league: string,
  season: string,
  dryRun: boolean,
  extractLines: boolean = false,
): Promise<boolean> {
  try {
    // 선수 기본 정보에서 playerId 확보 (시즌·선수명 검증 포함)
    const playerInfo = await parsePlayerInfo(iframe, season, playerName);
    const playerId = dryRun
      ? 0
      : await upsertPlayer(supabase, playerInfo, league, season);

    // Action Maps 탭 이동 → 파싱 → Player Card 복귀
    await navigateToActionMapsTab(iframe, page);

    try {
      const actionMaps = await parseActionMaps(iframe, page);

      // --extract-lines: Vision API로 이미지에서 라인 좌표 추출
      // 이미지 1회 다운로드 → 1회 API 호출로 3개 타입 동시 추출
      if (extractLines) {
        // 이미지 URL 찾기 (3개 타입 모두 같은 이미지)
        const imageUrl = actionMaps.find((m) => m.imageUrl)?.imageUrl;
        if (imageUrl) {
          const imgBuf = await downloadImage(imageUrl);
          if (imgBuf) {
            const allLines = await extractAllActionLinesFromImage(imgBuf);
            for (const map of actionMaps) {
              map.lines = allLines[map.actionType] ?? [];
              logExtractionSummary(
                map.actionType,
                map.lines.length,
                map.totalCount,
              );
            }
          }
        }
      }

      if (actionMaps.length === 0) {
        logError(`  ${playerName} action maps 0개 파싱 — 저장 없음(실패 처리)`);
        return false;
      }

      const totalLines = actionMaps.reduce((sum, m) => sum + m.lines.length, 0);

      if (dryRun) {
        logWarn(
          `  [DRY-RUN] action maps ${actionMaps.length}개 타입, ${totalLines}개 라인 파싱됨, DB 쓰기 스킵 (저장 대상 season=${season})`,
        );
        return true;
      }

      // Storage 업로드 실패도 여기서 throw되어 아래 catch → false로 집계된다
      await upsertActionMaps(supabase, playerId, season, actionMaps);
      logSuccess(
        `  ${playerName} action maps 저장 완료 (${actionMaps.length}개 타입, ${totalLines}개 라인, id: ${playerId})`,
      );
      return true;
    } finally {
      // 항상 Player Card 복귀 보장
      await navigateBackToPlayerCard(iframe, page);
    }
  } catch (error) {
    // 카드 검증 실패(시즌·선수명 불일치)는 삼키지 않는다 — 선수 전체를 스킵
    if (error instanceof CardValidationError) throw error;
    logError(`  ${playerName} action maps 수집 실패`, error);
    return false;
  }
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
  // Similarity Score 탭에서 1회 수집 (메트릭 루프 전)
  // 이 경로의 성공/실패 집계는 메트릭 조합 루프가 담당하므로, 부가 수집 실패는
  // stats.auxFailures에 기록해 요약에서 드러나게 한다 (조용한 성공 집계 방지)
  const similarityOk = await scrapeSimilarity(
    iframe,
    page,
    supabase,
    playerName,
    league,
    season,
    opts.dryRun,
  );
  if (!similarityOk) stats.auxFailures.push(`${playerName}(similarity)`);

  // Action Maps 탭에서 1회 수집 (메트릭 루프 전) — --metrics-only 시 스킵 (Vision OCR 비용 절약)
  if (!opts.metricsOnly) {
    const actionMapsOk = await scrapeActionMaps(
      iframe,
      page,
      supabase,
      playerName,
      league,
      season,
      opts.dryRun,
      opts.extractLines,
    );
    if (!actionMapsOk) stats.auxFailures.push(`${playerName}(action-maps)`);
  }

  const modes = opts.mode ? [opts.mode] : [...ALL_MODES];
  const adjustments = opts.adjustment
    ? [opts.adjustment]
    : [...ALL_ADJUSTMENTS];

  // 포지션 결정: --match-position > --positions > --skip-positions > 전체
  let positions: string[];
  if (opts.matchPosition) {
    // 선수 본인 포지션 감지 후 해당 포지션만 사용
    const playerInfo = await parsePlayerInfo(iframe, season, playerName);
    const ownPosition = playerInfo.position;
    if ((ALL_COMPARISON_POSITIONS as readonly string[]).includes(ownPosition)) {
      positions = [ownPosition];
      logInfo(`  → 본인 포지션 감지: ${ownPosition}`);
    } else {
      logWarn(`  → 포지션 "${ownPosition}" 매핑 불가, AM/W 폴백`);
      positions = ["AM/W"];
    }
  } else if (opts.positions?.length) {
    positions = opts.positions;
  } else if (opts.skipPositions) {
    positions = ["AM/W"];
  } else {
    positions = [...ALL_COMPARISON_POSITIONS];
  }

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

/** 선수 1명에 대한 스크래핑 실행 (similarity-only / 전체 조합) */
async function scrapePlayer(
  iframe: FrameLocator,
  page: Page,
  supabase: ReturnType<typeof createScraperClient>,
  playerName: string,
  league: string,
  season: string,
  opts: ScraperOptions,
  stats: ScrapeStats,
): Promise<void> {
  if (opts.actionMapsOnly) {
    // action maps만 수집 — 실제 저장 성공 여부로 분기 (무조건 성공 집계 금지)
    const ok = await scrapeActionMaps(
      iframe,
      page,
      supabase,
      playerName,
      league,
      season,
      opts.dryRun,
      opts.extractLines,
    );
    if (ok) {
      stats.successCount++;
    } else {
      stats.failCount++;
      stats.failedPlayers.push(`${playerName}(action-maps)`);
    }
  } else if (opts.similarityOnly) {
    // similarity만 수집 (메트릭 스킵) — 실제 저장 성공 여부로 분기
    const ok = await scrapeSimilarity(
      iframe,
      page,
      supabase,
      playerName,
      league,
      season,
      opts.dryRun,
    );
    if (ok) {
      stats.successCount++;
    } else {
      stats.failCount++;
      stats.failedPlayers.push(`${playerName}(similarity)`);
    }
  } else {
    await scrapeAllCombinations(
      iframe,
      page,
      supabase,
      playerName,
      league,
      season,
      opts,
      stats,
    );
  }
}

/**
 * sync_logs.error_message 구성.
 * 부가 수집(similarity/action maps) 실패는 status를 뒤집지 않지만,
 * 로그에는 반드시 남겨 "성공으로 보이는 배치"가 실제로 무엇을 놓쳤는지 추적 가능하게 한다.
 */
function buildSyncErrorMessage(stats: ScrapeStats): string | undefined {
  const parts: string[] = [];
  if (stats.failedPlayers.length > 0) {
    parts.push(`실패 선수: ${stats.failedPlayers.join(", ")}`);
  }
  if (stats.auxFailures.length > 0) {
    parts.push(
      `부가 수집 실패(${stats.auxFailures.length}건): ${stats.auxFailures.join(", ")}`,
    );
  }
  return parts.length > 0 ? parts.join(" | ") : undefined;
}

/** 메인 실행 */
async function main(): Promise<void> {
  const opts = parseCliArgs();
  logInfo("ScoutLab 스크래퍼 시작");
  const posStr = opts.matchPosition
    ? "match-position"
    : (opts.positions?.join(",") ?? (opts.skipPositions ? "AM/W" : "all"));
  const modeStr = opts.dumpDom
    ? "dump-action-maps-dom"
    : opts.actionMapsOnly
      ? "action-maps-only"
      : opts.similarityOnly
        ? "similarity-only"
        : opts.metricsOnly
          ? `metrics-only, mode=${opts.mode ?? "all"}, adj=${opts.adjustment ?? "all"}, positions=${posStr}`
          : `mode=${opts.mode ?? "all"}, adj=${opts.adjustment ?? "all"}, positions=${posStr}`;
  logInfo(
    `설정: season=${opts.season}, league=${opts.league}, team=${opts.team ?? "전체"}, player=${opts.player ?? "전체"}, ${modeStr}, headless=${opts.headless}, dryRun=${opts.dryRun}`,
  );

  const supabase = createScraperClient();
  const stats: ScrapeStats = {
    totalPlayers: 0,
    successCount: 0,
    failCount: 0,
    failedPlayers: [],
    auxFailures: [],
    startTime: Date.now(),
  };

  const { browser, page } = await launchBrowser(opts.headless);

  try {
    let iframe = await navigateToScoutLab(page);

    // Player Card 탭 + 시즌 선택
    await selectSidebarTab(iframe, page, "Player Card");
    await selectSeason(iframe, page, opts.season);

    // dumpDom 모드: DOM 탐색 후 즉시 종료
    if (opts.dumpDom) {
      if (opts.player) {
        await searchPlayer(iframe, page, opts.player);
        await selectSidebarTab(iframe, page, "Player Card");
      }
      await dumpActionMapsDom(iframe, page);
      logInfo("DOM 탐색 완료, 종료합니다");
      return;
    }

    if (opts.player && !opts.team) {
      // 모드 A: 글로벌 검색 (--player만 지정)
      stats.totalPlayers = 1;
      try {
        await searchPlayer(iframe, page, opts.player);
        await selectSidebarTab(iframe, page, "Player Card");
        await scrapePlayer(
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
          await scrapePlayer(
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
            // 팀 전환 전 Player Card 탭 확인 (Action Maps에서 복귀 후 stale 방지)
            await selectSidebarTab(iframe, page, "Player Card");
            await page.waitForTimeout(1000);

            await selectTeam(iframe, page, team);
            // 팀 선택 후 Player combobox 업데이트 대기
            await page.waitForTimeout(2000);
            const players = await extractPlayerList(iframe, page);
            logInfo(`  선수 ${players.length}명 발견`);
            stats.totalPlayers += players.length;

            for (let pi = 0; pi < players.length; pi++) {
              const playerName = players[pi]!;
              logProgress(pi + 1, players.length, playerName);

              try {
                await selectPlayer(iframe, page, playerName);
                await scrapePlayer(
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
            } catch (refreshError) {
              logError("페이지 복구 실패, 다음 팀으로 건너뜀", refreshError);
              continue;
            }

            // 새로고침하면 페이지가 기본 시즌으로 리셋된다. 여기서 시즌 재선택이
            // 실패한 채로 계속 돌면 남은 배치 전원이 검증 실패로 쌓여 시간을 통째로
            // 헛돈다 → 조용히 넘어가지 않고 프로세스를 종료해 러너가 감지하게 한다.
            try {
              await selectSeason(iframe, page, opts.season);
            } catch (seasonError) {
              logError(
                `복구 후 시즌(${opts.season}) 재선택 실패 — 배치를 중단합니다`,
                seasonError,
              );
              throw new FatalScraperError(
                `복구 경로 시즌 재선택 실패 (season=${opts.season}, team=${team}): ${
                  seasonError instanceof Error ? seasonError.message : "unknown"
                }`,
              );
            }

            try {
              await selectLeague(iframe, page, opts.league);
            } catch (leagueError) {
              logError(
                "복구 후 리그 재선택 실패, 다음 팀으로 건너뜀",
                leagueError,
              );
            }
          }
        }
      }
    }

    // 동기화 로그
    if (!opts.dryRun) {
      await writeSyncLog(supabase, {
        scraper: opts.actionMapsOnly
          ? "action-maps"
          : opts.similarityOnly
            ? "similarity"
            : opts.metricsOnly
              ? "metrics"
              : "player-card",
        season: opts.season,
        league: opts.league,
        status: stats.failCount === 0 ? "success" : "error",
        recordsSynced: stats.successCount,
        recordsFailed: stats.failCount,
        errorMessage: buildSyncErrorMessage(stats),
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
  if (error instanceof FatalScraperError) {
    logError("배치 중단 (복구 불가 상태) — 러너가 감지하도록 exit(1)", error);
  } else {
    logError("스크래퍼 치명적 오류", error);
  }
  process.exit(1);
});
