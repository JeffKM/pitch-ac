// 콘솔 프로그레스 출력 유틸리티

import type { ScrapeStats } from "./types";

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
} as const;

export function logInfo(msg: string): void {
  console.log(`${COLORS.cyan}[INFO]${COLORS.reset} ${msg}`);
}

export function logSuccess(msg: string): void {
  console.log(`${COLORS.green}[OK]${COLORS.reset} ${msg}`);
}

export function logWarn(msg: string): void {
  console.log(`${COLORS.yellow}[WARN]${COLORS.reset} ${msg}`);
}

export function logError(msg: string, error?: unknown): void {
  console.error(`${COLORS.red}[ERROR]${COLORS.reset} ${msg}`);
  if (error instanceof Error) {
    console.error(`${COLORS.dim}  ${error.message}${COLORS.reset}`);
  }
}

export function logProgress(
  current: number,
  total: number,
  label: string,
): void {
  const pct = Math.round((current / total) * 100);
  const bar =
    "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
  process.stdout.write(
    `\r${COLORS.cyan}[${bar}]${COLORS.reset} ${pct}% (${current}/${total}) ${label}`,
  );
  if (current === total) process.stdout.write("\n");
}

export function logSummary(stats: ScrapeStats): void {
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  console.log("\n" + "=".repeat(50));
  console.log(`${COLORS.cyan}스크래핑 결과 요약${COLORS.reset}`);
  console.log("=".repeat(50));
  console.log(`전체 선수: ${stats.totalPlayers}`);
  console.log(`${COLORS.green}성공: ${stats.successCount}${COLORS.reset}`);
  console.log(`${COLORS.red}실패: ${stats.failCount}${COLORS.reset}`);
  if (stats.failedPlayers.length > 0) {
    console.log(`실패 선수: ${stats.failedPlayers.join(", ")}`);
  }
  console.log(`소요 시간: ${duration}s`);
  console.log("=".repeat(50));
}
