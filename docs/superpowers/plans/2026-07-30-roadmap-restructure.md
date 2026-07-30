# 로드맵 재구성 + 프로세스 명문화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CLAUDE.md에 스킬 기반 개발 워크플로우를 명문화하고, 1,587줄 ROADMAP.md를 ARCHIVE 분리 + 슬림 재작성한다.

**Architecture:** 순수 문서 작업 3개 태스크. (1) CLAUDE.md 규칙 추가 → (2) 완료 Phase를 ROADMAP-ARCHIVE.md로 이동 → (3) ROADMAP.md를 현재+미래만 담아 재작성. 스펙: `docs/superpowers/specs/2026-07-30-roadmap-restructure-design.md`.

**Tech Stack:** Markdown, git. 코드 변경 없음 (lint-staged가 커밋 시 prettier 자동 적용).

## Global Constraints

- 모든 문서는 한국어 (기술 용어·코드 식별자는 원문 유지)
- 커밋 메시지: gitmoji + 한국어, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` 푸터
- ARCHIVE 이동 시 운영 노하우(스크래핑 실패/복구 기록 등) **원문 그대로 보존** — 요약·삭제 금지
- 기준 원본: 커밋 `1455c34` 시점의 `docs/ROADMAP.md` (1,587줄)
- 포폴 전용 태스크를 로드맵에 추가하지 않는다 (스펙 "범위 제외" 준수)

---

### Task 1: CLAUDE.md 개발 워크플로우 섹션 추가 (Phase PR)

**Files:**

- Modify: `CLAUDE.md` — `## Supabase 인증` 섹션 바로 앞에 삽입

**Interfaces:**

- Produces: `## 개발 워크플로우 (스킬 기반)` 섹션 — Task 3의 ROADMAP.md가 이 섹션을 참조

- [ ] **Step 1: CLAUDE.md에 섹션 삽입**

`## Supabase 인증` 앞에 아래 블록을 추가:

```markdown
## 개발 워크플로우 (스킬 기반)

작업 유형별 표준 프로세스. 해당 유형의 작업을 시작하기 전에 명시된 스킬을 로드한다.

- **기능 개발**: `superpowers:brainstorming`(설계 합의) → `superpowers:writing-plans`(구현 계획) → `superpowers:test-driven-development` → `code-reviewer`(리뷰)
- **UI 작업**: 기능 개발 프로세스 + 완료 전 `design-review` 또는 `web-design-guidelines` 통과
- **버그 수정**: `superpowers:systematic-debugging` — 근본 원인 규명 전 수정 금지
- **배포 전 검증**: `qa`(Playwright 시나리오) + `security-scan`
- **DB/쿼리 작업**: `postgres-best-practices` 참조 + Supabase advisors 확인
- **차트/시각화**: `dataviz` 로드 후 작성
- **로드맵 관리**: `development-planner` 스킬 사용. Phase 헤더의 `> 적용 스킬:` 태그 유지
```

- [ ] **Step 2: 검증**

Run: `grep -c "개발 워크플로우" CLAUDE.md`
Expected: `1` (섹션 1회 존재), `## Supabase 인증` 섹션이 그 뒤에 남아 있는지 육안 확인

- [ ] **Step 3: 커밋**

```bash
git add CLAUDE.md
git commit -m "📝 docs: CLAUDE.md에 스킬 기반 개발 워크플로우 명문화 (Phase PR)"
```

---

### Task 2: ROADMAP-ARCHIVE.md 생성 (완료 Phase 이동)

**Files:**

- Create: `docs/ROADMAP-ARCHIVE.md`

**Interfaces:**

- Consumes: `1455c34` 시점 `docs/ROADMAP.md`
- Produces: 완료 Phase 전체가 담긴 아카이브 — Task 3의 ROADMAP.md가 링크로 참조

- [ ] **Step 1: 아카이브 파일 작성**

아래 헤더로 시작:

```markdown
# pitch-ac 로드맵 아카이브 — 완료된 Phase 기록

> 현재 진행 중인 로드맵은 [ROADMAP.md](./ROADMAP.md) 참조.
> 이 문서는 완료된 Phase의 상세 구현 기록·운영 노하우를 원문 그대로 보존한다.
```

이어서 원본 ROADMAP.md에서 다음 섹션을 **순서대로 원문 그대로** 복사:

1. `## 레거시 완료 (Phase 1~4)` ~ `## Phase S6` 끝까지 (원본 23~897행: 레거시, 6, 7, 7B~7E, S1~S5, N1, AF, N2, FD, HP, RK, PD, HP2, S6)
2. `## Phase S7` 섹션 중 **완료 태스크만**: 서두 설명 + S701, S702, S706, S707 블록 (S703/S704/S705 블록은 제외 — Task 3에서 백로그로 이동)
3. 원본 987~1252행 원문: UX1, UX2, MD, HP3, SB, HP4, RK2, BF
4. `## Phase NW` 섹션 전체 (원본 1299~1453행)
5. `## 기능-Task 매핑 (완료)` — 원본 매핑 표에서 완료 기능 행만 (F111~F136, F201, F218~F222, F225 + F202 중 S701~S702 완료분 주석)

- [ ] **Step 2: 검증**

Run: `grep -c "^## Phase" docs/ROADMAP-ARCHIVE.md`
Expected: 25±2 (레거시 포함 완료 Phase 수). `grep "S703" docs/ROADMAP-ARCHIVE.md` → 매칭 없음 (미완료 태스크 미포함 확인)

- [ ] **Step 3: 커밋**

```bash
git add docs/ROADMAP-ARCHIVE.md
git commit -m "📝 docs: 완료 Phase 상세 기록을 ROADMAP-ARCHIVE.md로 분리"
```

---

### Task 3: ROADMAP.md 재작성 (현재+미래 슬림판)

**Files:**

- Modify: `docs/ROADMAP.md` — 전체 교체

**Interfaces:**

- Consumes: Task 1의 CLAUDE.md 워크플로우 섹션, Task 2의 ROADMAP-ARCHIVE.md
- Produces: 신규 Phase 체계 (PR ✅ / SR / QA / 백로그)

- [ ] **Step 1: ROADMAP.md 전체 교체**

구성 (스펙 "산출물 2" 기준):

```markdown
# pitch-ac 개발 로드맵

유럽 5대 리그 경기·순위·선수 데이터를 맥락과 함께 시각화하는 축구 데이터 플랫폼.

> 완료된 Phase(레거시~S6, UX, NW, BF 등)의 상세 기록은 [ROADMAP-ARCHIVE.md](./ROADMAP-ARCHIVE.md) 참조.
> 작업 유형별 표준 워크플로우는 CLAUDE.md "개발 워크플로우 (스킬 기반)" 섹션 참조.

## 개요

(매치데이/Ranking/ScoutLab/News/Tactics 5줄 요약 — 원본 7~12행 갱신판)

## 현재 상태 (2026-07-30)

- 25/26 시즌 종료 — DB 데이터(fixtures/standings/ScoutLab)는 25/26 기준
- 26/27 시즌 개막 임박(8월 중순) → Phase SR 최우선
- ScoutLab: 5대 리그 1,519명 메트릭+Similarity 완료, Action Maps는 PL 372명만
- 자동화 가동 중: 경기결과 cron(Vercel), 이적뉴스 크롤링(self-hosted runner 하루 3회)

## Phase PR: 개발 프로세스 명문화 ✅ (2026-07-30)

> 적용 스킬: update-config

- CLAUDE.md 워크플로우 섹션 추가 + 로드맵 Phase별 스킬 태깅 도입

## Phase SR: 26/27 시즌 롤오버 — 진행 예정 (⏰ 개막 전 필수)

> 적용 스킬: superpowers:systematic-debugging, postgres-best-practices, qa

- SR01~SR05 (스펙 원문 그대로, 태스크당 3~5줄 상세)

## Phase QA: 코드 품질 감사 — 예정 (SR과 병행 가능)

> 발견 건은 측정 → 수정 → 재측정 루프. 측정치는 포폴 소재로 활용 가능(전용 태스크는 두지 않음)

- QA01 성능·쿼리 (> 적용 스킬: postgres-best-practices, vercel-react-best-practices, silent-failure-hunter)
- QA02 UI·접근성 (> 적용 스킬: design-review, web-design-guidelines, fixing-accessibility)
- QA03 보안 (> 적용 스킬: security-scan, postgres-best-practices)
- QA04 데드코드 (> 적용 스킬: refactor-cleaner) — 카툰 시스템(mood-engine, asset-resolver 등) 잔재 정리 포함

## 백로그 — 새 시즌 개막 후 재평가

### S8′: 멀티시즌 아카이브 (구 S703 + S801~S803 통합)

- 25/26 Action Maps 4개 리그(~20h), 24/25 시즌 메트릭, 포지션 비교 그룹 확장

### SF: Scatter/Ranking 필터 보강 (구 S704/S705 원문 이동)

### RK3: RANKING 선수 순위 (원본 1254~1272행 원문 이동)

### MP: MATCHDAY 매치픽 (원본 1275~1296행 원문 이동)

### S804: Share as Image (원본 S804 원문 이동)

### CV: 전술 시각화 플랫폼 — 장기 (원본 1456~1543행 원문 이동, 기술 결정 표 포함)

## 기능-Task 매핑 (미완료만)

| F202 잔여(Action Maps 4개 리그)=S8′ | F203=SF | F204=S8′ | F205=S804 | F206~F208=CV | F223=RK3 | F224=MP |

- 신규: F226(시즌 롤오버)=SR01~05, F227(품질 감사)=QA01~04

**최종 업데이트**: 2026-07-30 (로드맵 재수립 — ARCHIVE 분리 + SR/QA Phase 신설)
```

미완료 섹션(RK3, MP, CV, S704/S705, S8)은 원본에서 **원문 그대로 이동**하되 Phase ID·제목만 새 체계에 맞게 조정.

- [ ] **Step 2: 검증**

Run: `wc -l docs/ROADMAP.md`
Expected: 450행 이하
Run: `grep -c "ROADMAP-ARCHIVE" docs/ROADMAP.md`
Expected: 1 이상 (아카이브 링크 존재)
Run: `grep -n "적용 스킬" docs/ROADMAP.md`
Expected: PR/SR/QA 등 Phase별 태그 존재

- [ ] **Step 3: 커밋**

```bash
git add docs/ROADMAP.md
git commit -m "📝 docs: ROADMAP 재수립 — 시즌 롤오버(SR)·품질 감사(QA) Phase 신설 + 슬림화"
```
