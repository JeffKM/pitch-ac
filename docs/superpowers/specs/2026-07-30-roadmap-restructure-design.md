# 로드맵 재수립 설계 (2026-07-30)

## 배경

- 마지막 커밋 2026-06-03 이후 약 2개월 공백. 복귀 시점에 ROADMAP.md 전면 재수립 결정.
- 시점 맥락: 25/26 시즌 종료·월드컵 2026 종료, **26/27 시즌 개막이 약 2~3주 앞** (2026년 8월 중순). 기존 로드맵에는 시즌 롤오버 Phase가 없음.
- ROADMAP.md가 1,587줄로 비대 — 약 95%가 완료 Phase의 상세 기록.
- 새로 설치된 스킬/플러그인(superpowers, impeccable, design-review, qa, security-scan, refactor-cleaner 등)이 개발 프로세스에 반영되어 있지 않음.

## 결정 사항

| 축                | 결정                                                                                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 제품 로드맵       | 26/27 시즌 롤오버를 최우선 신설. S703(Action Maps 4개 리그)은 "지난 시즌 아카이브 수집"으로 S8과 통합                                                                                               |
| 백엔드 포트폴리오 | **로드맵 편입 안 함**. 포폴 전용 태스크 금지. 품질 감사에서 실제 발견된 성능 문제만 측정 기반으로 수정하고, 결과가 자연스럽게 포폴 소재가 되면 보너스. `docs/backend-portfolio/`는 참고 문서로 유지 |
| 개발 프로세스     | CLAUDE.md에 작업 유형별 표준 워크플로우 명문화 + 로드맵 Phase별 적용 스킬 태깅                                                                                                                      |
| 코드 품질 감사    | 성능·쿼리 / UI·접근성 / 보안 / 데드코드 4종 전부 수행                                                                                                                                               |
| 문서 구조         | 완료 Phase → `docs/ROADMAP-ARCHIVE.md` 분리. ROADMAP.md는 현재+미래만 (~300줄)                                                                                                                      |

## 산출물 1: 문서 구조

- **`docs/ROADMAP-ARCHIVE.md` (신설)**: 완료된 Phase 전체 이동 — 레거시 Phase 1~5A, 6~7E, S1~S6, N1~N2, AF, FD, HP~HP4, RK, RK2, PD, UX1~UX2, MD, SB, NW, BF, S7 완료분(S701/S702/S706/S707). 스크래핑 실패/복구 기록 등 운영 노하우 원문 보존.
- **`docs/ROADMAP.md` (재작성)**: 개요 + 현재 상태 + 아카이브 링크 + 진행/예정 Phase만.
- **기능-Task 매핑 표**: 완료 기능은 아카이브로, 미완료 기능만 ROADMAP.md에 유지.

## 산출물 2: 새 Phase 구성 (우선순위 순)

### Phase PR: 개발 프로세스 명문화 (최우선, 반나절)

CLAUDE.md에 작업 유형별 표준 워크플로우 규칙 추가:

- 기능 개발 = superpowers:brainstorming → writing-plans → TDD → code-review
- UI 작업 = 위 + design-review / web-design-guidelines 통과
- 버그 수정 = systematic-debugging (원인 규명 전 수정 금지)
- 배포 전 = qa(Playwright) + security-scan
- DB/쿼리 작업 = postgres-best-practices(Supabase advisors) 참조

로드맵 각 Phase 헤더에 적용 스킬 태깅 (예: `> 적용 스킬: tdd, design-review`).

### Phase SR: 26/27 시즌 롤오버 (⏰ 개막 전 필수, ~2주 데드라인)

- **SR01**: football-data.org 26/27 시즌 제공 상태 점검 + 현행 sync 파이프라인의 새 시즌 자동 처리 여부 검증 (season 컬럼, `getCurrentGameweek`, standings UNIQUE 제약 등)
- **SR02**: 승격/강등 팀 반영 — 5대 리그 팀 목록·크레스트 갱신, standings 리셋 확인
- **SR03**: 26/27 전체 동기화 실행 + 홈/매치데이/랭킹 화면 검증 (오프시즌 fallback → 새 시즌 전환 확인)
- **SR04**: ScoutLab 시즌 전환 — 시즌 셀렉터 기본값 처리, ScoutLab 원본의 26/27 데이터 제공 시점 모니터링
- **SR05**: 방치 기간 헬스체크 — 뉴스 크롤러 self-hosted runner 생존 확인, Sentry 에러 백로그, Vercel cron 동작 확인

### Phase QA: 코드 품질 감사 4종 (SR과 병행 가능)

발견 건은 **측정 → 수정 → 재측정** 루프로 처리 (측정치는 포폴 소재로 활용 가능).

- **QA01 성능·쿼리**: Supabase advisors + N+1/순차 await/`select("*")` 스캔 + vercel-react-best-practices 감사
- **QA02 UI·접근성**: design-review + web-design-guidelines 전 페이지 감사
- **QA03 보안**: security-scan(.claude 설정) + Supabase RLS/advisors + 인증 플로우 점검
- **QA04 데드코드**: refactor-cleaner(knip/depcheck/ts-prune) — 카툰 시스템 등 피벗 잔재 정리

### 백로그 (새 시즌 개막 후 재평가)

1. **S8′ 멀티시즌 아카이브**: 기존 S703 + S801~S803 통합 — 지난 시즌(24/25, 25/26) Action Maps·메트릭 아카이브 수집
2. **S704/S705**: Scatter/Ranking 필터 보강 (Minutes/Age/리그 필터)
3. **RK3**: 선수 순위 (새 시즌 데이터 축적 후)
4. **MP**: 매치데이 매치픽 (라이브 시즌에만 유의미 → 개막 후)
5. **S804**: Share as Image
6. **CV**: 전술 시각화 (장기 목표 유지)

## 실행 순서

1. Phase PR (CLAUDE.md 규칙 + 태깅)
2. 문서 재구성 (ARCHIVE 분리 + ROADMAP 재작성)
3. Phase SR 착수
4. Phase QA 병행

## 범위 제외

- 토스페이먼츠 결제 파이프라인 (naraka-valley 메타 서버에서 증명)
- Builder 패턴 등 포폴 목적의 인위적 추상화 도입
- CV Phase 앞당기기
