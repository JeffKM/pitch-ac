#!/bin/bash
# S8′01: Action Maps 4개 리그 순차 수집 러너
# 사용법: ./scripts/scraper/run-action-maps-batch.sh [--dry-run] ["La Liga" "Serie A" ...]
#   인자 없으면 La Liga → Serie A → Bundesliga → Ligue 1 순서로 전체 실행
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 1

SEASON="25/26"
WATCHDOG_SECS=$((10 * 3600)) # 리그당 최대 10시간 (최대 리그 La Liga 391명 × ~90초 ≈ 9.8h 상한)
WATCHDOG_POLL_SECS=10        # 워치독은 짧게 나눠 대기 — 스크래퍼 종료 즉시 워치독도 자체 종료(잔존 sleep 방지)
LOG_DIR="scripts/scraper/logs"
mkdir -p "$LOG_DIR"

# 정리 대상 패턴 (이 저장소 스크래퍼 전용으로 좁힌 값)
#  - SCRAPER_PATTERN: tsx가 실행하는 스크래퍼 엔트리포인트
#  - BROWSER_PATTERN: Playwright 번들 브라우저 경로. 뒤의 슬래시가 중요하다 —
#    Playwright MCP 서버는 `~/Library/Caches/ms-playwright-mcp/mcp-chrome-*`를
#    user-data-dir로 쓰므로 "ms-playwright"만으로는 무관한 MCP 브라우저까지 매칭된다.
#    "ms-playwright/chromium"은 MCP의 "ms-playwright-mcp/"와 겹치지 않는다.
SCRAPER_PATTERN="scripts/scraper/main.ts"
BROWSER_PATTERN="ms-playwright/chromium"

# 스크립트 시작 시점에 이미 떠 있던 프로세스 = 우리가 띄운 게 아니므로 절대 종료하지 않는다.
# (패턴이 넓어지는 최악의 경우에도 남의 세션을 죽이지 않기 위한 2차 안전장치)
PRE_EXISTING_PIDS=" $( { pgrep -f "$SCRAPER_PATTERN"; pgrep -f "$BROWSER_PATTERN"; } 2>/dev/null | tr '\n' ' ') "

# 패턴에 매칭되면서 "스크립트 시작 후에 새로 생긴" 프로세스만 종료
kill_ours() {
  local sig="$1"
  local pattern="$2"
  local pid
  local killed=0
  for pid in $(pgrep -f "$pattern" 2>/dev/null); do
    [[ "$pid" == "$$" ]] && continue
    case "$PRE_EXISTING_PIDS" in
      *" $pid "*) continue ;;
    esac
    kill "$sig" "$pid" 2>/dev/null && killed=$((killed + 1))
  done
  [[ $killed -gt 0 ]]
}

cleanup_children() {
  # 이 스크립트가 시작한 스크래퍼·브라우저 잔존 프로세스만 정리
  # (사용자 브라우저 및 별도 Playwright MCP 세션은 건드리지 않음)
  local terminated=1
  kill_ours -TERM "$SCRAPER_PATTERN" && terminated=0
  kill_ours -TERM "$BROWSER_PATTERN" && terminated=0
  if [[ $terminated -eq 0 ]]; then
    sleep 2 # graceful 종료 대기 후 잔존분만 강제 종료
    kill_ours -KILL "$SCRAPER_PATTERN"
    kill_ours -KILL "$BROWSER_PATTERN"
  fi
}
trap cleanup_children EXIT

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  shift
fi

if [[ $# -gt 0 ]]; then
  LEAGUES=("$@")
else
  LEAGUES=("La Liga" "Serie A" "Bundesliga" "Ligue 1")
fi

for LEAGUE in "${LEAGUES[@]}"; do
  SLUG=$(echo "$LEAGUE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  LOG_FILE="$LOG_DIR/s8-01-${SLUG}.log"
  echo "=== [$(date '+%F %T')] ${LEAGUE} 수집 시작 → ${LOG_FILE}"

  if $DRY_RUN; then
    echo "(dry-run) npm run scrape:scoutlab -- --league=\"${LEAGUE}\" --season=\"${SEASON}\" --action-maps-only"
    continue
  fi

  npm run scrape:scoutlab -- --league="${LEAGUE}" --season="${SEASON}" --action-maps-only >>"$LOG_FILE" 2>&1 &
  PID=$!
  (
    ELAPSED=0
    while [[ $ELAPSED -lt $WATCHDOG_SECS ]]; do
      kill -0 "$PID" 2>/dev/null || exit 0 # 스크래퍼가 끝나면 워치독도 즉시 종료
      sleep "$WATCHDOG_POLL_SECS"
      ELAPSED=$((ELAPSED + WATCHDOG_POLL_SECS))
    done
    if kill -0 "$PID" 2>/dev/null; then
      echo "[watchdog] ${LEAGUE} ${WATCHDOG_SECS}s 초과 — 강제 종료" | tee -a "$LOG_FILE"
      kill -9 "$PID" 2>/dev/null
      kill_ours -KILL "$SCRAPER_PATTERN"
      kill_ours -KILL "$BROWSER_PATTERN"
    fi
  ) &
  WD=$!
  wait "$PID"
  STATUS=$?
  kill "$WD" 2>/dev/null
  wait "$WD" 2>/dev/null
  pkill -P "$WD" 2>/dev/null # 혹시 남은 워치독 자식(sleep) 정리 — 최대 WATCHDOG_POLL_SECS 후 자동 종료됨
  echo "=== [$(date '+%F %T')] ${LEAGUE} 종료 (exit=${STATUS})"
done

echo "=== [$(date '+%F %T')] 전체 배치 완료"
