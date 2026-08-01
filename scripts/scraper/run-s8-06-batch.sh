#!/bin/bash
# S8′06: 메트릭 갭 보충 배치 러너
# 배경: S8′01 Action Maps 수집 중 과거 player-card(메트릭) 수집이 Serie A 7/20팀에서
#       중단돼 있었던 사실이 드러남 → Action Maps는 있는데 25/26 메트릭·Similarity가
#       없는 선수가 4개 리그(La Liga/Ligue 1/Premier League/Serie A) 29개 팀 363명 존재.
#       (Bundesliga는 갭 0명으로 대상에서 제외)
# 방식: 팀 단위로 --metrics-only --match-position 재수집 (upsert라 팀 전체 재수집도 안전,
#       팀 내 갭 없는 선수까지 겹쳐 쓰지만 인원 필터링은 과도한 구현이라 생략)
#       --metrics-only: Action Maps 탭 이동·Vision OCR을 스킵하고 메트릭+Similarity만 수집
#       --match-position: 선수 본인 포지션 1개만 사용 (기존 1,519명 메트릭도 이 방식으로 수집됨,
#         scoutlab_sync_logs 실측 로그 기준 선수당 4-combo(mode×adjustment) ≈ 55~60초)
#
# 사용법: ./scripts/scraper/run-s8-06-batch.sh [--dry-run]
#   인자 없이 실행하면 아래 TEAMS 전체를 리그→팀 순으로 순차 수집한다.
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 1

SEASON="25/26"
SEC_PER_PLAYER=60      # 실측 로그(scoutlab_sync_logs, scraper='player-card') 기준 선수당 평균
SAFETY_MULTIPLIER=2    # 여유 2배
WATCHDOG_FLOOR_SECS=600 # 최소 워치독 (작은 팀도 네트워크 지연 대비 10분 확보)
WATCHDOG_POLL_SECS=10
LOG_DIR="scripts/scraper/logs"
mkdir -p "$LOG_DIR"

# 정리 대상 패턴 (이 저장소 스크래퍼 전용으로 좁힌 값 — S8′01과 동일)
#  - BROWSER_PATTERN 뒤의 슬래시가 중요하다: Playwright MCP 서버는
#    "ms-playwright-mcp/mcp-chrome-*"를 user-data-dir로 쓰므로 "ms-playwright"만으로는
#    무관한 MCP 브라우저까지 매칭된다. "ms-playwright/chromium"은 겹치지 않는다.
SCRAPER_PATTERN="scripts/scraper/main.ts"
BROWSER_PATTERN="ms-playwright/chromium"

# 스크립트 시작 시점에 이미 떠 있던 프로세스는 절대 종료하지 않는다 (2차 안전장치)
PRE_EXISTING_PIDS=" $( { pgrep -f "$SCRAPER_PATTERN"; pgrep -f "$BROWSER_PATTERN"; } 2>/dev/null | tr '\n' ' ') "

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
  local terminated=1
  kill_ours -TERM "$SCRAPER_PATTERN" && terminated=0
  kill_ours -TERM "$BROWSER_PATTERN" && terminated=0
  if [[ $terminated -eq 0 ]]; then
    sleep 2
    kill_ours -KILL "$SCRAPER_PATTERN"
    kill_ours -KILL "$BROWSER_PATTERN"
  fi
}
trap cleanup_children EXIT

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# "리그|팀|로스터인원" — 리그→(대상 인원 오름차순)→팀명 순.
# 로스터 인원은 scoutlab_players(season=25/26) 실측치 — 워치독 산정용.
TEAMS=(
  "La Liga|Getafe|18"
  "La Liga|Rayo|20"
  "Premier League|Brighton|18"
  "Premier League|Man Utd|19"
  "Premier League|Aston Villa|20"
  "Premier League|Wolves|20"
  "Ligue 1|Rennes|19"
  "Ligue 1|Strasbourg|19"
  "Ligue 1|Toulouse|19"
  "Ligue 1|Nice|20"
  "Ligue 1|Paris SG|20"
  "Ligue 1|Nantes|22"
  "Serie A|Udinese|17"
  "Serie A|Genoa|18"
  "Serie A|Juventus|18"
  "Serie A|Sassuolo|18"
  "Serie A|Milan|19"
  "Serie A|Roma|19"
  "Serie A|Como|20"
  "Serie A|Cremonese|20"
  "Serie A|Inter|20"
  "Serie A|Lecce|20"
  "Serie A|Verona|20"
  "Serie A|Napoli|21"
  "Serie A|Parma|21"
  "Serie A|Torino|21"
  "Serie A|Bologna|22"
  "Serie A|Pisa|22"
  "Serie A|Lazio|24"
)

TOTAL=${#TEAMS[@]}
echo "=== [$(date '+%F %T')] S8′06 메트릭 갭 보충 배치 시작 (${TOTAL}개 팀, dry-run=${DRY_RUN})"

for i in "${!TEAMS[@]}"; do
  IFS='|' read -r LEAGUE TEAM ROSTER <<<"${TEAMS[$i]}"
  SLUG=$(echo "$TEAM" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  LOG_FILE="$LOG_DIR/s8-06-${SLUG}.log"
  WATCHDOG_SECS=$((ROSTER * SEC_PER_PLAYER * SAFETY_MULTIPLIER))
  if [[ $WATCHDOG_SECS -lt $WATCHDOG_FLOOR_SECS ]]; then
    WATCHDOG_SECS=$WATCHDOG_FLOOR_SECS
  fi

  echo "=== [$(date '+%F %T')] [$((i + 1))/${TOTAL}] ${LEAGUE} / ${TEAM} (로스터 ${ROSTER}명, 워치독 ${WATCHDOG_SECS}s) → ${LOG_FILE}"

  if $DRY_RUN; then
    echo "(dry-run) npm run scrape:scoutlab -- --league=\"${LEAGUE}\" --team=\"${TEAM}\" --season=\"${SEASON}\" --metrics-only --match-position"
    continue
  fi

  npm run scrape:scoutlab -- --league="${LEAGUE}" --team="${TEAM}" --season="${SEASON}" --metrics-only --match-position >>"$LOG_FILE" 2>&1 &
  PID=$!
  (
    ELAPSED=0
    while [[ $ELAPSED -lt $WATCHDOG_SECS ]]; do
      kill -0 "$PID" 2>/dev/null || exit 0
      sleep "$WATCHDOG_POLL_SECS"
      ELAPSED=$((ELAPSED + WATCHDOG_POLL_SECS))
    done
    if kill -0 "$PID" 2>/dev/null; then
      echo "[watchdog] ${LEAGUE}/${TEAM} ${WATCHDOG_SECS}s 초과 — 강제 종료" | tee -a "$LOG_FILE"
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
  pkill -P "$WD" 2>/dev/null
  echo "=== [$(date '+%F %T')] ${LEAGUE}/${TEAM} 종료 (exit=${STATUS})"
done

echo "=== [$(date '+%F %T')] S8′06 배치 전체 완료"
