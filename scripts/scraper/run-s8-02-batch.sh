#!/bin/bash
# S8′02: 24/25 시즌 PL(Premier League) 20팀 전체 스크래핑 배치 러너
#
# 배경: run-s8-06-batch.sh(메트릭만)·run-action-maps-batch.sh(Action Maps만)와 달리
#       이 배치는 "메트릭 + Action Maps + Similarity"를 전부 수집한다(--metrics-only /
#       --action-maps-only 둘 다 사용하지 않음 — main.ts 기본 동작이 전체 수집).
#       단, 포지션 축은 기존 1,519명 메트릭 수집과 동일한 방식(--match-position: 선수
#       본인 포지션 1개만 사용)을 계승한다. 전체 5개 포지션을 다 돌면 mode×adj×position
#       = 2×2×5 = 20콤보로 선수당 소요가 5배 가까이 뛰어 8시간 예산을 크게 초과한다.
#       --match-position는 "수집 범위(메트릭/맵)"가 아니라 "포지션 비교 축의 개수"를
#       좁히는 옵션이라 "둘 다 전체 수집" 요구사항과 배치되지 않는다.
#
# 실측 소요(요청 사양): 선수당 약 78초(메트릭 55.6s + Action Maps 22.1s), PL 372명
# 기준 약 8시간. 이 수치 자체가 --match-position 기준 실측이므로 그대로 유지한다.
#
# SEASON 하드코딩 금지: 기존 러너들(run-action-maps-batch.sh, run-s8-06-batch.sh/-fixup.sh)은
# SEASON="25/26"을 하드코딩하고 있어 이 스크립트를 베이스로 복제할 때 그대로 두면 조용히
# 25/26을 재수집하며 8시간을 낭비한다. 여기서는 환경변수 SEASON 또는 --season= 인자로
# 받되 기본값만 24/25로 둔다.
#
# 사용법:
#   ./scripts/scraper/run-s8-02-batch.sh                       # PL 20팀 전체 순차 수집
#   ./scripts/scraper/run-s8-02-batch.sh --dry-run             # 실행할 커맨드만 출력
#   ./scripts/scraper/run-s8-02-batch.sh --teams=Bournemouth    # 파일럿: 1팀만 실제 수집
#   ./scripts/scraper/run-s8-02-batch.sh --teams="Bournemouth,Brentford"
#   SEASON=24/25 ./scripts/scraper/run-s8-02-batch.sh          # 시즌 명시(기본값과 동일)
#   ./scripts/scraper/run-s8-02-batch.sh --reset               # 완료 마커 초기화 후 전체 재실행
#
# 재개(resume): 8시간 배치가 중단될 수 있으므로 팀별 완료 마커 파일을 사용한다
# (scripts/scraper/logs/.s8-02-state/<team-slug>.done). 스크래퍼 프로세스가 exit=0으로
# 정상 종료한 팀만 마커를 남기고, 다음 실행 시 마커가 있는 팀은 건너뛴다. 팀 내부의
# 개별 선수 실패는 exit=0인 채로 로그에만 남으므로(main.ts는 부분 실패에도 exit 0) 이건
# run-s8-02-fixup.sh가 로그를 파싱해 재수집한다 — 마커는 "이 팀을 다시 통째로 돌 필요는
# 없다"만 의미한다. 워치독에 강제 종료된 팀은 마커를 남기지 않아 다음 실행 시 팀 전체를
# 재시도한다(팀 전체 재수집은 upsert라 안전 — run-s8-06-batch.sh와 동일 전제).
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 1

LOG_DIR="scripts/scraper/logs"
STATE_DIR="$LOG_DIR/.s8-02-state"
mkdir -p "$LOG_DIR" "$STATE_DIR"

SEASON="${SEASON:-24/25}"
SEC_PER_PLAYER=78       # 실측치: 메트릭(--match-position) 55.6s + Action Maps 22.1s
SAFETY_MULTIPLIER=2     # 기존 러너와 동일한 여유 배수
WATCHDOG_FLOOR_SECS=900 # 최소 워치독 15분 — 메트릭+Action Maps 둘 다라 s8-06(10분)보다 상향
WATCHDOG_POLL_SECS=10
DRY_RUN=false
RESET=false
TEAMS_OVERRIDE=""

# 정리 대상 패턴 (이 저장소 스크래퍼 전용으로 좁힌 값 — 기존 3개 러너와 동일)
#  - BROWSER_PATTERN 뒤의 슬래시가 중요하다: Playwright MCP 서버는
#    "ms-playwright-mcp/mcp-chrome-*"를 user-data-dir로 쓰므로 "ms-playwright"만으로는
#    무관한 MCP 브라우저까지 매칭된다. "ms-playwright/chromium"은 겹치지 않는다.
SCRAPER_PATTERN="scripts/scraper/main.ts"
BROWSER_PATTERN="ms-playwright/chromium"

# 중복 실행 가드: 이 스크립트가 뭔가 하기 전에 이미 스크래퍼가 떠 있으면 시작 자체를 거부한다.
# (동시 실행은 워치독/정리 로직이 서로의 프로세스를 오인하는 경합·좀비의 흔한 원인)
if pgrep -f "$SCRAPER_PATTERN" >/dev/null 2>&1; then
  echo "ERROR: 이미 실행 중인 스크래퍼 프로세스가 있어 시작을 거부합니다 (패턴: ${SCRAPER_PATTERN})" >&2
  pgrep -fl "$SCRAPER_PATTERN" >&2
  echo "        해당 프로세스가 남의 세션이 아니라면 종료 후 다시 실행하세요." >&2
  exit 1
fi

# 스크립트 시작 시점에 이미 떠 있던 프로세스는 절대 종료하지 않는다 (2차 안전장치 — 위 가드를
# 통과했다면 보통 비어 있지만, 가드와 이 배열 캡처 사이의 극히 짧은 창을 대비해 유지)
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

for ARG in "$@"; do
  case "$ARG" in
    --dry-run) DRY_RUN=true ;;
    --reset) RESET=true ;;
    --season=*) SEASON="${ARG#*=}" ;;
    --teams=*) TEAMS_OVERRIDE="${ARG#*=}" ;;
    *)
      echo "ERROR: 알 수 없는 인자: ${ARG}" >&2
      echo "사용법: $0 [--dry-run] [--reset] [--season=24/25] [--teams=\"Bournemouth,Brentford\"]" >&2
      exit 1
      ;;
  esac
done

# 문자열 슬러그화 (로그·마커 파일명용) — 소문자화 + 공백/특수문자를 하이픈으로
slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g'
}

if $RESET; then
  echo "=== [$(date '+%F %T')] --reset 지정 — 완료 마커 전체 초기화 (${STATE_DIR})"
  rm -f "$STATE_DIR"/*.done
fi

# PL 24/25 20팀 | 로스터 추정치(팀명|로스터).
# 로스터 인원은 DB에 24/25 시즌 데이터가 아직 없어(scoutlab_players 0건, 이 배치가 최초
# 수집) 25/26 시즌 동일 클럽 로스터 실측치를 근사값으로 사용했다(scoutlab_players,
# league='Premier League', season='25/26' 기준). 25/26에 없는 3개 클럽(24/25 시즌 후
# 강등: Ipswich Town/Leicester City/Southampton)은 리그 평균에 준하는 20명으로 추정했다.
# 워치독 산정용 상한이라 정확한 로스터 수와 다소 어긋나도 안전 배수(×2)가 흡수한다.
#
# 팀명은 main.ts의 selectTeam()이 ScoutLab "Club" 콤보박스를 hasText(부분 문자열)로
# 찾으므로, 실제 드롭다운 표기를 포함하지 않는 축약형(Man Utd/Man City/Nottm Forest/
# Spurs/Wolves)은 정식 클럽명으로 풀어썼다 — run-s8-06-fixup.sh가 25/26에서 확인한
# "Man Utd"→"Manchester United", "Wolves"→"Wolverhampton Wanderers" 미스매치와 같은
# 유형의 실패를 애초에 피하기 위함. Bournemouth/Brighton/Newcastle/West Ham처럼 축약형이
# 정식명의 부분 문자열로 그대로 포함되는 경우(예: "Brighton"⊂"Brighton & Hove Albion")는
# 축약형을 유지했다.
TEAMS=(
  "Brentford|15"
  "Bournemouth|17"
  "Everton|17"
  "Liverpool|17"
  "Brighton & Hove Albion|18"
  "Crystal Palace|18"
  "West Ham United|18"
  "Arsenal|19"
  "Chelsea|19"
  "Manchester City|19"
  "Manchester United|19"
  "Nottingham Forest|19"
  "Aston Villa|20"
  "Fulham|20"
  "Ipswich Town|20"
  "Leicester City|20"
  "Newcastle United|20"
  "Southampton|20"
  "Wolverhampton Wanderers|20"
  "Tottenham Hotspur|21"
)

if [[ -n "$TEAMS_OVERRIDE" ]]; then
  FILTERED=()
  IFS=',' read -ra WANTED <<<"$TEAMS_OVERRIDE"
  for W in "${WANTED[@]}"; do
    WANTED_TRIMMED=$(echo "$W" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')
    MATCHED=false
    for ENTRY in "${TEAMS[@]}"; do
      ENTRY_TEAM="${ENTRY%%|*}"
      if [[ "$ENTRY_TEAM" == "$WANTED_TRIMMED" ]]; then
        FILTERED+=("$ENTRY")
        MATCHED=true
        break
      fi
    done
    if ! $MATCHED; then
      echo "ERROR: --teams에 지정한 \"${WANTED_TRIMMED}\"이 TEAMS 목록에 없습니다 (정확한 표기 확인 필요)" >&2
      exit 1
    fi
  done
  TEAMS=("${FILTERED[@]}")
fi

TOTAL=${#TEAMS[@]}
echo "=== [$(date '+%F %T')] S8′02 PL 24/25 배치 시작 (${TOTAL}개 팀, season=${SEASON}, dry-run=${DRY_RUN})"

for i in "${!TEAMS[@]}"; do
  IFS='|' read -r TEAM ROSTER <<<"${TEAMS[$i]}"
  SLUG=$(slugify "$TEAM")
  LOG_FILE="$LOG_DIR/s8-02-${SLUG}.log"
  MARKER="$STATE_DIR/${SLUG}.done"

  if [[ -f "$MARKER" ]]; then
    echo "=== [$(date '+%F %T')] [$((i + 1))/${TOTAL}] ${TEAM} — 완료 마커 발견, 스킵 (재수집하려면 --reset 또는 마커 삭제)"
    continue
  fi

  WATCHDOG_SECS=$((ROSTER * SEC_PER_PLAYER * SAFETY_MULTIPLIER))
  if [[ $WATCHDOG_SECS -lt $WATCHDOG_FLOOR_SECS ]]; then
    WATCHDOG_SECS=$WATCHDOG_FLOOR_SECS
  fi

  echo "=== [$(date '+%F %T')] [$((i + 1))/${TOTAL}] Premier League / ${TEAM} (로스터 추정 ${ROSTER}명, 워치독 ${WATCHDOG_SECS}s) → ${LOG_FILE}"

  if $DRY_RUN; then
    echo "(dry-run) npm run scrape:scoutlab -- --league=\"Premier League\" --team=\"${TEAM}\" --season=\"${SEASON}\" --match-position"
    continue
  fi

  npm run scrape:scoutlab -- --league="Premier League" --team="${TEAM}" --season="${SEASON}" --match-position >>"$LOG_FILE" 2>&1 &
  PID=$!
  (
    ELAPSED=0
    while [[ $ELAPSED -lt $WATCHDOG_SECS ]]; do
      kill -0 "$PID" 2>/dev/null || exit 0
      sleep "$WATCHDOG_POLL_SECS"
      ELAPSED=$((ELAPSED + WATCHDOG_POLL_SECS))
    done
    if kill -0 "$PID" 2>/dev/null; then
      echo "[watchdog] Premier League/${TEAM} ${WATCHDOG_SECS}s 초과 — 강제 종료" | tee -a "$LOG_FILE"
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
  echo "=== [$(date '+%F %T')] Premier League/${TEAM} 종료 (exit=${STATUS})"

  if [[ $STATUS -eq 0 ]]; then
    touch "$MARKER"
  else
    echo "    (마커 생성 안 함 — 워치독 강제 종료 또는 비정상 종료로 추정, 다음 실행 시 팀 전체 재시도)"
  fi
done

echo "=== [$(date '+%F %T')] S8′02 배치 전체 완료"
