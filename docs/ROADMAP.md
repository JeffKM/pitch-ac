# pitch-ac 개발 로드맵

유럽 5대 리그 경기·순위·선수 데이터를 맥락과 함께 시각화하는 축구 데이터 플랫폼.

> 완료된 Phase(레거시~S6, UX, NW, BF 등)의 상세 기록은 [ROADMAP-ARCHIVE.md](./ROADMAP-ARCHIVE.md) 참조.
> 작업 유형별 표준 워크플로우는 CLAUDE.md "개발 워크플로우 (스킬 기반)" 섹션 참조.
> 로드맵 재수립 배경·결정 사항은 [superpowers/specs/2026-07-30-roadmap-restructure-design.md](./superpowers/specs/2026-07-30-roadmap-restructure-design.md) 참조.

## 개요

pitch-ac는 5대 리그 데이터 허브로 다음 기능을 제공한다:

- **매치데이 대시보드**: 5대 리그+UCL 게임위크별 경기 목록, 경기 상세(프리매치/포스트매치)
- **Ranking**: 5대 리그+UCL 순위표 (UCL/UEL/강등권 하이라이트)
- **ScoutLab**: 60+ 고급 메트릭 기반 스카우팅 분석 (10개 뷰, 5대 리그 1,519명)
- **News**: 이적뉴스 큐레이션 (자동 크롤링, 소스 유형 태깅)
- **Tactics (장기)**: 중계 영상 기반 CV 전술 시각화

## 현재 상태 (2026-07-31)

- **26/27 시즌 개막 임박 (8/21)** — fixtures/standings는 26/27 자동 롤오버 완료(SR01·SR03), ScoutLab 메트릭은 25/26 기준
- **잔여**: SR06(롤오버 후속 정리), SR04(ScoutLab 시즌 전환은 원본 데이터 제공 대기). SR02(승격/강등 팀) ✅
- ScoutLab: 5대 리그 1,519명 메트릭+Similarity 완료. Action Maps는 PL 372명만 (4개 리그 미수집 → 백로그 S8′)
- 자동화 정상 가동 확인(SR05 ✅): 경기결과 동기화(Vercel cron, 07-31 복구 확인), 이적뉴스 크롤링(self-hosted runner, 하루 3회)
- 백엔드 포트폴리오(`docs/backend-portfolio/`)는 로드맵 미편입 — QA 감사에서 실측 개선이 나오면 소재로만 활용

**진행 순서**: PR ✅ → **SR (개막 전 필수)** → QA (병행 가능) → 백로그 재평가

---

## Phase PR: 개발 프로세스 명문화 ✅ (2026-07-30)

> 적용 스킬: update-config

- ✅ CLAUDE.md에 "개발 워크플로우 (스킬 기반)" 섹션 추가 — 기능/UI/버그/배포/DB/차트/로드맵 작업별 표준 스킬 명시
- ✅ 로드맵 Phase 헤더에 `> 적용 스킬:` 태깅 도입
- ✅ ROADMAP-ARCHIVE.md 분리 + ROADMAP.md 슬림 재작성

---

## Phase SR: 26/27 시즌 롤오버 — 진행 중 (⏰ 개막 전 필수, ~2주)

> 적용 스킬: superpowers:systematic-debugging(검증), postgres-best-practices, qa
> **목표**: 26/27 새 시즌 데이터가 수동 개입 없이 전 화면에 정상 반영되는 상태.

- **Task SR01: 시즌 자동 처리 검증** ✅ (2026-07-30)
  - football-data.org의 26/27 시즌 데이터 제공 상태 확인 (fixtures/standings/teams 엔드포인트)
  - 현행 sync 파이프라인이 새 시즌을 자동 처리하는지 검증: season 컬럼 처리, `getCurrentGameweek()` 로직, standings UNIQUE 제약 `(team_id, season, league_id)` 동작
  - 시즌 하드코딩 지점 전수 조사 (grep "25/26", "2025" 등)
  - 실제 동기화 1회 실행 결과: 5대 리그 fixtures/standings에 `2026/2027` 행 자동 생성, UCL(2001)은 `2025/2026` 그대로 유지 — 대회별 시차 자동 반영 확인

- **Task SR02: 승격/강등 팀 반영** ✅ (2026-07-31)
  - ✅ `syncAllLeagueTeams()` 실행 — 6개 대회 전부 성공 (`teams-*` 최초 성공 기록, SR05의 코드 검증 우려 해소). 승격 14팀 전부 teams에 `2026/2027`로 반영: PL(Coventry·Hull·Ipswich), PD(Málaga·Deportivo·Racing Santander), SA(Monza·Frosinone·Venezia), BL1(Schalke·Paderborn·Elversberg), FL1(Troyes·Le Mans)
  - ✅ 크레스트 14팀 전부 HTTP 200. 단 Le Mans만 API가 wikimedia URL 제공 → `next.config.ts` remotePatterns에 `upload.wikimedia.org/wikipedia/**` 추가로 해결
  - ✅ scoutlab_players 강등 팀 선수 처리 방침: **유지(아카이브)** — `season` 컬럼('25/26')이 이미 아카이브 메커니즘이므로 삭제·마킹 불필요. SCOUTLAB_ACTIVE_SEASON이 25/26인 동안 강등 팀 선수(리그별 17~22명)도 유효한 25/26 데이터로 노출, SR04에서 26/27 수집 시 자연 배제
  - 참고: Pisa(25/26 세리에A 승격팀)는 scoutlab_players에 수집 자체가 누락돼 있음 — SR04/S8′ 수집 시 커버리지 확인 필요

- **Task SR03: 26/27 전체 동기화 + 화면 검증** ✅ (2026-07-30)
  - fixtures/teams/standings 전체 동기화 실행 (6개 대회)
  - 홈(오프시즌 fallback → 새 시즌 전환), 매치데이(GW1 표시), 랭킹(순위표 리셋) 검증
  - 개막 후 첫 라운드에서 sync-results cron 자동 반영 확인 — 다음 개막 후 재검증 필요
  - 실행 결과: `/`, `/ranking`, `/matchday`, `/api/matchday/fixtures` 전부 200, ranking 화면에서 5대 리그는 26/27 탭, UCL은 25/26 최종 순위 정상 렌더. football-data.org standings 응답이 26/27 신규 시즌에도 25/26 최종 스탯(played=38)을 그대로 반환하는 업스트림 이슈 발견 — fixtures는 380건 전부 `NS`로 정상이라 시즌 라벨링 로직 자체는 정상, 콘텐츠 정합성은 후속 확인 필요

- **Task SR04: ScoutLab 시즌 전환**
  - 시즌 셀렉터 기본값 처리: 26/27 데이터 없는 동안 25/26 유지, 수집 후 전환
  - ScoutLab 원본(Streamlit)의 26/27 데이터 제공 시점 모니터링 → 제공 시 26/27 스크래핑 착수
  - `toScoutlabSeason()` 등 시즌 변환 유틸 26/27 대응 확인

- **Task SR05: 방치 기간 헬스체크** ✅ (2026-07-31)
  - ✅ football-data 동기화 65일 중단 발견(Vercel `FOOTBALL_DATA_API_KEY` 오설정) → 키 교체+재배포, 07-31 13:00 KST sync-fixtures cron 6개 대회 전부 성공으로 복구 확인
  - ✅ 뉴스 크롤러 파서 정상. 러너 불안정은 절전 아닌 수동 종료가 원인 → 절전 영구 비활성화 적용, `sync-news.yml` timeout 20→30분
  - ✅ Sentry DSN이 Vercel에 미설정이었음(65일 무알림의 원인) → DSN 발급·등록·재배포 완료
  - ✅ `npm run validate` + `npm run build` 통과
  - 참고: 07-31 08:00 KST sync-results는 구 배포 코드+0015 시차로 FL1 season NOT NULL 위반 1회 발생 — 머지 배포 후 해소 예상, 다음 실행에서 확인(SR06)

- **Task SR06: 롤오버 후속 정리** (SR01·SR03 리뷰 잔여 백로그)
  - ✅ stuck 25/26 행 2건 결과 백필 (2026-07-31): 538145 LIVE→FT 1-1(본머스-맨시티), 542704 NS→FT 0-0(낭트-툴루즈, 업스트림 상태 AWARDED). 근본 원인은 `FIXTURE_STATUS_MAP`·`FdMatchStatus`에 `AWARDED` 누락(→NS fallback) — 매핑·타입 보강 + 매퍼 테스트 추가로 재발 차단
  - ✅ `getPendingResultLeagues()` 시즌 인식 추가 (2026-07-31): NS 행의 season이 해당 리그 최신 시즌과 일치할 때만 pending 인정, 구시즌 잔존 행은 경고 로그 후 제외 (무한 재시도 방지). 최신 시즌 조회 실패 시 fail-open. 테스트 6건 추가
  - sync-results cron 정상 동작 확인 (season NOT NULL 위반 재발 여부)
  - ✅ 리포지토리 시즌 파생 로직 테스트 추가 (2026-07-31): `getLatestStandingSeasons`(UCL 시차)·`getCurrentGameweek`(LIVE>NS>FT 우선순위, 구시즌 stuck 행 무시)·`resolveStatsSeasons`(export 전환) 12건 + 공용 인메모리 쿼리 빌더 `lib/__tests__/in-memory-supabase.ts` 신설
  - 시즌 모순 가드 스킵 시 sync_logs 가시성 확보 (스킵 사유를 errorMessage에 기록)
  - 랭킹 화면 시즌 배지·빈 표 fallback (개막 8/21 전까지 SA·FL1은 0경기 빈 표 노출)

---

## Phase QA: 코드 품질 감사 — 예정 (SR과 병행 가능)

> **원칙**: 발견 건은 **측정 → 수정 → 재측정** 루프로 처리. 측정치(쿼리 수/응답시간 before-after)는 포폴 소재로 활용 가능하되, 포폴 목적의 전용 태스크는 두지 않는다.

- **Task QA01: 성능·쿼리 감사**
  - > 적용 스킬: postgres-best-practices, vercel-react-best-practices, silent-failure-hunter
  - Supabase advisors(performance) 실행 + 인덱스/RLS 성능 점검
  - N+1 패턴 스캔: 순차 await, 루프 내 쿼리, `select("*")` 과다 조회
  - 렌더링 성능: Server/Client Component 경계, 번들 사이즈, 캐싱(`cache()`/`revalidate`/staleTime) 일관성
  - 발견 건별 측정치 기록 후 수정

- **Task QA02: UI·접근성 감사**
  - > 적용 스킬: design-review, web-design-guidelines, fixing-accessibility
  - 전 페이지(홈/매치데이/랭킹/ScoutLab 10탭/뉴스) 시각 일관성·간격·계층 점검
  - WCAG: 키보드 내비게이션, ARIA, 색상 대비 (코믹 팔레트 대비 검증)
  - 반응형 (375px 모바일 ~ 데스크탑) 점검

- **Task QA03: 보안 감사**
  - > 적용 스킬: security-scan, postgres-best-practices
  - security-scan으로 .claude/ 설정 점검
  - Supabase advisors(security) + RLS 정책 전 테이블 검증
  - 인증 플로우 점검 (OAuth 리다이렉트, 세션 갱신, service_role 키 노출 여부)
  - 디버그 엔드포인트(`/api/debug/*`) 프로덕션 노출 여부 확인
  - CSP Report-Only → enforce 전환 검토 — 전환 시 `connect-src`에 `*.ingest.us.sentry.io` 추가 필요 (`next.config.ts`)

- **Task QA04: 데드코드·구조 정리**
  - > 적용 스킬: refactor-cleaner
  - knip/depcheck/ts-prune으로 미사용 코드·의존성 탐지
  - 피벗 잔재 정리: 카툰 시스템(`lib/services/cartoon/`, `types/cartoon.ts`, cartoon 컴포넌트·테이블), SportMonks/API-Football 잔재, 라이브 시스템 잔재
  - `.claude/plans/` 임시 파일 정리, `shrimp_data/`·`lively-bubbling-hennessy.md` 등 루트 잡동사니 처리
  - SR 리뷰 잔여 데드코드 3건 제거: `toScoutlabSeason`·`getPlayerSeasonStats`·`getAllStandings`
  - 소소한 정리: sync-players dedupe "최신 구단" 주석 정정, `prevSeasonLabel` 리네이밍

---

## 백로그 — 새 시즌 개막 후 재평가

> 우선순위는 SR/QA 완료 후 재산정. 아래 순서는 잠정.

### Phase S8′: 멀티시즌 아카이브 (구 S703 + S8 통합)

> 적용 스킬: superpowers:writing-plans (장시간 스크래핑 배치 계획)
> 25/26 시즌이 "지난 시즌"이 되면서 기존 S703(Action Maps 4개 리그)과 S8(멀티시즌)이 동일 성격의 아카이브 수집으로 통합됨.

- **Task S8′01: Action Maps 4개 리그 수집 (구 S703)**
  - La Liga/Serie A/Bundesliga/Ligue 1 순차 실행 (예상 ~20시간)
  - 25/26 시즌 아카이브로 수집 (ScoutLab 원본이 25/26 데이터를 유지하는 동안)

- **Task S8′02: 24/25 시즌 PL 전체 스크래핑 (구 S801)**
  - 현재 10명만 → 전체 확장 (예상 ~4시간)

- **Task S8′03: 24/25 시즌 5대 리그 스크래핑 (구 S802)**
  - 4개 리그 순차 실행 (예상 ~16시간)

- **Task S8′04: 포지션 비교 그룹 전체 스크래핑 (구 S803)**
  - PL 25/26 기준 5개 포지션 그룹 × 4개 mode×adj = 20조합 전체
  - `npm run scrape:scoutlab -- --positions=CB,FB,MF,FW` (AM/W 기본 제외)
  - 예상: ~16시간

- **Task S8′05: Progression 통합 테스트 (구 S805)**
  - 멀티시즌 데이터로 Progression 차트 검증
  - 시즌 간 메트릭 변화 추이 정상 표시 확인

### Phase SF: Scatter/Ranking 필터 보강 (구 S704/S705)

> 적용 스킬: superpowers:test-driven-development, design-review

- **Task SF01: Scatter 필터 보강 (구 S704)**
  - Minutes 필터 (≥900분, ≥450분) 추가
  - Age 필터 (U21, U23, U25) 추가
  - Show Top Players 토글 추가
  - 리그 로고 필터 버튼 추가

- **Task SF02: Ranking 필터 보강 (구 S705)**
  - Minutes 필터, Age 필터, 리그 로고 필터 추가
  - Scatter와 동일한 필터 컴포넌트 공유

### Phase RK3: RANKING 선수 순위 (새 시즌 데이터 축적 후)

> 적용 스킬: superpowers:brainstorming, dataviz
> **목표**: 득점왕/어시왕/공격포인트/클린시트 등 주요 스탯별 선수 순위 표시.

- **Task RK301: 선수 순위 데이터 소스 결정**
  - football-data.org scorers 엔드포인트 (득점 순위) 활용
  - 어시/공격포인트/클린시트: ScoutLab 메트릭 또는 추가 API 필요 여부 판단

- **Task RK302: 선수 순위 탭 UI**
  - `ranking-content.tsx`: "선수 순위" 토글/탭 추가
  - 스탯 카테고리 선택 (득점/어시/공격포인트/클린시트)
  - 선수 사진 + 이름 + 팀 + 수치, 상위 3명 하이라이트
  - 참고: https://m.sports.naver.com/wfootball/record/epl

- **Task RK303: 선수 클릭 → ScoutLab 연동**
  - 선수 클릭 시 `/scouting?playerId=X` 으로 이동
  - ScoutLab Player Card에서 상세 분석 제공

### Phase MP: MATCHDAY 매치픽 (라이브 시즌 개막 후)

> 적용 스킬: superpowers:brainstorming, superpowers:test-driven-development, postgres-best-practices
> **목표**: 유저가 경기 결과를 예측하는 참여형 콘텐츠. 경기 상세 페이지 하위 기능.
> **전제**: 인증 구현 완료 (이미 있음)

- **Task MP101: 매치픽 DB 스키마**
  - `match_picks` 테이블: user_id, fixture_id, home_score_pred, away_score_pred, created_at
  - RLS: 읽기 공개, 쓰기 인증 유저만

- **Task MP102: 매치픽 API**
  - `app/api/matchday/pick/route.ts`: POST (예측 제출), GET (예측 조회)
  - 킥오프 전까지만 제출 가능, 킥오프 후 수정 불가

- **Task MP103: 매치픽 UI**
  - 경기 상세 페이지(`/matchday/[fixtureId]`)에 매치픽 섹션 추가
  - 스코어 입력 UI + 제출 버튼
  - 다른 유저들의 예측 분포 시각화

- **Task MP104: 매치픽 결과 및 랭킹**
  - 경기 종료 후 정답 비교 + 포인트 계산
  - 유저 매치픽 랭킹 표시

### Phase S804: Share as Image

> 적용 스킬: design-review

- 각 탭(Player Card, Summary, Radar, Compare)에서 현재 뷰를 이미지로 생성
- satori 또는 html-to-image 기반
- pitch-ac 브랜딩 워터마크 포함
- Web Share API (모바일) + 다운로드 버튼

### Phase CV: 전술 시각화 플랫폼 — 장기 목표 (최후순위)

> **비전**: 중계 영상에서 선수 움직임, 패스 궤적, 상호작용 데이터를 직접 추출하여 전술적 맥락을 시각화.
> ScoutLab 기반 메트릭을 점진적으로 자체 CV 파이프라인으로 교체해나가는 전략.

#### 기술 결정 사항

| 항목                | 결정                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| **접근 방식**       | 하이브리드 — 오픈소스 CV 프로토타입 → 품질 검증 후 API 전환 가능      |
| **추출 범위**       | L1(선수 위치) + L4(팀 분류) → 안정화 후 L5(포메이션) 확장             |
| **프로토타입 영상** | SoccerNet 오픈 데이터셋 (법적 이슈 제로)                              |
| **서비스 출력**     | 추상화된 피치맵만 (원본 프레임 미노출) → 저작권 리스크 최소화         |
| **처리 방식**       | 로컬 GPU + 오프라인 배치 (경기 종료 후 처리)                          |
| **처리량**          | 주당 빅매치 3~5경기                                                   |
| **데이터 아키텍처** | 요약 데이터 → Supabase DB, 프레임별 원본 → JSON 파일 (Object Storage) |
| **프론트 시각화**   | 순수 Canvas 2D (확장성 우선)                                          |
| **CV 스택**         | Ultralytics YOLO + Supervision (Roboflow)                             |
| **서비스 위치**     | 새 탑레벨 섹션 (Tactics) — News와 별도 독립                           |
| **상업 운영**       | 목표 — 피치맵만 공개, 원본 미노출                                     |

#### Phase CV1: CV 파이프라인 프로토타입

- **Task CV101: 개발 환경 구축** — Python 프로젝트 구조(`scripts/cv/` 또는 별도 repo), Ultralytics YOLO + Supervision + SoccerNet 설치, 테스트용 1~2경기 다운로드
- **Task CV102: 선수 탐지 + 추적 파이프라인** — YOLO 선수 탐지, ByteTrack/BoT-SORT 추적, Supervision 래퍼 통합
- **Task CV103: Homography (카메라→피치 좌표 변환)** — SoccerNet Camera Calibration 또는 Narya, 픽셀 → 105×68m 피치 좌표, 정확도 검증
- **Task CV104: 팀 분류 (Home/Away)** — 저지 색상 K-Means, Supervision TeamClassifier, 심판/관중 필터링
- **Task CV105: 출력 포맷 정의 + 데이터 저장** — 프레임별 JSON `{ frame, timestamp, players: [{ id, team, x, y }] }`, 경기별 요약(평균 포지션/팀 형태/점유 영역), Supabase DB 스키마 + Storage 업로드
- **Task CV106: 프로토타입 검증** — SoccerNet 테스트 경기 1~2개 전체 처리, 추적 정확도(ID 스위칭/좌표 정밀도) 평가, 90분 경기 처리 시간 측정

#### Phase CV2: 웹 시각화 + Tactics 섹션

- **Task CV201: Tactics 탭 신설** — `app/(app)/tactics/` 라우트, nav 6번째 탭, CV 처리된 경기 목록
- **Task CV202: Canvas 피치맵 렌더러** — `components/tactics/pitch-canvas.tsx`, 기존 `pitch-svg.tsx` 좌표계(105×68m) 재활용, 홈/어웨이 색상 + 선수 ID 라벨
- **Task CV203: 타임라인 재생 컨트롤** — 재생/일시정지/속도(0.5x/1x/2x), 스크러빙 슬라이더, `requestAnimationFrame` 프레임 루프, JSON fetch + 버퍼링
- **Task CV204: 정적 분석 뷰** — 평균 포지션 맵, 히트맵(선수별/팀별), 팀 형태(shape) 오버레이

#### Phase CV3: L5 포메이션 추론

- **Task CV301: 포메이션 감지 알고리즘** — 프레임별 위치 → 클러스터링 → 라인 분류(수비-미드-공격), 시간대별 변화 타임라인
- **Task CV302: 포메이션 시각화** — 포메이션 다이어그램(4-3-3, 4-2-3-1 등), 전환 애니메이션

---

## 기능-Task 매핑 (미완료)

> 완료 기능 매핑은 [ROADMAP-ARCHIVE.md](./ROADMAP-ARCHIVE.md) 참조.

| 기능 ID | 기능명                          | 커버 Task        |
| ------- | ------------------------------- | ---------------- |
| F202    | Action Maps 4개 리그 수집(잔여) | Task S8′01       |
| F203    | Scatter/Ranking 필터 보강       | Task SF01~SF02   |
| F204    | 멀티시즌 데이터 확장            | Task S8′02~S8′05 |
| F205    | Share as Image                  | Phase S804       |
| F206    | 전술 시각화 (CV 프로토)         | Task CV101~CV106 |
| F207    | Tactics 웹 시각화               | Task CV201~CV204 |
| F208    | 포메이션 추론                   | Task CV301~CV302 |
| F223    | RANKING 선수 순위               | Task RK301~RK303 |
| F224    | MATCHDAY 매치픽                 | Task MP101~MP104 |
| F226    | 26/27 시즌 롤오버               | Task SR01~SR06   |
| F227    | 코드 품질 감사                  | Task QA01~QA04   |

---

**최종 업데이트**: 2026-07-31 (SR06 착수 — stuck 행 2건 백필 완료, AWARDED 상태 매핑 보강)
**진행 상황**: PR ✅ → **SR (개막 전 필수)** → QA (병행) → 백로그(S8′ → SF → RK3 → MP → S804 → CV)
