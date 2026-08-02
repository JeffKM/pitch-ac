#!/bin/bash
# S8′02 fixup: run-s8-02-batch.sh 실행 로그를 스캔해 실패한 항목만 재수집한다.
# 반드시 메인 배치(run-s8-02-batch.sh)가 완전히 종료된 뒤에 실행할 것 — 같은 스크래퍼·
# 브라우저 패턴을 공유하므로 동시 실행 시 워치독/정리 로직이 서로의 프로세스를 오인할
# 위험이 있다(중복 실행 가드가 이를 막아준다 — 아래 참고).
#
# 로그(scripts/scraper/logs/s8-02-*.log, 이 스크립트 자신의 s8-02-fixup-*.log는 제외)를
# 실행 시점에 파싱해 run-s8-06-fixup.sh와 동일한 3가지 실패 유형을 자동으로 대상 목록에
# 편입한다:
#
#   1) 팀명 미스매치 (전체 선수: 0으로 조용히 스킵된 팀)
#      run-s8-02-batch.sh의 TEAMS 목록은 이미 "Man Utd"→"Manchester United",
#      "Wolves"→"Wolverhampton Wanderers" 같은 축약형→정식명 교훈(run-s8-06-fixup.sh
#      MISMATCH_MAP 참고)을 반영해 정식 클럽명으로 구성했으므로, 정상적이라면 이 유형은
#      발생하지 않아야 한다. 그럼에도 ScoutLab Club 콤보박스 표기가 예상과 다를 가능성에
#      대비해 감지 로직은 유지한다 — 다만 "올바른 표기"를 로그만으로는 알 수 없으므로
#      MISMATCH_MAP은 기본적으로 비워두고, 감지되면 경고만 출력한 뒤 스킵한다(자동 재시도
#      불가 — 실제 ScoutLab Club 콤보박스를 확인해 MISMATCH_MAP에 수동으로 추가할 것).
#
#   2) 연쇄 장애 (Streamlit 다운 등으로 로스터 절반 이상 실패)
#      실패 인원이 "전체 선수" 대비 절반 이상이면 팀 전체를 원래 팀명으로 재실행한다.
#
#   3) 개별 선수 실패 (로스터 절반 미만, 소수만 실패)
#      main.ts는 --player를 지원한다(단독 사용 시 전역 검색 모드 A, --team과 병용 시 팀
#      로스터 모드 B). 원래 실패가 발생한 것과 동일한 컨텍스트(팀 로스터 페이지)에서
#      재현하기 위해 모드 B(--league --team --player)를 쓴다.
#
# 수집 범위: run-s8-02-batch.sh와 동일하게 --metrics-only/--action-maps-only 없이 전체
# 수집(메트릭+Action Maps+Similarity) + --match-position(본인 포지션 1개)을 유지한다.
#
# 사용법: ./scripts/scraper/run-s8-02-fixup.sh [--dry-run] [--season=24/25]
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 1

LOG_DIR="scripts/scraper/logs"
mkdir -p "$LOG_DIR"

SEASON="${SEASON:-24/25}"
SEC_PER_PLAYER=78       # run-s8-02-batch.sh와 동일 실측치 (메트릭 55.6s + Action Maps 22.1s)
SAFETY_MULTIPLIER=2
WATCHDOG_FLOOR_SECS=900 # 선수 1명짜리 재시도도 네트워크 지연 대비 15분 확보 (batch와 동일)
WATCHDOG_POLL_SECS=10

# 정리 대상 패턴 (이 저장소 스크래퍼 전용으로 좁힌 값 — run-s8-02-batch.sh와 동일)
SCRAPER_PATTERN="scripts/scraper/main.ts"
BROWSER_PATTERN="ms-playwright/chromium"

# 중복 실행 가드: 배치가 아직 돌고 있거나 다른 fixup 인스턴스가 있으면 시작을 거부한다.
if pgrep -f "$SCRAPER_PATTERN" >/dev/null 2>&1; then
  echo "ERROR: 이미 실행 중인 스크래퍼 프로세스가 있어 시작을 거부합니다 (패턴: ${SCRAPER_PATTERN})" >&2
  pgrep -fl "$SCRAPER_PATTERN" >&2
  echo "        run-s8-02-batch.sh가 완전히 끝난 뒤 다시 실행하세요." >&2
  exit 1
fi

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
for ARG in "$@"; do
  case "$ARG" in
    --dry-run) DRY_RUN=true ;;
    --season=*) SEASON="${ARG#*=}" ;;
    *)
      echo "ERROR: 알 수 없는 인자: ${ARG}" >&2
      echo "사용법: $0 [--dry-run] [--season=24/25]" >&2
      exit 1
      ;;
  esac
done

# 팀명 미스매치 정정 테이블: "DB팀명|드롭다운 정정 표기|로스터인원"
# run-s8-02-batch.sh가 이미 정식 클럽명을 쓰므로 기본값은 비워둔다. ScoutLab Club
# 콤보박스에서 실제 미스매치를 확인하면 여기에 항목을 추가한다(형식은 run-s8-06-fixup.sh
# MISMATCH_MAP과 동일).
MISMATCH_MAP=()

# ANSI 컬러 코드 제거
strip_ansi() {
  sed -E $'s/\x1b\\[[0-9;]*m//g'
}

# 문자열 슬러그화 (로그 파일명용)
slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g'
}

# 앞뒤 공백 제거
trim() {
  sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//'
}

# 미스매치 테이블에서 "DB팀명" 매치 시 "정정표기|로스터"를 echo (없으면 빈 문자열)
lookup_mismatch() {
  local team="$1"
  local entry e_team e_fixed e_roster
  if [[ ${#MISMATCH_MAP[@]} -eq 0 ]]; then
    echo ""
    return 0
  fi
  for entry in "${MISMATCH_MAP[@]}"; do
    IFS='|' read -r e_team e_fixed e_roster <<<"$entry"
    if [[ "$e_team" == "$team" ]]; then
      echo "${e_fixed}|${e_roster}"
      return 0
    fi
  done
  echo ""
}

# ACTIONS: "team|스크랩용팀명||로스터|로그슬러그" 또는 "player|DB팀명|선수명|1|로그슬러그"
ACTIONS=()

echo "=== [$(date '+%F %T')] 로그 스캔 시작 (${LOG_DIR}/s8-02-*.log, fixup 자신의 로그 제외)"

for LOGFILE in "$LOG_DIR"/s8-02-*.log; do
  [[ -e "$LOGFILE" ]] || continue
  case "$(basename "$LOGFILE")" in
    s8-02-fixup-*) continue ;;
  esac

  SETTINGS_LINE=$(grep -a "설정:" "$LOGFILE" | strip_ansi | tail -1)
  if [[ -z "$SETTINGS_LINE" ]]; then
    echo "  [스킵] $(basename "$LOGFILE") — 설정 라인 없음(로그 형식 이상)"
    continue
  fi
  DB_TEAM=$(echo "$SETTINGS_LINE" | sed -E 's/.*team=([^,]+), player=.*/\1/')

  TOTAL_LINE=$(grep -a "전체 선수:" "$LOGFILE" | strip_ansi | tail -1)
  if [[ -z "$TOTAL_LINE" ]]; then
    echo "  [스킵] ${DB_TEAM} — 아직 배치 진행 중(요약 없음), 이번 fixup 대상 아님"
    continue
  fi
  TOTAL=$(echo "$TOTAL_LINE" | sed -E 's/.*전체 선수: ([0-9]+).*/\1/')

  if [[ "$TOTAL" -eq 0 ]]; then
    MISMATCH=$(lookup_mismatch "$DB_TEAM")
    if [[ -n "$MISMATCH" ]]; then
      FIXED_TEAM="${MISMATCH%%|*}"
      ROSTER="${MISMATCH##*|}"
      SLUG=$(slugify "$FIXED_TEAM")
      echo "  [팀명 미스매치] ${DB_TEAM} → ${FIXED_TEAM} (로스터 ${ROSTER}명)"
      ACTIONS+=("team|${FIXED_TEAM}||${ROSTER}|${SLUG}")
    else
      echo "  [경고] ${DB_TEAM} — 전체 선수: 0 (팀명 미스매치로 추정되나 MISMATCH_MAP에 정정 표기 없음)"
      echo "         ScoutLab Club 콤보박스에서 실제 표기를 확인해 MISMATCH_MAP에 추가한 뒤 재실행하세요."
    fi
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
    echo "  [연쇄 장애] ${DB_TEAM} — ${FAIL}/${TOTAL}명 실패 → 팀 전체 재실행"
    ACTIONS+=("team|${DB_TEAM}||${TOTAL}|${SLUG}")
    continue
  fi

  # 소수 실패 → 실패 선수만 개별 재실행
  FAILED_LIST=$(grep -a "실패 선수:" "$LOGFILE" | strip_ansi | tail -1 | sed -E 's/.*실패 선수: //')
  if [[ -z "$FAILED_LIST" ]]; then
    echo "  [경고] ${DB_TEAM} — 실패 ${FAIL}명인데 '실패 선수:' 목록을 못 찾음, 팀 전체로 대체"
    SLUG=$(slugify "$DB_TEAM")
    ACTIONS+=("team|${DB_TEAM}||${TOTAL}|${SLUG}")
    continue
  fi

  echo "  [개별 선수 실패] ${DB_TEAM} — ${FAIL}/${TOTAL}명"
  TEAM_SLUG=$(slugify "$DB_TEAM")
  IFS=',' read -ra PLAYERS <<<"$FAILED_LIST"
  for RAW_NAME in "${PLAYERS[@]}"; do
    PLAYER=$(echo "$RAW_NAME" | trim)
    [[ -z "$PLAYER" ]] && continue
    PLAYER_SLUG=$(slugify "$PLAYER")
    echo "    - ${PLAYER}"
    ACTIONS+=("player|${DB_TEAM}|${PLAYER}|1|${TEAM_SLUG}-${PLAYER_SLUG}")
  done
done

TOTAL_ACTIONS=${#ACTIONS[@]}
echo "=== [$(date '+%F %T')] 로그 스캔 완료 — 재수집 대상 ${TOTAL_ACTIONS}건"

if [[ $TOTAL_ACTIONS -eq 0 ]]; then
  echo "=== [$(date '+%F %T')] 재수집할 대상이 없습니다. 종료."
  exit 0
fi

for i in "${!ACTIONS[@]}"; do
  IFS='|' read -r TYPE TEAM PLAYER ROSTER LOGSLUG <<<"${ACTIONS[$i]}"
  LOG_FILE="$LOG_DIR/s8-02-fixup-${LOGSLUG}.log"
  WATCHDOG_SECS=$((ROSTER * SEC_PER_PLAYER * SAFETY_MULTIPLIER))
  if [[ $WATCHDOG_SECS -lt $WATCHDOG_FLOOR_SECS ]]; then
    WATCHDOG_SECS=$WATCHDOG_FLOOR_SECS
  fi

  if [[ "$TYPE" == "team" ]]; then
    CMD_DESC="팀 전체: Premier League / ${TEAM} (로스터 ${ROSTER}명)"
    CMD_ARGS=(--league="Premier League" --team="${TEAM}" --season="${SEASON}" --match-position)
  else
    CMD_DESC="개별 선수: Premier League / ${TEAM} / ${PLAYER}"
    CMD_ARGS=(--league="Premier League" --team="${TEAM}" --player="${PLAYER}" --season="${SEASON}" --match-position)
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

echo "=== [$(date '+%F %T')] S8′02 fixup 전체 완료"
