#!/bin/bash
# S8′06 fixup: run-s8-06-batch.sh 실행 로그를 스캔해 실패한 항목만 재수집한다.
# 반드시 메인 배치(run-s8-06-batch.sh)가 완전히 종료된 뒤에 실행할 것 — 같은 스크래퍼·
# 브라우저 패턴을 공유하므로 동시 실행 시 워치독/정리 로직이 서로의 프로세스를 오인할
# 위험이 있다.
#
# 로그(scripts/scraper/logs/s8-06-*.log, 이 스크립트 자신의 s8-06-fixup-*.log는 제외)를
# 실행 시점에 파싱해 아래 3가지 실패 유형을 자동으로 대상 목록에 편입한다:
#
#   1) 팀명 미스매치 (전체 선수: 0으로 조용히 스킵된 팀)
#      DB 팀명이 ScoutLab Club combobox 표기의 부분 문자열이 아니면(예: "Man Utd" vs
#      "Manchester United") selectTeam의 hasText 필터가 5초 내 옵션을 못 찾아 타임아웃 →
#      새로고침 → 0명 처리 후 exit=0으로 조용히 넘어간다. 프로브(2026-08-01, PL·Ligue 1·
#      Serie A Club combobox 전수 조사)로 실제 불일치 3건을 확인했고, 정정 표기는 아래
#      MISMATCH_MAP에 하드코딩한다(로그만으로는 "올바른 표기"를 알 수 없으므로 자동 유추 불가).
#        Premier League: "Man Utd"  → "Manchester United"
#        Premier League: "Wolves"   → "Wolverhampton Wanderers"
#        Ligue 1:        "Paris SG" → "Paris Saint-Germain" (드롭다운의 "Paris FC"와
#          혼동되지 않도록 축약형 대신 정식 표기를 그대로 사용)
#      나머지 26팀(La Liga 2팀 포함)은 DB 팀명이 드롭다운 표기의 부분 문자열이라 정상
#      매치되므로 미스매치 아님 (예: "Brighton"⊂"Brighton & Hove Albion",
#      "Inter"⊂"Internazionale"). 로그 자체는 "전체 선수: 0"으로 자동 식별하되, 정정
#      표기/로스터 인원은 MISMATCH_MAP에서만 가져온다.
#
#   2) 연쇄 장애 (Streamlit 다운 등으로 로스터 절반 이상 실패)
#      예: Nice — Player combobox 30초 타임아웃이 연쇄적으로 발생해 21명 중 19명 실패.
#      실패 인원이 "전체 선수" 대비 절반 이상이면 팀 전체를 원래 DB 팀명으로 재실행한다
#      (일시적 앱 다운 성격이 강해 개별 재시도보다 팀 전체 재실행이 합리적).
#
#   3) 개별 선수 실패 (로스터 절반 미만, 소수만 실패)
#      예: Toulouse 19명 중 6명, Nantes 22명 중 6명 — "본인 포지션 감지 → P90 segmented
#      control 10초 타임아웃" 패턴으로 추정(출전시간 적은 선수는 카드 자체가 안 그려질 수
#      있음). main.ts는 --player를 지원한다(단독 사용 시 전역 검색 모드 A, --team과 병용
#      시 팀 로스터 모드 B). 이 fixup은 원래 실패가 발생한 것과 동일한 컨텍스트(팀 로스터
#      페이지)에서 재현하기 위해 모드 B(--league --team --player)를 쓴다 — 실패 선수명은
#      로그의 "실패 선수:" 줄에서 그대로 가져오는데, 이 문자열은 ScoutLab Player combobox의
#      extractPlayerList로 추출된 정확한 표기(악센트 포함)라 hasText 필터와 그대로 매치된다.
#      전역 검색 모드(A)도 대안이 될 수 있으나, 원인이 팀 선택과 무관한 개별 카드 렌더링
#      문제로 보여 원래 컨텍스트를 보존하는 모드 B로 통일했다.
#
# 사용법: ./scripts/scraper/run-s8-06-fixup.sh [--dry-run]
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 1

SEASON="25/26"
SEC_PER_PLAYER=60      # 실측 로그(scoutlab_sync_logs, scraper='player-card') 기준 선수당 평균
SAFETY_MULTIPLIER=2    # 여유 2배
WATCHDOG_FLOOR_SECS=600 # 최소 워치독 (선수 1명짜리 재시도도 네트워크 지연 대비 10분 확보)
WATCHDOG_POLL_SECS=10
LOG_DIR="scripts/scraper/logs"
mkdir -p "$LOG_DIR"

# 정리 대상 패턴 (이 저장소 스크래퍼 전용으로 좁힌 값 — run-s8-06-batch.sh와 동일)
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

# 팀명 미스매치 정정 테이블: "리그|DB팀명|드롭다운 정정 표기|로스터인원"
# (로스터 인원은 run-s8-06-batch.sh TEAMS의 원래 값 그대로 — 미스매치 팀은
#  "전체 선수: 0"으로 로그에 남아 인원을 로그에서 알 수 없다)
MISMATCH_MAP=(
  "Premier League|Man Utd|Manchester United|19"
  "Premier League|Wolves|Wolverhampton Wanderers|20"
  "Ligue 1|Paris SG|Paris Saint-Germain|20"
)

# ANSI 컬러 코드 제거
strip_ansi() {
  sed -E $'s/\x1b\\[[0-9;]*m//g'
}

# 문자열 슬러그화 (로그 파일명용) — 소문자화 + 공백/특수문자를 하이픈으로
slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g'
}

# 앞뒤 공백 제거
trim() {
  sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//'
}

# 미스매치 테이블에서 "리그|DB팀명" 매치 시 "정정표기|로스터"를 echo (없으면 빈 문자열)
lookup_mismatch() {
  local league="$1"
  local team="$2"
  local entry e_league e_team e_fixed e_roster
  for entry in "${MISMATCH_MAP[@]}"; do
    IFS='|' read -r e_league e_team e_fixed e_roster <<<"$entry"
    if [[ "$e_league" == "$league" && "$e_team" == "$team" ]]; then
      echo "${e_fixed}|${e_roster}"
      return 0
    fi
  done
  echo ""
}

# ACTIONS: "team|리그|스크랩용팀명||로스터|로그슬러그" 또는
#          "player|리그|DB팀명|선수명|1|로그슬러그"
ACTIONS=()

echo "=== [$(date '+%F %T')] 로그 스캔 시작 (${LOG_DIR}/s8-06-*.log, fixup 자신의 로그 제외)"

for LOGFILE in "$LOG_DIR"/s8-06-*.log; do
  [[ -e "$LOGFILE" ]] || continue
  case "$(basename "$LOGFILE")" in
    s8-06-fixup-*) continue ;;
  esac

  SETTINGS_LINE=$(grep -a "설정:" "$LOGFILE" | strip_ansi | tail -1)
  if [[ -z "$SETTINGS_LINE" ]]; then
    echo "  [스킵] $(basename "$LOGFILE") — 설정 라인 없음(로그 형식 이상)"
    continue
  fi
  LEAGUE=$(echo "$SETTINGS_LINE" | sed -E 's/.*league=([^,]+), team=.*/\1/')
  DB_TEAM=$(echo "$SETTINGS_LINE" | sed -E 's/.*team=([^,]+), player=.*/\1/')

  TOTAL_LINE=$(grep -a "전체 선수:" "$LOGFILE" | strip_ansi | tail -1)
  if [[ -z "$TOTAL_LINE" ]]; then
    echo "  [스킵] ${LEAGUE}/${DB_TEAM} — 아직 배치 진행 중(요약 없음), 이번 fixup 대상 아님"
    continue
  fi
  TOTAL=$(echo "$TOTAL_LINE" | sed -E 's/.*전체 선수: ([0-9]+).*/\1/')

  MISMATCH=$(lookup_mismatch "$LEAGUE" "$DB_TEAM")
  if [[ -n "$MISMATCH" ]]; then
    FIXED_TEAM="${MISMATCH%%|*}"
    ROSTER="${MISMATCH##*|}"
    SLUG=$(slugify "$FIXED_TEAM")
    echo "  [팀명 미스매치] ${LEAGUE}/${DB_TEAM} → ${FIXED_TEAM} (로스터 ${ROSTER}명)"
    ACTIONS+=("team|${LEAGUE}|${FIXED_TEAM}||${ROSTER}|${SLUG}")
    continue
  fi

  FAIL_LINE=$(grep -a "실패:" "$LOGFILE" | strip_ansi | tail -1)
  FAIL=$(echo "$FAIL_LINE" | sed -E 's/.*실패: ([0-9]+).*/\1/')
  if [[ -z "$FAIL" || "$FAIL" -eq 0 ]]; then
    continue
  fi

  # 실패 인원이 로스터 절반 이상 → 연쇄 장애로 간주, 팀 전체 재실행
  if (( FAIL * 2 >= TOTAL )); then
    SLUG=$(slugify "$DB_TEAM")
    echo "  [연쇄 장애] ${LEAGUE}/${DB_TEAM} — ${FAIL}/${TOTAL}명 실패 → 팀 전체 재실행"
    ACTIONS+=("team|${LEAGUE}|${DB_TEAM}||${TOTAL}|${SLUG}")
    continue
  fi

  # 소수 실패 → 실패 선수만 개별 재실행
  FAILED_LIST=$(grep -a "실패 선수:" "$LOGFILE" | strip_ansi | tail -1 | sed -E 's/.*실패 선수: //')
  if [[ -z "$FAILED_LIST" ]]; then
    echo "  [경고] ${LEAGUE}/${DB_TEAM} — 실패 ${FAIL}명인데 '실패 선수:' 목록을 못 찾음, 팀 전체로 대체"
    SLUG=$(slugify "$DB_TEAM")
    ACTIONS+=("team|${LEAGUE}|${DB_TEAM}||${TOTAL}|${SLUG}")
    continue
  fi

  echo "  [개별 선수 실패] ${LEAGUE}/${DB_TEAM} — ${FAIL}/${TOTAL}명"
  TEAM_SLUG=$(slugify "$DB_TEAM")
  IFS=',' read -ra PLAYERS <<<"$FAILED_LIST"
  for RAW_NAME in "${PLAYERS[@]}"; do
    PLAYER=$(echo "$RAW_NAME" | trim)
    [[ -z "$PLAYER" ]] && continue
    PLAYER_SLUG=$(slugify "$PLAYER")
    echo "    - ${PLAYER}"
    ACTIONS+=("player|${LEAGUE}|${DB_TEAM}|${PLAYER}|1|${TEAM_SLUG}-${PLAYER_SLUG}")
  done
done

TOTAL_ACTIONS=${#ACTIONS[@]}
echo "=== [$(date '+%F %T')] 로그 스캔 완료 — 재수집 대상 ${TOTAL_ACTIONS}건"

if [[ $TOTAL_ACTIONS -eq 0 ]]; then
  echo "=== [$(date '+%F %T')] 재수집할 대상이 없습니다. 종료."
  exit 0
fi

for i in "${!ACTIONS[@]}"; do
  IFS='|' read -r TYPE LEAGUE TEAM PLAYER ROSTER LOGSLUG <<<"${ACTIONS[$i]}"
  LOG_FILE="$LOG_DIR/s8-06-fixup-${LOGSLUG}.log"
  WATCHDOG_SECS=$((ROSTER * SEC_PER_PLAYER * SAFETY_MULTIPLIER))
  if [[ $WATCHDOG_SECS -lt $WATCHDOG_FLOOR_SECS ]]; then
    WATCHDOG_SECS=$WATCHDOG_FLOOR_SECS
  fi

  if [[ "$TYPE" == "team" ]]; then
    CMD_DESC="팀 전체: ${LEAGUE} / ${TEAM} (로스터 ${ROSTER}명)"
    CMD_ARGS=(--league="${LEAGUE}" --team="${TEAM}" --season="${SEASON}" --metrics-only --match-position)
  else
    CMD_DESC="개별 선수: ${LEAGUE} / ${TEAM} / ${PLAYER}"
    CMD_ARGS=(--league="${LEAGUE}" --team="${TEAM}" --player="${PLAYER}" --season="${SEASON}" --metrics-only --match-position)
  fi

  echo "=== [$(date '+%F %T')] [$((i + 1))/${TOTAL_ACTIONS}] ${CMD_DESC} (워치독 ${WATCHDOG_SECS}s) → ${LOG_FILE}"

  if $DRY_RUN; then
    PRINTABLE=""
    for ARG in "${CMD_ARGS[@]}"; do
      PRINTABLE="${PRINTABLE} \"${ARG}\""
    done
    echo "(dry-run) npm run scrape:scoutlab --${PRINTABLE}"
    continue
  fi

  npm run scrape:scoutlab -- "${CMD_ARGS[@]}" >>"$LOG_FILE" 2>&1 &
  PID=$!
  (
    ELAPSED=0
    while [[ $ELAPSED -lt $WATCHDOG_SECS ]]; do
      kill -0 "$PID" 2>/dev/null || exit 0
      sleep "$WATCHDOG_POLL_SECS"
      ELAPSED=$((ELAPSED + WATCHDOG_POLL_SECS))
    done
    if kill -0 "$PID" 2>/dev/null; then
      echo "[watchdog] ${CMD_DESC} ${WATCHDOG_SECS}s 초과 — 강제 종료" | tee -a "$LOG_FILE"
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
  echo "=== [$(date '+%F %T')] ${CMD_DESC} 종료 (exit=${STATUS})"
done

echo "=== [$(date '+%F %T')] S8′06 fixup 전체 완료"
