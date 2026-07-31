# S8′01 Action Maps 4개 리그 수집 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La Liga·Serie A·Bundesliga·Ligue 1의 25/26 시즌 Action Maps(선수당 carries/passes/crosses 3행 + Storage 이미지)를 기존 PL과 동일한 방식으로 수집한다.

**Architecture:** 기존 스크래퍼(`scripts/scraper/main.ts`, `--action-maps-only`)를 리그별로 순차 실행하는 배치 러너 셸 스크립트를 만들어 백그라운드로 돌린다. 스크래퍼는 upsert 방식이라 재실행이 안전하고, 실패 선수는 `scoutlab_sync_logs`에 기록되므로 리그 완료 시마다 검증 쿼리로 확인 후 `--team` 단위로 재시도한다. 수집 완료 후 OCR 배치(`extract:action-text`)로 count/p90을 채운다.

**Tech Stack:** tsx + Playwright(chromium) 스크래퍼(기존), bash 러너(신규), Supabase(`scoutlab_action_maps`, `scoutlab_sync_logs`, Storage 버킷 `scoutlab-action-maps`), Sharp+Tesseract OCR(기존).

## Global Constraints

- 시즌은 반드시 `--season="25/26"` 명시 (ScoutLab 원본이 25/26 옵션을 제공하는 동안만 수집 가능 — 소스가 26/27로 전환되면 이 작업은 불가능해짐, `docs/ROADMAP.md:159`)
- Vision 좌표 추출(`--extract-lines`)은 사용하지 않는다 (S707에서 정확도 부족으로 원본 이미지 직접 표시 방식 채택, `docs/ROADMAP-ARCHIVE.md:912`)
- 장기 백그라운드 프로세스는 워치독 타임아웃 필수 + 종료 후 잔존 프로세스 정리 (글로벌 CLAUDE.md 좀비 방지 규칙). macOS에는 `timeout`이 없으므로 `( cmd & pid=$!; ( sleep N; kill ... ) & ... )` 패턴 사용
- 같은 스크래퍼를 동시에 2개 이상 실행하지 않는다 (순차 러너로만 실행)
- 대상 규모(2026-07-31 DB 기준): La Liga 391명, Serie A 136명, Bundesliga 333명, Ligue 1 285명 = 총 1,145명 × 3 action_type = 3,435행 목표
- 리그명은 `scoutlab_players.league` CHECK 제약과 동일한 문자열 사용: `La Liga`, `Serie A`, `Bundesliga`, `Ligue 1`

---

### Task 1: 순차 배치 러너 스크립트

**Files:**

- Create: `scripts/scraper/run-action-maps-batch.sh`
- Modify: `.gitignore` (로그 디렉토리 제외 추가)

**Interfaces:**

- Consumes: `npm run scrape:scoutlab`(= `tsx scripts/scraper/main.ts`)의 CLI 플래그 `--league`, `--season`, `--action-maps-only`
- Produces: `./scripts/scraper/run-action-maps-batch.sh [--dry-run] ["리그명"...]` — 인자 없으면 4개 리그 전체 순차 실행. 로그는 `scripts/scraper/logs/s8-01-<slug>.log`

- [ ] **Step 1: 러너 스크립트 작성**

```bash
#!/bin/bash
# S8′01: Action Maps 4개 리그 순차 수집 러너
# 사용법: ./scripts/scraper/run-action-maps-batch.sh [--dry-run] ["La Liga" "Serie A" ...]
#   인자 없으면 La Liga → Serie A → Bundesliga → Ligue 1 순서로 전체 실행
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 1

SEASON="25/26"
WATCHDOG_SECS=$((10 * 3600)) # 리그당 최대 10시간 (최대 리그 La Liga 391명 × ~90초 ≈ 9.8h 상한)
LOG_DIR="scripts/scraper/logs"
mkdir -p "$LOG_DIR"

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

cleanup_children() {
  # 스크래퍼가 남긴 잔존 프로세스만 정리 (사용자 브라우저는 건드리지 않음)
  pkill -f "scripts/scraper/main.ts" 2>/dev/null
  pkill -f "ms-playwright" 2>/dev/null
}
trap cleanup_children EXIT

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
    sleep "$WATCHDOG_SECS"
    if kill -0 "$PID" 2>/dev/null; then
      echo "[watchdog] ${LEAGUE} ${WATCHDOG_SECS}s 초과 — 강제 종료" | tee -a "$LOG_FILE"
      kill -9 "$PID" 2>/dev/null
      pkill -f "scripts/scraper/main.ts" 2>/dev/null
      pkill -f "ms-playwright" 2>/dev/null
    fi
  ) &
  WD=$!
  wait "$PID"
  STATUS=$?
  kill "$WD" 2>/dev/null
  wait "$WD" 2>/dev/null
  echo "=== [$(date '+%F %T')] ${LEAGUE} 종료 (exit=${STATUS})"
done

echo "=== [$(date '+%F %T')] 전체 배치 완료"
```

- [ ] **Step 2: 실행 권한 부여 + `.gitignore`에 로그 디렉토리 추가**

```bash
chmod +x scripts/scraper/run-action-maps-batch.sh
```

`.gitignore`에 추가:

```
# 스크래퍼 배치 로그
scripts/scraper/logs/
```

- [ ] **Step 3: dry-run으로 러너 동작 검증**

Run: `./scripts/scraper/run-action-maps-batch.sh --dry-run`
Expected: 4개 리그의 `(dry-run) npm run scrape:scoutlab -- --league="..." --season="25/26" --action-maps-only` 라인이 순서대로 출력되고 즉시 종료. `scripts/scraper/logs/` 디렉토리 생성됨.

Run: `./scripts/scraper/run-action-maps-batch.sh --dry-run "Serie A"`
Expected: Serie A 한 줄만 출력.

- [ ] **Step 4: Commit**

```bash
git add scripts/scraper/run-action-maps-batch.sh .gitignore
git commit -m "🔧 chore: S8′01 Action Maps 4개 리그 순차 수집 러너 추가 (워치독+로그+잔존정리)"
```

---

### Task 2: 스모크 테스트 — 25/26 시즌 가용성 + 1개 팀 실수집 검증

**Files:**

- 없음 (실행·검증만)

**Interfaces:**

- Consumes: `npm run scrape:scoutlab` (Task 1과 동일 플래그 + `--team`)
- Produces: La Liga 1개 팀의 `scoutlab_action_maps` 행 — 이 성공이 Task 3(전체 배치) 착수 조건

- [ ] **Step 1: La Liga 팀 1개만 실제 수집 (upsert라 안전, 전체 배치 전 소스 가용성 확인)**

Run:

```bash
npm run scrape:scoutlab -- --league="La Liga" --season="25/26" --team="Real Madrid" --action-maps-only 2>&1 | tee scripts/scraper/logs/s8-01-smoke.log
```

Expected: 시즌 셀렉터에서 25/26 선택 성공, Real Madrid 선수들 순회하며 `✓` 성공 로그. **25/26 옵션이 ScoutLab UI에 없어 실패하면 여기서 즉시 중단하고 사용자에게 보고** (이 작업 자체가 불가능해진 것이므로).

참고: 팀명이 ScoutLab 표기와 다르면 로그의 팀 목록에서 실제 표기를 확인해 재시도.

- [ ] **Step 2: DB 검증 쿼리**

Supabase에서 실행:

```sql
SELECT p.team, COUNT(am.id) AS rows,
       COUNT(*) FILTER (WHERE am.image_url IS NOT NULL) AS with_image
FROM scoutlab_action_maps am
JOIN scoutlab_players p ON p.id = am.player_id
WHERE p.league = 'La Liga' AND am.season = '25/26'
GROUP BY p.team;
```

Expected: Real Madrid 행 수 = 해당 팀 선수 수 × 3 (일부 실패 허용), `with_image` = rows (이미지 업로드 정상).

---

### Task 3: 4개 리그 전체 배치 실행 + 리그별 검증

**Files:**

- 없음 (실행·검증만)

**Interfaces:**

- Consumes: Task 1의 러너 스크립트
- Produces: 4개 리그 `scoutlab_action_maps` 데이터 (~3,435행 목표), 리그별 `scoutlab_sync_logs` 행

- [ ] **Step 1: 러너를 백그라운드로 기동**

```bash
nohup ./scripts/scraper/run-action-maps-batch.sh >scripts/scraper/logs/s8-01-runner.log 2>&1 &
```

(에이전트 세션에서는 Bash `run_in_background`로 실행)

- [ ] **Step 2: 리그별 완료 시마다 진행 검증**

각 리그 로그에 `종료 (exit=0)` 이 찍힐 때마다:

```sql
SELECT p.league,
       COUNT(DISTINCT am.player_id) AS players_done,
       COUNT(am.id) AS rows,
       COUNT(*) FILTER (WHERE am.image_url IS NULL) AS missing_image
FROM scoutlab_players p
LEFT JOIN scoutlab_action_maps am ON am.player_id = p.id AND am.season = '25/26'
WHERE p.league IN ('La Liga','Serie A','Bundesliga','Ligue 1')
GROUP BY p.league;
```

Expected: 완료 리그의 `players_done`이 대상 인원(391/136/333/285)의 95% 이상. 미달이면 Task 4에서 재시도.

```sql
SELECT league, status, records_synced, records_failed,
       LEFT(error_message, 500) AS failed_players, duration_ms
FROM scoutlab_sync_logs
WHERE scraper = 'action-maps' AND season = '25/26'
ORDER BY created_at DESC LIMIT 8;
```

- [ ] **Step 3: 워치독/중단 발생 시 복구**

리그가 타임아웃되거나 중간에 죽은 경우: 로그에서 마지막 처리 팀 확인 후, 미처리 팀만 `--team`으로 개별 실행하거나 해당 리그만 러너 재실행 (`./scripts/scraper/run-action-maps-batch.sh "Bundesliga"` — upsert라 중복 안전).

---

### Task 4: 실패 선수 재시도

**Files:**

- 없음 (실행·검증만)

**Interfaces:**

- Consumes: Task 3의 `scoutlab_sync_logs.error_message` (실패 선수 목록)
- Produces: 리그별 수집률 95%+ 확정

- [ ] **Step 1: 실패 선수의 소속 팀 단위로 재실행**

`sync_logs`의 실패 목록에서 팀별로 묶어:

```bash
npm run scrape:scoutlab -- --league="<리그>" --season="25/26" --team="<팀명>" --action-maps-only 2>&1 | tee -a scripts/scraper/logs/s8-01-retry.log
```

- [ ] **Step 2: Task 3 Step 2의 리그별 검증 쿼리 재실행**

Expected: 4개 리그 모두 `players_done` ≥ 대상의 95%, `missing_image` = 0. 2회 재시도에도 실패하는 선수는 목록화해 최종 보고에 포함 (PL도 374명 중 372명이었음 — 소수 결손은 정상).

---

### Task 5: OCR 후처리 — count/p90 추출

**Files:**

- 없음 (기존 `scripts/extract-action-text.ts` 실행)

**Interfaces:**

- Consumes: Task 3~4가 업로드한 Storage 이미지 (`scoutlab_action_maps.image_url`)
- Produces: 신규 행의 `total_count`, `per90` 값

- [ ] **Step 1: 옵션 확인 후 신규(값 누락) 레코드 대상으로 실행**

먼저 `scripts/extract-action-text.ts` 상단 주석/인자 파싱에서 기본 대상 범위(누락 레코드만인지)와 `--limit`/`--force` 동작을 확인하고, 기본값이 누락 레코드만이면:

```bash
npm run extract:action-text 2>&1 | tee scripts/scraper/logs/s8-01-ocr.log
```

Expected: PL 때와 유사하게 신규 ~3,400행 중 대부분 업데이트, 실제 값이 0인 레코드는 미업데이트가 정상 (`docs/ROADMAP-ARCHIVE.md:906-909` 참조).

- [ ] **Step 2: 검증 쿼리**

```sql
SELECT p.league,
       COUNT(*) FILTER (WHERE am.total_count IS NULL) AS null_count,
       COUNT(*) AS total
FROM scoutlab_action_maps am
JOIN scoutlab_players p ON p.id = am.player_id
WHERE am.season = '25/26' AND p.league <> 'Premier League'
GROUP BY p.league;
```

Expected: `null_count` 비율이 PL 수준(~8% = 85/1116) 내외.

---

### Task 6: 최종 검증 + UI 확인 + 로드맵 갱신

**Files:**

- Modify: `docs/ROADMAP.md` (Task S8′01 완료 처리, 실측 수치 기록)

**Interfaces:**

- Consumes: Task 3~5의 최종 수치
- Produces: S8′01 완료 기록 + 커밋

- [ ] **Step 1: 앱에서 UI 확인**

`npm run dev` 후 ScoutLab 선수 상세에서 4개 리그 선수 각 1명씩 Action Maps 탭 렌더링 확인 (이미지 표시 + count/p90 라벨). dev 서버는 확인 후 반드시 종료.

- [ ] **Step 2: ROADMAP.md 갱신**

Task S8′01 항목에 ✅ 완료 표시 + 실측 결과(리그별 수집 인원/행 수/소요 시간/미수집 선수 목록) 기록. QA02 이관 항목 중 "1건 액션맵 데이터 부족" 관련 항목에 데이터 보강됨을 메모.

- [ ] **Step 3: Commit**

```bash
git add docs/ROADMAP.md
git commit -m "📝 docs: S8′01 완료 — Action Maps 4개 리그(1,145명) 25/26 아카이브 수집"
```
