# pitch-ac 개발 로드맵

유럽 5대 리그 경기·순위·선수 데이터를 맥락과 함께 시각화하는 축구 데이터 플랫폼.

## 개요

pitch-ac는 5대 리그 데이터 허브로 다음 기능을 제공합니다:

- **매치데이 대시보드**: 5대 리그 게임위크별 전 경기 목록, 경기 상세(프리매치/포스트매치)
- **Ranking**: 5대 리그 순위표 (UCL/UEL/강등권 하이라이트)
- **ScoutLab**: 60+ 고급 메트릭 기반 스카우팅 분석 (10개 뷰)
- **Tactics (계획)**: 중계 영상 기반 CV 전술 시각화 (선수 추적, 포메이션 추론)

## 현재 상태

- 5대 리그 데이터 인프라 완성 (football-data.org API, Supabase DB)
- ScoutLab: PL 359명 메트릭 수집 완료, 5대 리그 확장 예정
- 인증 플로우 구현 완료 (이메일 + Google OAuth)
- **다음 단계**: ScoutLab 5대 리그 데이터 완성 → Action Maps 스크래퍼 → CV 전술 시각화

---

## 레거시 완료 (Phase 1~4)

> 초기 PL 데이터 플랫폼 시절 완료된 인프라. 현재 5대 리그 데이터 허브의 기반.

- ✅ Phase 1: 애플리케이션 골격 (Route Groups, 타입 정의, 내비게이션)
- ✅ Phase 2: UI/UX (매치데이, 경기 상세, 선수 검색/프로필, 비교, 레이더 차트, 용어 팝오버)
- ✅ Phase 3: 백엔드 연동 (Supabase DB 9개 테이블, SportMonks API, Cron 동기화, 맥락 계산)
- ✅ Phase 4: 고급 기능 (라이브 스코어 실시간, OG 이미지, 성능 최적화, 프로덕션 배포)
- ✅ Phase 5-A: 안정성 (React cache, server-only, CSP, Vitest, Sentry)

---

## Phase 6: 맨시티 팬사이트 기반 전환 ✅ (레거시)

> PL 전체 → 맨시티 전용 필터링 + 브랜딩. 이후 Phase N1에서 5대 리그로 재피벗됨.

- **Task 601: 맨시티 팀 ID 상수 추가** ✅
  - `lib/api/sportmonks/constants.ts`에 `MCITY_TEAM_ID = 14` 추가

- **Task 602: Repository 맨시티 필터링** ✅
  - `fixture-repository.ts`: 맨시티 경기만 조회 (`.or('home_team_id.eq.X,away_team_id.eq.X')`)
  - `player-repository.ts`: 맨시티 선수만 조회 (`.eq('team_id', MCITY_TEAM_ID)`)
  - `getCurrentGameweek()`: 맨시티 경기 기준 판정

- **Task 603: 브랜딩 & 테마 변경** ✅
  - `globals.css`: 맨시티 스카이블루/네이비 컬러 (OKLCH)
  - `layout.tsx`: 메타데이터, Fredoka 카툰풍 폰트 추가
  - 라이트/다크 모드 모두 맨시티 컬러 적용

- **Task 604: 네비게이션 재구성** ✅
  - `nav-config.ts`: 매치데이/스쿼드/비교/갤러리 4탭
  - `/players` → `/squad` 라우트 리네이밍
  - `/gallery` 플레이스홀더 페이지 생성
  - `player-name-link.tsx`, `sitemap.ts` 링크 업데이트

- **Task 605: 매치데이 맨시티 포커스 뷰** ✅
  - 매치데이 페이지가 맨시티 경기만 표시 (GW당 1경기)
  - 메타데이터 맨시티 브랜딩 반영

---

## Phase 7: 카툰 에셋 시스템 구축 ✅ (레거시 — 코믹 UI 토큰만 유지, 카툰 캐릭터 폐기)

- **Task 701: 카툰 타입 정의** ✅
  - `types/cartoon.ts`: `CartoonMood` (12종), `CartoonTrigger` (13종)
  - `CartoonAsset`, `SpeechBubble`, `MoodResult` 인터페이스

- **Task 702: DB 테이블 추가** ✅
  - `supabase/migrations/0003_cartoon_tables.sql`
  - `cartoon_assets`: player_id + mood → image_url (UNIQUE 제약)
  - `speech_bubbles`: player_id + trigger_type → text
  - RLS: 읽기 공개, 쓰기 service_role만

- **Task 703: 감정 상태 결정 엔진** ✅
  - `lib/services/cartoon/mood-engine.ts`
  - `resolvePlayerMood()`: 이벤트 > 팀 상황 > 기본 우선순위
  - 트리거별 기본 말풍선 텍스트 매핑

- **Task 704: 에셋 저장소 리졸버** ✅
  - `lib/services/cartoon/asset-resolver.ts`
  - Supabase Storage 버킷 URL 구성
  - 전신/썸네일/폴백 URL 생성 함수

- **Task 705: 카툰 UI 컴포넌트** ✅
  - `components/cartoon/cartoon-avatar.tsx`: 이미지 + 감정 이모지 뱃지
  - `components/cartoon/speech-bubble.tsx`: 말풍선 UI (좌/우 방향)
  - `components/cartoon/mood-transition.tsx`: CSS transition 감정 전환 애니메이션
  - `next.config.ts`: Supabase Storage 이미지 도메인 추가

---

## Phase 7B: 코믹 디자인 시스템 앱 전체 적용 ✅

홈(마케팅) 페이지에만 적용되어 있던 코믹 디자인 토큰(Bangers/Permanent Marker 폰트, 3px 검정 테두리, 코믹 컬러 팔레트)을 앱 내부 전체 ~30개 컴포넌트에 확산 적용.

- **Task 7B1: 앱 레이아웃 + 네비게이션** ✅
  - `app/(app)/layout.tsx`: `bg-comic-white` 배경
  - `app-header.tsx`: 코믹 보더, Bangers 로고, 네비 링크 코믹 스타일 (활성=노랑, 비활성=검정), 로고 링크 `/` (홈)
  - `mobile-tab-bar.tsx`: 코믹 보더, 활성 아이콘 `bg-comic-yellow`, Bangers 라벨

- **Task 7B2: 페이지 타이틀 통일** ✅
  - `gameweek-header.tsx`, `squad/page.tsx`, `compare/page.tsx`, `gallery/page.tsx`, `more/page.tsx`
  - 모든 `<h1>` Bangers 폰트 + `text-comic-black`, 서브텍스트 PM 폰트

- **Task 7B3: 매치데이 카드 컴포넌트** ✅
  - `fixture-card.tsx`: 코믹 보더, Bangers 팀명/스코어, PM 순위
  - `fixture-status-badge.tsx`: NS=cream/PM, LIVE=green/Bangers, FT=yellow/Bangers
  - `fixture-date-group.tsx`, `fixture-card-skeleton.tsx`: 코믹 보더

- **Task 7B4: 스쿼드 카드 컴포넌트** ✅
  - `player-card.tsx`: 코믹 보더 + Bangers 이름 + PM 포지션 + 노랑 배지
  - `player-header-card.tsx`: Bangers h1, 스카이블루 등번호, 노랑 포지션 배지
  - `stat-context-card.tsx`: cream 배경, Bangers 수치, PM 레이블
  - `stat-context-grid.tsx`: Bangers 섹션 헤더, `player-card-skeleton.tsx` 코믹 보더

- **Task 7B5: 경기 상세 컴포넌트** ✅
  - `match-header.tsx`: 코믹 보더, Bangers 팀명/스코어, PM 날짜/순위
  - 서브 카드 6개 (`team-form-row`, `h2h-results`, `injury-list`, `standing-simulator`, `event-timeline`, `stat-bar`, `lineup-display`): Card 코믹 보더 + Bangers CardTitle
  - `fixture-tabs.tsx`: TabsList 코믹 cream 배경, 활성 탭 노랑
  - `recent-form-sparkline.tsx`: 코믹 보더 + Bangers 타이틀

- **Task 7B6: 비교 페이지 컴포넌트** ✅
  - `player-slot.tsx`, `compare-stat-table.tsx`: 코믹 보더 + Bangers CardTitle
  - `compare-verdict.tsx`: `bg-comic-yellow` 판정 박스 + Bangers
  - `compare/loading.tsx`: 스켈레톤 카드 코믹 보더

## Phase 7C: 디자인 시스템 정리 & 일관성 수정 ✅

디자인 시스템 문서화 + 하드코딩된 Tailwind 기본색/타이포를 코믹 토큰으로 일괄 교정.

- **Task 7C1: 디자인 시스템 문서 작성** ✅
  - `docs/design-system.md` 생성
  - 4단계 계층(파운데이션→엘리먼트→모듈→페이지) 구조화
  - 컬러, 타이포그래피, 보더, 간격, 그리드 토큰 전수 문서화
  - 금지 패턴(Anti-patterns) + 체크리스트 포함

- **Task 7C2: P0 색상 불일치 수정** ✅
  - `season-delta-indicator.tsx`: `text-green-600`/`text-red-600` → `text-comic-green`/`text-comic-red`
  - `live-pulse.tsx`: `bg-green-400`/`bg-green-500` → `bg-comic-green`
  - `score-flash.tsx`: `text-green-500` → `text-comic-green`
  - `percentile-bar.tsx`: `bg-green-500`/`bg-primary`/`bg-yellow-500` → `bg-comic-green`/`bg-comic-skyblue`/`bg-comic-yellow`

- **Task 7C3: P1 타이포그래피 & 링 불일치 수정** ✅
  - `event-timeline.tsx`: `text-sm`/`text-xs` → PM/Bangers 폰트 + 코믹 토큰, 이벤트 아이콘 색상 통일
  - `lineup-display.tsx`: 팀명/포메이션/교체선수 → Bangers/PM + 코믹 토큰
  - `compare-stat-table.tsx`: StatRow 수치/순위/지표명 → PM + 코믹 토큰
  - `player-slot.tsx`: `ring-1 ring-border` → `ring-comic-black`, 텍스트 코믹 토큰 통일

- **Task 7C4: shadcn Button 제거 & 레이아웃 토큰화** ✅
  - `gameweek-header.tsx`: shadcn `Button` → 코믹 스타일 `Link`/`span` (코믹 보더+hover cream)
  - `share-button.tsx`: shadcn `Button` → 네이티브 `button` (Bangers 폰트, 코믹 보더, 검정 배경)
  - `layout.tsx`: `container py-6` → `max-w-5xl p-[comic-panel-padding]`
  - `app-header.tsx`: `container` → `max-w-5xl px-[comic-panel-padding]`
  - `fixture-card.tsx`: `p-4` → `p-[comic-panel-padding]`
  - `compare-client.tsx`: `text-chart-1`/`text-chart-2` → `text-comic-skyblue`/`text-comic-red`, 빈 상태 텍스트 PM 폰트

## Phase 7D: UI 텍스트 영어 전환 & 카드 간소화 ✅

i18n 도입 전까지 모든 UI 텍스트를 영어로 통일. 선수 카드 스탯 뱃지를 제거하여 높이 일관성 확보.

- **Task 7D1: 선수 카드 스탯 뱃지 제거** ✅
  - `player-card.tsx`: `getPrimaryStat()` 함수, `Badge` import/JSX, `seasonStats` prop 삭제
  - `player-card-grid.tsx`, `player-search-page.tsx`: `seasonStatsMap` prop 제거
  - `squad/page.tsx`: `getPlayerSeasonStatsByIds` 호출 제거 (성능 개선)
  - 결과: 사진 + 이름 + 팀·포지션만 표시, 카드 높이 일관

- **Task 7D2: 전체 앱 한국어→영어 UI 텍스트 전환** ✅
  - `layout.tsx`: 메타데이터, OG/Twitter 태그, `lang="en"` 전환
  - `nav-config.ts`: Matchday/Squad/Compare/Gallery
  - 페이지 메타데이터: squad, matchday, compare, gallery 모두 영어
  - 스쿼드: 타이틀, 검색 placeholder, 빈 결과 텍스트
  - 선수 프로필: Avg. Rating, League #N · Top N%, Season Stats
  - 매치데이: 순위(#N), Possession, gameweek aria-label, Goal toast
  - 경기 상세 탭: Pre-match/Live/Post-match
  - 서브 카드: Team Stats, Possession/Shots/Corners/Fouls, H2H Records, Injuries, Last 5 Matches, Events, Lineups/Substitutes, Standing Simulator
  - 비교: Stats Comparison, Goals/Assists/Key Passes/Dribbles/Avg. Rating, Verdict
  - 에러/404: Error, Page Not Found, Match Not Found, Back to Matchday
  - 갤러리: Gallery, Cartoon Gallery Coming Soon
  - 설정: Settings, Theme, Account
  - 코드 주석은 한국어 유지 (개발자용)

---

## Phase 7E: 컵 대회 지원 + 연기 경기(POSTP) 상태 ✅

PL 경기만 표시하던 매치데이를 확장하여 맨시티의 모든 대회(FA Cup, Carabao Cup, UCL 등)를 GW 뷰에 통합 표시. 연기 경기(POSTP) 상태를 정확히 반영.

- **Task 7E1: DB 마이그레이션** ✅
  - `supabase/migrations/0004_cup_and_postp.sql`
  - `fixtures` 테이블: `status` CHECK에 `POSTP` 추가, `league_id`(INT NOT NULL DEFAULT 8), `competition_name`(TEXT), `gameweek` nullable 전환
  - `idx_fixtures_league_id` 인덱스 추가

- **Task 7E2: POSTP 상태 + 컵 대회 필드 타입/매퍼** ✅
  - `types/fixture.ts`: `FixtureStatus`에 `"POSTP"`, `Fixture`에 `leagueId`, `competitionName`, `gameweek: number | null`
  - `lib/api/sportmonks/constants.ts`: `postp: "POSTP"` 매핑, `CUP_LEAGUE_IDS`, `LEAGUE_NAME_MAP`, `FIXTURE_STATE_ID_MAP` (schedules 엔드포인트 state_id fallback)
  - SportMonks 매퍼: state 객체 우선, `state_id` fallback (schedules 엔드포인트 호환)
  - Repository 매퍼, DB 매퍼 모두 새 필드 반영
  - `fixture-repository.ts`: `getCurrentGameweek`에서 POSTP/null gameweek 제외
  - `app/api/matchday/fixtures/route.ts`: `hasKickedOff`에서 POSTP 제외

- **Task 7E3: POSTP 배지 + 대회 배지 UI** ✅
  - `fixture-status-badge.tsx`: 빨간 `POSTPONED` 배지
  - `fixture-card.tsx`: POSTP 시 반투명 + 빨간 보더 + 클릭 비활성화
  - `competition-badge.tsx` 신규: 대회별 색상 배지 (UCL=스카이블루, FA=빨강, EFL=초록, Community Shield=앰버)

- **Task 7E4: 컵 대회 API + 동기화** ✅
  - `lib/api/sportmonks/fixtures.ts`: `getLiveMCityFixtures()`, `getTeamScheduleFixtures()` (schedules 엔드포인트 — EFL Cup 포함 전 대회)
  - `lib/api/sportmonks/types.ts`: `SmScheduleEntry`, `SmScheduleRound`, `SmAggregate` 타입 추가
  - `lib/services/sync/gameweek-assigner.ts` 신규: PL GW midpoint 기준 가장 가까운 GW 할당, `ending_at` 날짜 23:59:59 확장
  - `lib/services/sync/sync-fixtures.ts`: `syncCupFixtures()` schedules 엔드포인트 전환, PL 동기화 시 POSTP 상태 보존 로직
  - `live-fixture-service.ts`: PL 전용 → 맨시티 전 대회 라이브로 확장
  - `matchday/_utils.ts`: `buildDateRange()` 컵 경기 제외, PL 경기만으로 날짜 범위 계산

- **Task 7E5: 디버그 엔드포인트** ✅
  - `app/api/debug/sportmonks/cup-fixtures/route.ts`: schedules 엔드포인트 + GW 할당 결과 확인용

- **Task 7E6: 컵 경기 GW 할당 앵커 기반 수정** ✅
  - 문제: PL 라운드 `starting_at~ending_at` midpoint 기준 할당 시, 라운드 범위가 일정 변경/연기로 넓어져 midpoint 왜곡 (FA Cup 3/7 경기가 GW29 대신 GW31에 할당됨)
  - `gameweek-assigner.ts`: `McityPlAnchor` 인터페이스 + `assignGameweekByAnchors()` — 맨시티 PL 실제 경기 날짜를 앵커로 최근접 GW 할당
  - `sync-fixtures.ts`: `syncCupFixtures()`가 DB에서 맨시티 PL 경기 조회 → 앵커 빌드, PL 경기 없으면 기존 라운드 midpoint fallback
  - 디버그 엔드포인트: midpoint/anchor/mismatch 비교 결과 표시
  - DB 즉시 수정: FA Cup 경기(id: 19676913) GW 31→29

---

## Phase S1: ScoutLab 스카우팅 인프라 ✅

Big 5 리그(PL, La Liga, Serie A, Bundesliga, Ligue 1) 선수 60+ 고급 메트릭 기반 스카우팅 플랫폼. ScoutLab(Streamlit 앱) 데이터를 수집하여 자체 DB에 캐시, 10개 분석 뷰로 시각화.

- **Task S101: DB 스키마 설계** ✅
  - `supabase/migrations/0005_scoutlab_tables.sql`: 6개 테이블
  - `scoutlab_players`: 선수 마스터 (name, team, league, position, season, nationality, age, height, minutes)
  - `scoutlab_metrics`: 카테고리별 JSONB 메트릭 (final_product, shooting, creation 등 10종)
  - `scoutlab_radar`: 레이더 차트 좌표 (x, y 배열)
  - `scoutlab_action_maps`: 액션맵 라인 데이터 (carries, passes, crosses)
  - `scoutlab_similarity`: 유사 선수 매핑 (score 기반)
  - `scoutlab_sync_logs`: 동기화 이력
  - 인덱스 + RLS(읽기 공개, 쓰기 service_role) + updated_at 트리거

- **Task S102: 타입 정의** ✅
  - `types/scoutlab.ts`: 완전한 타입 계층
  - `ScoutlabPosition` (CB/FB/MF/AM/W/AM·W/FW), `ScoutlabLeague`, `ScoutlabSeason`, `ScoutlabMode`, `ScoutlabAdjustment`
  - `ScoutlabPlayer`, `ScoutlabMetrics`, `ScoutlabRadar`, `ScoutlabActionMap`, `ScoutlabSimilarity`
  - `ScoutlabCategoryMetrics`, `ScoutlabFilterOptions`, `ScoutlabSearchFilters`, `ScoutlabScatterPoint`

- **Task S103: Repository + 매퍼** ✅
  - `lib/repositories/scoutlab-repository.ts`: 7개 캐시 조회 + 3개 집계 함수 (React `cache` 래핑)
  - `lib/repositories/scoutlab-mappers.ts`: DB row(snake_case) → 앱 타입(camelCase) 변환

- **Task S104: UI 스켈레톤 (10개 탭/페이지)** ✅
  - `app/(app)/scouting/layout.tsx`: 메타데이터 + `ScoutingTabNav` 래퍼
  - `app/(app)/scouting/_components/scouting-tab-nav.tsx`: 10탭 수평 내비게이션
  - 10개 페이지 플레이스홀더: Player Card, Summary, Progression, Action Maps, Compare, Radar, Similarity, Scatter, Ranking, Glossary
  - `nav-config.ts`: Scouting 탭 추가 (Radar 아이콘)

- **Task S105: Position CHECK 업데이트** ✅
  - `supabase/migrations/0006_scoutlab_amw_position.sql`: "AM/W" 복합 포지션 허용
  - `types/scoutlab.ts`: `ScoutlabPosition`에 `"AM/W"` 추가

- **Task S106: DB 마이그레이션 원격 적용** ✅
  - Supabase MCP로 `scoutlab_tables` + `scoutlab_amw_position` 마이그레이션 적용
  - 6개 테이블 생성 확인 (scoutlab_players, \_metrics, \_radar, \_action_maps, \_similarity, \_sync_logs)
  - INSERT/UPSERT/CASCADE DELETE/JOIN 쓰기 테스트 전수 통과

---

## Phase S2: ScoutLab Playwright 스크래퍼 ✅

ScoutLab(Streamlit WebSocket 앱)에서 Playwright headless 브라우저로 DOM을 파싱하여 선수 데이터를 자동 수집.

- **Task S201: 스크래퍼 인프라** ✅
  - `tsx` devDep 설치, `npm run scrape:scoutlab` 스크립트
  - `scripts/scraper/` 디렉토리 구조 (main.ts + lib/ 8개 모듈)

- **Task S202: 핵심 모듈 구현** ✅
  - `lib/browser.ts`: Playwright chromium launch + iframe 접근 + Streamlit 로딩 대기
  - `lib/navigation.ts`: 시즌/리그/팀/선수 Streamlit combobox 네비게이션
  - `lib/parsers.ts`: Player Card DOM 파싱 (선수 정보, 카테고리 백분위, Top 5 유사 선수)
  - `lib/db.ts`: Supabase upsert (scoutlab_players, scoutlab_metrics, scoutlab_sync_logs)
  - `lib/constants.ts`: URL, 메트릭→카테고리 매핑
  - `lib/supabase.ts`: 스크래퍼 전용 Supabase client (dotenv, server-only 없음)
  - `lib/logger.ts`: 프로그레스 콘솔 출력
  - `lib/types.ts`: 스크래퍼 내부 타입

- **Task S203: CLI 오케스트레이션** ✅
  - `scripts/scraper/main.ts`: CLI 인자 파싱 (--season, --league, --team, --player, --headless, --dry-run)
  - 팀 목록 → 선수 목록 순차 반복, 선수 단위 에러 격리
  - 선수 간 1초 딜레이 (rate limiting 방지)

- **Task S204: E2E 검증 + 버그 수정** ✅
  - 포지션 감지 버그 수정: `aria-pressed` → Streamlit `data-testid="stBaseButton-segmented_controlActive"` 기반으로 전환
  - 카테고리 매핑 버그 수정: UI 카테고리명(RECEIVING, DRIBBLING 등)이 DB 컬럼명(possession, ball_carrying 등)과 불일치 → 10개 매핑 교정
  - ✅ 수비 카테고리 매핑 수정: `ACTIVE DEFENDING (PADJ.)` → `defending` 매핑 추가 (기존 미수집 → 10개 메트릭 정상 수집, 69→79개)
  - 단일 선수 테스트: Salah(AM/W), van Dijk(CB) 성공
  - 팀 단위 테스트: Arsenal 10명 전원 성공 (136.5초, 0 실패)
  - DB 검증: 12명 × 79개 메트릭, UPSERT/CASCADE 정상

---

## Phase S3: ScoutLab UI 페이지 구현 — 완료 ✅

- **Task S301: 공통 인프라 — Select 컴포넌트 + 필터 바 + searchParams 유틸** ✅
  - `components/ui/select.tsx` — shadcn Select 컴포넌트 추가
  - `app/(app)/scouting/_lib/scoutlab-search-params.ts` — searchParams 파싱 유틸
  - `app/(app)/scouting/_lib/use-scoutlab-params.ts` — Client URL 갱신 훅
  - `app/(app)/scouting/_lib/format-metric.ts` — 메트릭명 포매팅 (snake_case → Title Case)
  - `app/(app)/scouting/_components/scoutlab-filter-bar.tsx` — 시즌/리그/팀/선수 필터 바
  - `app/(app)/scouting/_components/scoutlab-player-search.tsx` — ScoutLab 선수 검색 Combobox
  - `app/(app)/scouting/_components/scoutlab-mode-toggle.tsx` — P90/Total + Padj./Raw 토글
  - `app/(app)/scouting/_components/scoutlab-position-filter.tsx` — 포지션 세그먼트 필터
  - `components/percentile-bar.tsx` — PercentileBar 공용 위치 이동
  - **테스트 계획:**
    - [✓] Unit: `format-metric.ts` — snake_case→Title Case 변환, 특수 용어(xG, xA) 처리 검증
    - [✓] Unit: `scoutlab-search-params.ts` — 유효/무효 파라미터 파싱, 기본값 처리

- **Task S302: Player Card 페이지 (메인)** ✅
  - `app/(app)/scouting/_components/player-card-header.tsx` — 선수 카드 헤더
  - `app/(app)/scouting/_components/metric-category-table.tsx` — 카테고리별 메트릭 테이블 + 백분위 바
  - Server Component, searchParams → `getScoutlabPlayerById()` + `getScoutlabMetrics()` 병렬 호출
  - **테스트 계획:**
    - [✓] E2E: `/scouting?playerId=1&season=25/26` 접속 → 선수 헤더(이름, 팀, 포지션, 국적) 렌더 확인
    - [✓] E2E: 메트릭 테이블 11개 카테고리 아코디언 노출 확인 + 백분위 바 색상 분기(≥90 green, ≥70 skyblue, ≥50 yellow)
    - [✓] E2E: 존재하지 않는 playerId → 적절한 empty state 표시
    - [✓] Snapshot: player-card-header 컴포넌트 비주얼 리그레션
    - [✓] E2E: Select 드롭다운 열기 → 시즌/리그 변경 시 URL searchParams 반영 확인
    - [✓] E2E: 포지션 필터 클릭 → URL `?position=CB` 갱신 확인
    - [✓] E2E: 모드 토글(P90↔Total, PAdj.↔Raw) → URL 갱신 + 기본값일 때 파라미터 제거 확인

- **Task S303: Summary 페이지** ✅
  - ✅ `app/(app)/scouting/_components/category-percentile-bars.tsx` — 10개 카테고리 평균 백분위 바
  - ✅ 좌 player-card-header + 우 카테고리 진행 바 레이아웃
  - **테스트 계획:**
    - [✓] E2E: `/scouting/summary?playerId=1` → 10개 카테고리 바 렌더 + 각 바 퍼센트 텍스트 확인
    - [✓] E2E: player-card-header 좌측, category-bars 우측 2컬럼 레이아웃 (≥md 브레이크포인트)
    - [✓] E2E: 모바일 뷰포트 → 1컬럼 스택 레이아웃 확인

- **Task S304: Radar 페이지** ✅
  - ✅ `app/(app)/scouting/_components/scoutlab-radar-chart.tsx` — recharts RadarChart (Client)
  - ✅ `app/(app)/scouting/_components/scoutlab-charts.tsx` — dynamic import 래퍼 ("use client" + ssr: false)
  - ✅ 코믹 색상: stroke=comic-skyblue, fill=comic-skyblue/25
  - ✅ 비교 모드 지원: compareAxes prop으로 2중 레이더 오버레이
  - **테스트 계획:**
    - [✓] E2E: `/scouting/radar` (playerId 없음) → empty state "Player Card 탭에서 선수를 선택하세요." 확인
    - [✓] E2E: `/scouting/radar?playerId=1` → 레이더 데이터 미존재 시 "해당 시즌의 레이더 데이터가 없습니다." empty state 확인

- **Task S305: Progression 페이지** ✅
  - ✅ `app/(app)/scouting/_components/progression-chart.tsx` — recharts LineChart (Client)
  - ✅ `app/(app)/scouting/_components/progression-metric-select.tsx` — 카테고리/메트릭 드롭다운
  - ✅ `app/(app)/scouting/_components/progression-view.tsx` — 클라이언트 뷰 (상태관리 + 차트)
  - ✅ x축=시즌, y축=메트릭 값, 카테고리 변경 시 메트릭 자동 초기화
  - **테스트 계획:**
    - [✓] E2E: `/scouting/progression?playerId=1` → PlayerCardHeader + "Season Progression" 제목 + LineChart SVG 렌더 확인
    - [✓] E2E: 카테고리 드롭다운 "Final Product" 기본값 + 메트릭 드롭다운 "Npg + opa" 기본값 확인
    - [✓] E2E: x축 라벨에 시즌 문자열("25/26") 표시 확인

- **Task S306: Action Maps 페이지** ✅
  - ✅ `app/(app)/scouting/_components/pitch-svg.tsx` — SVG 피치 배경 (viewBox 105×68m)
  - ✅ `app/(app)/scouting/_components/action-map-overlay.tsx` — 피치 위 액션 라인 오버레이
  - ✅ `app/(app)/scouting/_components/action-map-grid.tsx` — 3개 피치 그리드 래퍼 + 범례
  - ✅ progressive=핑크, threatening=사이안, 기본=회색
  - **테스트 계획:**
    - [✓] E2E: `/scouting/action-maps?playerId=1` → PlayerCardHeader + "Action Maps" 제목 + empty state "액션맵 데이터가 없습니다." 확인

- **Task S307: Scatter 페이지** ✅
  - ✅ `app/(app)/scouting/_components/scatter-plot.tsx` — recharts ScatterChart (Client)
  - ✅ `app/(app)/scouting/_components/scatter-filter-panel.tsx` — X/Y축 메트릭 선택 + 필터
  - ✅ `app/(app)/scouting/_components/scatter-view.tsx` — 클라이언트 뷰 (상태관리)
  - ✅ 리그별 색상 구분 (5개 리그), 커스텀 Tooltip (선수명, 팀, x/y값)
  - ✅ 버그 수정: 하드코딩된 "goals"/"xag" → sampleMetrics에서 실제 첫 번째 메트릭 키 동적 추출
  - **테스트 계획:**
    - [✓] E2E: `/scouting/scatter` → "Scatter Plot" 제목 + ScatterChart SVG 렌더 확인
    - [✓] E2E: X축 필터 "Final Product"/"Npg + opa", Y축 필터 "Creation"/"Xgchain" 기본값 확인
    - [✓] E2E: 5개 리그 범례 (Premier League, La Liga, Serie A, Bundesliga, Ligue 1) 확인

- **Task S308: Similarity 페이지** ✅
  - ✅ `app/(app)/scouting/_components/similarity-table.tsx` — 유사 선수 테이블
  - ✅ 20명을 2열(10+10) 그리드, #순위 + 선수명 + 팀 + 리그 + 유사도 점수
  - ✅ 상위 3명 bg-comic-yellow/10 강조, empty state 처리
  - **테스트 계획:**
    - [✓] E2E: `/scouting/similarity?playerId=1` → PlayerCardHeader + "Similar Players" 제목 확인
    - [✓] E2E: 데이터 없는 선수 → empty state "유사 선수 데이터 없음" 표시 확인

- **Task S309: Ranking 페이지** ✅
  - ✅ `app/(app)/scouting/_components/ranking-table.tsx` — 랭킹 테이블 + 백분위 배지
  - ✅ `app/(app)/scouting/_components/ranking-filter-panel.tsx` — 카테고리+메트릭 선택 필터
  - ✅ `app/(app)/scouting/_components/ranking-view.tsx` — 클라이언트 뷰 (API 연동)
  - ✅ `app/api/scoutlab/ranking/route.ts` — 메트릭별 랭킹 API 엔드포인트
  - ✅ 상위 3명 bg-comic-yellow/10 강조
  - ✅ 버그 수정: 하드코딩된 `initialMetric = "goals"` → sampleMetrics에서 실제 첫 번째 메트릭 키 동적 추출
  - **테스트 계획:**
    - [✓] E2E: `/scouting/ranking` → "Player Ranking" 제목 + Category 필터 "Final Product" 기본값 확인
    - [✓] E2E: Metric 필터 UI 표시 + empty state "랭킹 데이터가 없습니다." 확인

- **Task S310: Compare 페이지** ✅
  - ✅ `app/(app)/scouting/_components/metric-compare-table.tsx` — 메트릭 나란히 비교
  - ✅ `app/(app)/scouting/_components/scoutlab-compare-search.tsx` — 비교 선수 검색 Combobox
  - ✅ ScoutLab 레이더 차트 2중 오버레이 (skyblue + pink)
  - ✅ 승자 하이라이트 (skyblue=선수A, pink=선수B)
  - ✅ `use-scoutlab-params.ts` — compareId 지원 추가
  - **테스트 계획:**
    - [✓] E2E: `/scouting/compare?playerId=1` → PlayerA 헤더 + GitCompareArrows 아이콘 + "비교 선수를 선택하세요" placeholder 확인
    - [✓] E2E: ScoutlabCompareSearch 검색 입력란 "비교 선수 검색..." 렌더 확인
    - [✓] E2E: `/scouting/compare` (playerId 없음) → empty state "Player Card 탭에서 선수를 선택하세요." 확인

- **Task S311: Glossary 페이지 (독립)** ✅
  - ✅ `app/(app)/scouting/_lib/scoutlab-glossary-data.ts` — 11개 카테고리 × 총 50+ 용어 정의 상수
  - ✅ 11개 카테고리별 그루핑, Card 렌더링 (h2→h3 heading hierarchy)
  - **테스트 계획:**
    - [✓] E2E: `/scouting/glossary` → "Metric Glossary" 제목 + 11개 카테고리 h2 헤딩 표시 확인
    - [✓] E2E: 각 카테고리 내 메트릭 용어(h3) + 한국어 설명 Card 렌더 확인 (총 52개 용어)
    - [✓] Unit: glossary-data.ts — 모든 ScoutlabCategory에 대해 용어 정의가 1개 이상 존재하는지 검증
    - [✓] A11y: 카드 구조 heading hierarchy(h2→h3) 올바른 계층 확인

- **Task S312: 탭 내비게이션 선수 컨텍스트 유지** ✅
  - `scouting-tab-nav.tsx` 수정: useSearchParams로 playerId/season/mode/adj 유지
  - 각 탭 href에 파라미터 append
  - `build-context-query.ts` 유틸 분리 + 유닛 테스트 10개
  - layout.tsx에 Suspense boundary 추가
  - **테스트 계획:**
    - [✓] E2E: `/scouting?playerId=1&season=24/25` 상태에서 Radar 탭 클릭 → URL `/scouting/radar?playerId=1&season=24/25` 유지 확인
    - [✓] E2E: 모든 탭 순회 → playerId + season + mode + adjustment 파라미터가 유실되지 않는지 확인
    - [✓] E2E: 파라미터 없는 초기 상태에서 탭 전환 → 불필요한 빈 파라미터 미추가 확인

**구현 순서 (DAG):**

```
S301 (공통 인프라) ──┬── S302 (Player Card) ──┬── S303 (Summary)
                     │                         ├── S308 (Similarity)
                     │                         └── S310 (Compare)
                     ├── S304 (Radar) ──────────── S305 (Progression)
                     ├── S306 (Action Maps)
                     ├── S307 (Scatter)
                     ├── S309 (Ranking)
                     └── S312 (Tab 컨텍스트)
S311 (Glossary) ──── 독립
```

---

## Phase S4: ScoutLab 데이터 적재 및 통합 테스트 ✅

- **Task S401: DB 데이터 초기화 및 선수 적재** ✅
  - ✅ 기존 scoutlab 테이블 데이터 확인 및 시퀀스 리셋
  - ✅ PL 50명 + La Liga 10명 + Serie A 10명 + Bundesliga 10명 + Ligue 1 10명 = 90명 (25/26 시즌)
  - ✅ Progression 테스트용 24/25 시즌 10명 추가 (Salah, Haaland, Saka, Palmer, Rice 등)
  - ✅ ON CONFLICT (name, team, season) DO UPDATE로 멱등 적재

- **Task S402: 메트릭 데이터 적재 (scoutlab_metrics)** ✅
  - ✅ 100명 × per90/padj 메트릭 (11개 카테고리 × 52개 메트릭 JSONB)
  - ✅ 포지션별 리얼리스틱 데이터 (FBref 기준 value + percentile)
  - ✅ FW: 높은 final_product/shooting, CB: 높은 defending/aerial, MF: 높은 passing/possession

- **Task S403: 레이더 + 액션맵 + 유사 선수 적재** ✅
  - ✅ scoutlab_radar: 100명 × 10축 백분위 (카테고리 평균)
  - ✅ scoutlab_action_maps: 핵심 20명 × 3타입(carries/passes/crosses) = 60행
  - ✅ scoutlab_similarity: 핵심 20명 × 유사 선수 20명 JSONB

- **Task S404: Scatter/Ranking 페이지 playerId 하드코딩 수정** ✅
  - ✅ scatter/page.tsx, ranking/page.tsx의 `getScoutlabMetrics(1, ...)` → `getSampleMetrics()` 동적 조회로 변경
  - ✅ `scoutlab-repository.ts`에 `getSampleMetrics()` 함수 추가 (React cache 래핑)
  - ✅ `ranking-view.tsx` API 쿼리 파라미터 인코딩 개선

- **Task S405: 통합 테스트 (10개 페이지)** ✅
  - ✅ Player Card: 선수 검색 + 11개 카테고리 메트릭 테이블 확인
  - ✅ Summary: 10개 카테고리 백분위 바 렌더링
  - ✅ Radar: 10축 레이더 차트
  - ✅ Progression: 2개 시즌(24/25, 25/26) 라인 차트
  - ✅ Action Maps: 3개 피치 (carries/passes/crosses) 라인 오버레이
  - ✅ Scatter: 90명 산점도 + 리그 색상 구분
  - ✅ Similarity: 20명 유사 선수 테이블
  - ✅ Ranking: 메트릭별 50명 랭킹
  - ✅ Compare: 2선수 레이더 오버레이 + 메트릭 비교
  - ✅ Glossary: 정적 데이터 (DB 무관)
  - ✅ 필터 동작: 리그/포지션/모드 토글 변경 시 데이터 갱신 확인

---

## Phase N1: 5대 리그 데이터 플랫폼 전환 ✅

PL 맨시티 전용 → 5대 리그 데이터 플랫폼으로 피벗. 네비게이션 구조 전면 개편 + Ranking/News 페이지 신설.

- **Task N101: 네비게이션 구조 전면 개편** ✅
  - ✅ `nav-config.ts`: Squad/Compare/Gallery 제거 → Home/Ranking/News 추가 (5개 메뉴)
  - ✅ `app-header.tsx`, `mobile-tab-bar.tsx`: HOME(`/`) 정확한 매칭 isActive 로직
  - ✅ `comic-header.tsx`: 마케팅 헤더 navItems 교체 (HOME/MATCHDAY/RANKING/SCOUTING)

- **Task N102: Ranking 페이지 신설** ✅
  - ✅ `app/(app)/ranking/page.tsx`: Suspense 래핑 서버 컴포넌트
  - ✅ `ranking-content.tsx`: 5대 리그 탭 UI (EPL 활성, 나머지 Coming Soon + Lock 아이콘)
  - ✅ `standings-table.tsx`: EPL 순위표 (#, Team, P, W, D, L, GF, GA, GD, Pts, Form)
  - ✅ 팀 로고, 폼 뱃지(W/D/L), UCL/UEL/강등 색상 하이라이트, 반응형 컬럼
  - ✅ `standing-repository.ts`: `getAllStandings()` 함수 추가

- **Task N103: News 페이지 신설** ✅
  - ✅ `app/(app)/news/page.tsx`: Coming Soon placeholder (Newspaper 아이콘)

- **Task N104: 기존 페이지 삭제 + SEO 리다이렉트** ✅
  - ✅ `app/(app)/gallery/`, `app/(app)/more/`, `app/(app)/compare/`, `app/(app)/squad/` 완전 삭제
  - ✅ `next.config.ts`: 4개 리다이렉트 (/squad→/scouting, /squad/:id→/scouting?playerId=:id, /compare→/scouting/compare, /gallery→/)
  - ✅ `player-name-link.tsx`: `/squad/:id` → `/scouting?playerId=:id` 경로 변경
  - ✅ `sitemap.ts`: /ranking, /scouting, /news 추가, 동적 player routes 제거
  - ✅ `robots.ts`: allow/disallow 갱신

---

## Phase AF: API-Football 마이그레이션 (SportMonks → API-Football) ✅

> **상태**: ✅ 완료 (2026-05-11)
> SportMonks API 토큰 만료 → 무료 API-Football API(100 요청/일)로 전환

| Task | 기능                           | 상태 | 파일                                                      |
| ---- | ------------------------------ | ---- | --------------------------------------------------------- |
| AF01 | 공통 상수 모듈 분리            | ✅   | `lib/constants/football.ts`                               |
| AF02 | DB 마이그레이션 (ID 체계 전환) | ✅   | `supabase/migrations/0007_api_football_migration.sql`     |
| AF03 | API-Football HTTP 클라이언트   | ✅   | `lib/api/api-football/client.ts`                          |
| AF04 | Raw 타입 정의                  | ✅   | `lib/api/api-football/types.ts`                           |
| AF05 | 매퍼 구현                      | ✅   | `lib/api/api-football/mappers.ts`                         |
| AF06 | API 서비스 함수                | ✅   | `lib/api/api-football/{fixtures,players,teams,rounds}.ts` |
| AF07 | 동기화 서비스 업데이트         | ✅   | `lib/services/sync/sync-*.ts`                             |
| AF08 | 라이브 서비스 업데이트         | ✅   | `lib/services/live/live-fixture-service.ts`               |
| AF09 | Cron/디버그 라우트 교체        | ✅   | `app/api/debug/api-football/`                             |
| AF10 | 일일 요청 카운터 + 안전장치    | ✅   | `lib/api/api-football/rate-limiter.ts`                    |
| AF11 | 환경변수 + 레거시 정리         | ✅   | `lib/api/sportmonks/` 삭제                                |
| AF12 | 통합 검증                      | ✅   | validate + build 통과                                     |

---

## Phase N2: 매치데이 5대 리그 확장 ✅

매치데이를 맨시티 전용에서 5대 리그(EPL, La Liga, Serie A, Bundesliga, Ligue 1) 전체 경기 뷰로 확장. 리그 탭 UI + URL 기반 리그 전환 + 리그별 동기화/라이브 서비스.

- **Task N201: 5대 리그 설정 시스템** ✅
  - ✅ `lib/constants/football.ts`: `LeagueSlug` 타입, `LeagueConfig` 인터페이스
  - ✅ `TOP5_LEAGUES` 배열 (id, slug, name, shortName, country, maxRounds, teamsCount)
  - ✅ `LEAGUE_BY_SLUG`, `LEAGUE_BY_ID`, `TOP5_LEAGUE_IDS` 룩업 맵
  - ✅ `DEFAULT_LEAGUE = "epl"`, `LEAGUE_NAME_MAP` 5대 리그 추가

- **Task N202: 매치데이 리그 탭 UI** ✅
  - ✅ `app/(app)/matchday/_components/league-tabs.tsx` 신규: 5대 리그 탭 네비게이션 (코믹 스타일)
  - ✅ `matchday/page.tsx`: `?league=epl&gw=N` URL 구조, `resolveLeague()` 유효성 검증
  - ✅ `gameweek-header.tsx`: `maxRounds`, `leagueSlug` prop 추가 (리그별 최대 라운드 반영)
  - ✅ `matchday-content.tsx`: `leagueSlug` prop 전달
  - ✅ 메타데이터 리그명 반영 (`EPL GW38 Matchday` 등)

- **Task N203: Repository 리그별 필터링** ✅
  - ✅ `fixture-repository.ts`: 맨시티 전용 `.or()` → `league_id` 기반 필터링으로 전환
  - ✅ `getCurrentGameweek(leagueId)`: 리그별 현재 게임위크 감지
  - ✅ `getFixturesByGameweek(gameweek, leagueId)`: 리그별 경기 조회

- **Task N204: API 엔드포인트 리그 지원** ✅
  - ✅ `app/api/matchday/fixtures/route.ts`: `?league=epl&gw=N` 파라미터
  - ✅ 리그 유효성 검증 (`INVALID_LEAGUE` 에러), 리그별 maxRounds 검증
  - ✅ `MatchdayData`에 `leagueSlug`, `maxRounds` 필드 추가

- **Task N205: 라이브 서비스 5대 리그 확장** ✅
  - ✅ `live-fixture-service.ts`: 맨시티 전용 → `TOP5_LEAGUE_IDS` 필터링
  - ✅ `filterLiveByLeague()` 함수 추가 (리그별 라이브 데이터 추출)

- **Task N206: 동기화 + API 함수 리그 파라미터화** ✅
  - ✅ `sync-fixtures.ts`: `syncLeagueFixtures(leagueId)` + `syncAllLeagueFixtures()` (5대 리그 순차)
  - ✅ `getAllSeasonFixtures(leagueId)`, `getFixturesByRound(round, leagueId)` 파라미터 추가
  - ✅ `use-matchday-fixtures.ts`: queryKey에 `leagueSlug` 추가, fetch URL 리그 파라미터 반영
  - ✅ `ranking-content.tsx`: 하드코딩 리그 배열 → `TOP5_LEAGUES` 공유 상수로 전환

---

## Phase FD: football-data.org 마이그레이션 (API-Football → football-data.org) ✅

> **상태**: ✅ 완료 (2026-05-11)
> API-Football(100요청/일) → football-data.org 무료 플랜(10요청/분)으로 전환
> 무료 플랜 제약으로 라이브 스코어, 라인업, 경기 통계, 카드/교체 이벤트 기능 제거

| Task | 기능                                | 상태 | 주요 파일                                                                                       |
| ---- | ----------------------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| FD01 | API 클라이언트 계층 생성            | ✅   | `lib/api/football-data/{client,types,fixtures,teams,standings,scorers,mappers,rate-limiter}.ts` |
| FD02 | 상수 및 환경변수 업데이트           | ✅   | `lib/constants/football.ts`, `.env.local`, `CLAUDE.md`                                          |
| FD03 | 라이브 시스템 전체 제거             | ✅   | `lib/services/live/`, 라이브 컴포넌트 12개 삭제, `types/fixture.ts`                             |
| FD04 | 동기화 서비스 재작성                | ✅   | `lib/services/sync/sync-*.ts`, `db-mappers.ts`                                                  |
| FD05 | DB 마이그레이션 (ID 체계 전환)      | ✅   | `supabase/migrations/0008_football_data_migration.sql`                                          |
| FD06 | API Routes + 디버그 엔드포인트      | ✅   | `app/api/debug/football-data/`, `app/api/matchday/`                                             |
| FD07 | 인프라 설정 (이미지 도메인, CSP)    | ✅   | `next.config.ts` (crests.football-data.org)                                                     |
| FD08 | H2H 서비스 DB 기반 전환             | ✅   | `lib/services/h2h.ts` (API→DB 직접 조회)                                                        |
| FD09 | 레거시 코드 삭제 + ROADMAP 업데이트 | ✅   | `lib/api/api-football/` 삭제, `docs/ROADMAP.md`                                                 |

**주요 변경 사항:**

- 인증: `x-apisports-key` → `X-Auth-Token`
- Rate limit: 100/일 → 10/분 (슬라이딩 윈도우)
- 리그 ID: 숫자(39) → 문자열 코드("PL"), Competition ID(2021)
- 이미지: `media.api-sports.io` (PNG) → `crests.football-data.org` (SVG)
- 경기 상태: 1H/2H/HT/FT/NS → IN_PLAY/PAUSED/FINISHED/SCHEDULED/TIMED/POSTPONED
- 제거 기능: 라이브 스코어, 라인업, 경기 통계(점유율/슈팅), 카드/교체 이벤트, 자동갱신
- Fixture 타입: events→goals, liveStats/lineups/minute 제거, FixtureStatus에서 "LIVE" 제거

---

## Phase HP: 홈페이지 리뉴얼 ✅

홈 화면 비주얼 개선. 종이 질감 배경 + 슬로건 업데이트로 '5대 리그 데이터 허브' 정체성 반영.

- **Task HP01: 종이 질감(Paper Texture) 배경 적용** ✅
  - `globals.css`: `@utility paper-texture` CSS 유틸리티 추가
  - SVG feTurbulence 노이즈 + 미세 수평/수직 라인 패턴으로 종이 질감 구현
  - 다크모드 대응 (`.dark .paper-texture` 별도 색상)
  - `app/(marketing)/page.tsx`: `bg-comic-white` → `paper-texture` 교체
  - `comic-header.tsx`: 헤더 배경 `bg-comic-white` → `bg-transparent` (종이 질감 투과)

- **Task HP02: 슬로건 변경** ✅
  - `comic-header.tsx`: "MAN CITY CARTOON WORLD" → "THE ULTIMATE 5-LEAGUE DATA HUB"
  - 5대 리그 데이터 플랫폼 정체성 반영

---

## Phase RK: Ranking 5대 리그 확장 ✅

Ranking 페이지를 EPL 전용에서 5대 리그(EPL, La Liga, Serie A, Bundesliga, Ligue 1) 순위표로 확장. standings 테이블에 league_id 컬럼 추가 + 리그별 하이라이트 규칙 + 동적 범례.

- **Task RK01: DB 마이그레이션 — standings.league_id 추가** ✅
  - `supabase/migrations/0009_standings_league_id.sql`: `league_id INTEGER NOT NULL DEFAULT 2021` + 인덱스

- **Task RK02: 타입/매퍼 업데이트** ✅
  - `types/team.ts`: `TeamStanding.leagueId` 추가
  - `lib/repositories/mappers.ts`: `StandingRow.league_id` + 매핑
  - `lib/api/football-data/mappers.ts`: `mapFdStandingToTeamStanding(raw, leagueId)` 파라미터
  - `lib/services/sync/db-mappers.ts`: `standingToDbRow`에 `league_id` 포함

- **Task RK03: Sync 서비스 확장** ✅
  - `sync-teams.ts`: `syncStandings(code, leagueId)` + `syncAllLeagueTeams()` 추가
  - `sync/index.ts`: `syncAllLeagueTeams` re-export
  - `app/api/cron/sync-teams/route.ts`: 5대 리그 전체 팀+순위 동기화
  - `app/api/debug/football-data/standings/route.ts`: `?code=PL` 쿼리 파라미터

- **Task RK04: Repository 리그별 순위 조회** ✅
  - `standing-repository.ts`: `getAllLeagueStandings()` → `Map<leagueId, TeamStanding[]>`
  - `lib/repositories/index.ts`: export 추가

- **Task RK05: Ranking 페이지 UI 업데이트** ✅
  - `ranking/page.tsx`: `getAllLeagueStandings()` 사용, `standingsMap` 전달
  - `ranking-content.tsx`: Lock/Coming Soon 제거, 모든 리그 탭 활성화
  - `standings-table.tsx`: `leagueId` prop, 리그별 하이라이트 규칙 (UCL/UEL/UECL/강등PO/강등), 동적 범례

- **Task RK06: 데이터 동기화 + 통합 검증** ✅
  - 5대 리그 전체 동기화: PL(20) + La Liga(20) + Serie A(20) + Bundesliga(18) + Ligue 1(18) = 96행
  - `npm run validate` + `npm run build` 통과
  - **브라우저 테스트 (Playwright):**
    - [✓] EPL 탭: 20팀 순위표, UCL(1-4 파랑) + UEL(5 주황) + 강등(18-20 빨강), 범례 3개
    - [✓] La Liga 탭: 20팀, UCL + UEL + UECL(6 초록) + 강등, 범례 4개 (Conference League 포함)
    - [✓] Serie A 탭: 20팀, UCL + UEL + UECL(6 초록) + 강등, 범례 4개
    - [✓] Bundesliga 탭: 18팀, UCL + UEL + UECL + 강등PO(16 연빨강) + 강등(17-18), 범례 5개
    - [✓] Ligue 1 탭: 18팀, UCL(1-3) + UEL(4) + 강등PO(16) + 강등(17-18), 범례 4개
    - [✓] 탭 전환 시 순위표 + 범례 동적 변경 정상

---

## Phase PD: PL 선수 데이터 동기화 ✅

football-data.org squad 엔드포인트로 PL 20팀의 전체 선수 데이터를 `players` + `scoutlab_players` 테이블에 동기화. Scouting 페이지에서 선수 검색이 가능하도록 기반 데이터 적재.

- **Task PD01: 포지션 매핑 + 시즌 변환 유틸** ✅
  - `lib/constants/football.ts`: `SCOUTLAB_POSITION_MAP` (GK→null, Defence→CB, Midfield→MF, Offence→FW)
  - `lib/constants/football.ts`: `toScoutlabSeason()` ("2025/2026" → "25/26")

- **Task PD02: 나이 계산 유틸** ✅
  - `lib/api/football-data/mappers.ts`: `calculateAge(dateOfBirth)` 함수

- **Task PD03: 선수 동기화 핵심 로직** ✅
  - `lib/services/sync/sync-players.ts`: stub → 실제 구현
  - `getCompetitionTeams("PL")` 1회 호출 → 20팀 ~500명 squad
  - teams 테이블 upsert (FK 보장) → players 테이블 upsert (GK 포함) → scoutlab_players 테이블 upsert (GK 제외)
  - scorers 보강: 등번호 + 출전시간 근사값

- **Task PD04: 디버그 엔드포인트** ✅
  - `app/api/debug/football-data/sync-players/route.ts`: 신규
  - `app/api/debug/football-data/sync/route.ts`: syncPlayers 호출 추가

- **Task PD05: 데이터 동기화 실행 + 검증** ✅
  - 디버그 엔드포인트 호출로 PL 선수 데이터 적재
  - `/scouting` 페이지에서 선수 검색 작동 확인

- **Task PD06: scoutlab_players 중복 방지 로직** ✅
  - 원인: football-data.org 팀명("Liverpool FC")과 스크래퍼 팀명("Liverpool")이 달라 upsert 충돌 키(`name,team,season`)가 중복 미감지
  - DB 정리: 307개 중복 레코드 삭제 + `pitch_ac_player_id` 이관 (626명 → 중복 0)
  - `sync-players.ts`: 동기화 전 기존 선수를 이름 기준으로 조회, 기존 선수는 `pitch_ac_player_id`만 업데이트, 새 선수만 삽입
  - 테스트: 중복 방지 검증 2개 추가 (기존 선수 스킵 / 이미 ID 있으면 업데이트 건너뜀), 7개 전체 통과

---

## Phase S5: ScoutLab 모드 토글 + 포지션 비교 그룹 구현 ✅

P90/Total, Padj./Raw 토글이 실제로 동작하도록 스크래퍼를 확장하고, 포지션 토글을 원본 ScoutLab과 동일한 **비교 그룹 선택기**로 변경. 현재 스크래퍼는 `per90+padj` 1가지 조합만 저장하여 다른 모드 선택 시 데이터 없음. 포지션 토글은 검색 필터로만 동작 중이나, 원본에서는 백분위 비교 대상 그룹을 변경하는 역할.

**배경 (토글 의미):**

- **P90**: 90분당 정규화 수치 / **Total**: 시즌 누적 수치
- **Padj.**: 팀 점유율 보정(Possession-adjusted) / **Raw**: 보정 없는 원본
- **포지션 비교 그룹**: 같은 선수의 원시 값은 동일하되, 선택한 포지션 그룹 대비 백분위만 변경 (예: AM/W 99th → FW 43rd)

- **Task S501: DB 스키마 — comparison_position 컬럼 추가** ✅
  - `supabase/migrations/0010_scoutlab_comparison_position.sql`
  - `scoutlab_metrics`에 `comparison_position TEXT NOT NULL DEFAULT 'AM/W'` 추가
  - CHECK 제약: `('CB', 'FB', 'MF', 'AM/W', 'FW')`
  - 기존 UNIQUE 제약 삭제 → `UNIQUE (player_id, season, mode, adjustment, comparison_position)` 재생성
  - 기존 데이터: 선수 실제 포지션값으로 `comparison_position` 업데이트

- **Task S502: 스크래퍼 — mode/adjustment 토글 지원** ✅
  - `scripts/scraper/lib/navigation.ts`: `toggleMode()`, `toggleAdjustment()` 함수 추가
  - Streamlit segmented control 선택자: `[data-testid="stBaseButton-segmented_control"]`
  - 각 토글 후 `waitForStreamlitUpdate()` 호출
  - `scripts/scraper/lib/db.ts`: `upsertMetrics()`에 `mode`, `adjustment`, `comparisonPosition` 파라미터 추가
  - `onConflict`를 `"player_id,season,mode,adjustment,comparison_position"`으로 변경

- **Task S503: 스크래퍼 — 포지션 비교 그룹 토글 지원** ✅
  - `scripts/scraper/lib/navigation.ts`: `toggleComparisonPosition()` 함수 추가
  - 5개 포지션 그룹 순회: CB, FB, MF, AM/W, FW
  - `scripts/scraper/main.ts`: 메인 루프를 4(mode×adj) × 5(position) = 20 조합 순회로 확장
  - CLI 옵션 추가: `--mode=per90`, `--adjustment=padj`, `--skip-positions` (점진적 스크래핑)

- **Task S504: 타입 & 상수 업데이트** ✅
  - `types/scoutlab.ts`: `ScoutlabComparisonPosition` 타입 추가
  - `app/(app)/scouting/_lib/scoutlab-constants.ts`: `VALID_COMPARISON_POSITIONS`, `COMPARISON_POSITION_LABELS` 추가
  - 포지션 라벨: CB→"Centre-Backs", FB→"Full-Backs", MF→"Midfielders", AM/W→"Att Mid/Wingers", FW→"Forwards"

- **Task S505: 프론트엔드 — 포지션 토글을 비교 그룹 선택기로 변경** ✅
  - `scoutlab-search-params.ts`, `use-scoutlab-params.ts`: `comparisonPosition` 파라미터 추가
  - `scoutlab-position-filter.tsx`: 5개 포지션 그룹(CB/FB/MF/AM·W/FW)으로 변경, `comparisonPosition` 설정
  - `scoutlab-repository.ts`: `getScoutlabMetrics()`에 `comparisonPosition` 파라미터 추가
  - `scouting/page.tsx`: 검색에서 position 필터 제거, comparisonPosition을 메트릭 조회에 전달
  - 기본값: 선수 자신의 포지션 (미선택 시)

- **Task S506: 프론트엔드 — 비교 그룹 서브타이틀 + 하위 페이지 대응** ✅
  - `player-card-header.tsx` 또는 `metric-category-table.tsx`: "PERCENTILE VS [POSITION] · BIG 5 LEAGUES · PER 90 MINUTES" 서브타이틀 추가
  - mode="total" 시 "PER 90 MINUTES" → "TOTAL" 변경
  - `scouting/summary/page.tsx`, `scouting/compare/page.tsx`: comparisonPosition 전달

- **Task S507: 데이터 스크래핑 실행 + 검증** ✅
  - 스크래퍼 버그 수정 2건:
    - Streamlit segmented control `data-testid` 변경 대응 (`stBaseButton-segmented_controlActive`)
    - `"ACTIVE DEFENDING (RAW)"` 카테고리 매핑 추가 (Raw 모드 수비 메트릭 누락 수정)
  - **Salah 단건 테스트**: 20개 조합(2×2×5) 전원 성공, 검증 통과
    - P90 vs Total: ✅ P90=소수점(0.31), Total=큰 정수(7.1)
    - Padj vs Raw: ✅ 수비 메트릭 값+백분위 차이 확인
    - 포지션 비교: ✅ 원시값 동일, 백분위만 변경 (CB=100, FW=56)
  - **PL 전체 스크래핑 완료** (4개 mode×adjustment 조합, `--skip-positions`):
    - per90+raw: 359/359명 성공 (78분)
    - total+padj: 359/359명 성공 (77분)
    - total+raw: 359/359명 성공 (77분)
    - 총 1,077건 신규, 실패 0건, 총 소요 3시간 52분
  - **DB 현황**: scoutlab_metrics 1,452건 (per90+padj 기존 363건 + 신규 1,089건)
  - 포지션별 비교 그룹 스크래핑 코드 준비 완료 (Task S508에서 구현)

- **Task S508: 포지션 비교 그룹 + Similarity 스크래퍼 확장** ✅
  - ✅ `scripts/scraper/lib/types.ts`: `positions?: string[]`, `similarityOnly: boolean`, `ParsedSimilarPlayer.score?: number` 추가
  - ✅ `scripts/scraper/main.ts`: `--positions=CB,FB,MF,FW` CLI 플래그 (유효성 검증), `--similarity-only` 모드
  - ✅ `scripts/scraper/main.ts`: `scrapeSimilarity()` — Similarity Score 탭 전환 방식으로 1회 수집, `scrapePlayer()` 래퍼
  - ✅ `scripts/scraper/main.ts`: `scrapeAllCombinations()` positions 우선순위 (`--positions` > `--skip-positions` > 전체)
  - ✅ `scripts/scraper/lib/parsers.ts`: `parseSimilarPlayersFromTab()` — Similarity Score 탭 2열 div 구조 파싱 (20명 + 실제 점수)
  - ✅ `scripts/scraper/lib/db.ts`: `upsertSimilarity()` score 실제값 저장 (`s.score ?? 0`)
  - ✅ 기존 `parseAndSave()`에서 Player Card 하단 Top 5 파싱 로직 제거 (탭 전환으로 대체)
  - **단건 테스트 3명 성공:**
    - Salah(AM/W): 20명 파싱, score 91%~88%, DB 저장 + 프론트엔드 정상
    - Palmer(AM/W): 20명 파싱, score 94%~91%, DB 저장 + 프론트엔드 정상
    - Van Dijk(CB): 20명 파싱, score 93%~86%, DB 저장 + 프론트엔드 정상
  - **사용법:**
    ```bash
    npm run scrape:scoutlab -- --positions=CB,FB,MF,FW --mode=per90 --adjustment=padj
    npm run scrape:scoutlab -- --similarity-only
    npm run scrape:scoutlab -- --similarity-only --player="Mohamed Salah" --dry-run
    ```

- **E2E 브라우저 테스트: 12/12 통과** ✅
  - `e2e/scoutlab-s5.spec.ts`: S501(3개), S504(1개), S505(3개), S506(5개) — Playwright chromium
  - DB 마이그레이션 `0010_scoutlab_comparison_position.sql` 적용 완료

---

## Phase HP2: 홈 화면 리디자인 — 5대 리그 데이터 허브 ✅

맨시티 전용 하드코딩 홈 화면을 5대 리그 데이터 허브 홈으로 전면 리디자인. 실제 DB 데이터 연동 + Suspense 기반 async 서버 컴포넌트.

- **Task HP201: 메타데이터 + 헤더/푸터 업데이트** ✅
  - ✅ `layout.tsx`: title "Man City Fan Site" → "5-League Football Data Hub", description/keywords 5대 리그 키워드, locale `ko_KR`
  - ✅ `comic-header.tsx`: MATCHDAY sub "LIVE!" → "TODAY" (라이브 기능 제거됨)
  - ✅ `comic-footer.tsx`: "CITY! / EST. 1894" → "DATA / 5 LEAGUES"

- **Task HP202: 공유 컴포넌트 이동** ✅
  - ✅ `CompetitionBadge`, `FixtureStatusBadge` → `components/football/`로 이동
  - ✅ matchday fixture-card.tsx, match-header.tsx import 경로 업데이트
  - ✅ 기존 matchday 내부 파일 삭제

- **Task HP203: 홈 페이지 async 서버 컴포넌트 전환** ✅
  - ✅ `page.tsx`: Suspense 래핑 + `HomeContent` 분리 (connection() + getTodayDateKey)
  - ✅ `home-content.tsx`: DB 데이터 fetch (getFixturesByDate, getAllLeagueStandings, getTeamsByIds 병렬)
  - ✅ `home-content-skeleton.tsx`: 로딩 스켈레톤 UI
  - ✅ Next.js 16 prerender 규칙 준수 (connection() → Suspense 내부)

- **Task HP204: 6패널 그리드 컴포넌트 구현** ✅
  - ✅ `hero-banner.tsx`: 상단 히어로 (경기 카운트 동적, 경기 없는 날 "REST DAY!")
  - ✅ `today-matches-panel.tsx` + `mini-fixture-card.tsx`: 오늘 경기 목록 (최대 6개, 빈 상태 처리)
  - ✅ `league-leaders-panel.tsx`: 5대 리그 각 1위 팀 (로고+팀명+승점, standings 없으면 COMING SOON)
  - ✅ `top-scorers-panel.tsx`: PL 득점 TOP 3 (Suspense 분리, API 실패 시 폴백 UI, 1시간 캐시)
  - ✅ `scoutlab-spotlight.tsx`: ScoutLab 기능 소개 (정적, RADAR/COMPARE/SCATTER)
  - ✅ `quick-links-panel.tsx`: Matchday/Ranking/ScoutLab 빠른 링크
  - ✅ `cta-banner.tsx`: 하단 CTA (동적 문구, 경기 유무에 따라 변경)
  - ✅ `comic-home-content.tsx`: 전체 그리드 조립 (히어로 → 2열 → 3열 → CTA)

- **Task HP205: 기존 코드 정리** ✅
  - ✅ `comic-home.tsx` 삭제 (PlayerBadge, StatCard, ActionBadge, FormationMarker 포함)
  - ✅ 맨시티 하드코딩 콘텐츠 전체 제거 (Etihad Stadium, Haaland 스탯, Man City vs United)

- **브라우저 테스트** ✅
  - ✅ 데스크탑: 6패널 그리드 정상 렌더링, 실제 DB 데이터 표시 (ARS, FCB, INT 등)
  - ✅ 모바일 (375px): 1열 풀폭 스택 레이아웃 정상
  - ✅ 콘솔 에러 0개 (connection() + Suspense로 prerender 경고 해결)
  - ✅ `npm run validate` (type-check + lint + format) 통과

---

## Phase S6: ScoutLab 5대 리그 확장 — 진행 중

"5-League Data Hub"를 표방하면서 PL만 있는 현재 상태 해소. 5대 리그 전체 `--match-position` 스크래핑 (메트릭 + Similarity 동시 수집).

- **Task S600: 프론트엔드 리그 필터 버그 수정** ✅
  - 커밋 `5da2f72`

- **Task S600-b: --match-position 플래그 구현** ✅
  - 선수 본인 포지션 자동 감지 → 해당 포지션 비교 그룹만 스크래핑
  - 커밋 `4248d6c`

- **Task S601: La Liga 전체 스크래핑** ✅
  - `npm run scrape:scoutlab -- --league="La Liga" --match-position`
  - 393명, 1,572건, 실패 0

- **Task S602: Serie A 전체 스크래핑** ✅
  - `npm run scrape:scoutlab -- --league="Serie A" --match-position`
  - 141명, 552건, 1차 실패 37명 → 재시도 전원 성공, 중복 0

- **Task S603: Bundesliga 전체 스크래핑**
  - `npm run scrape:scoutlab -- --league="Bundesliga" --match-position`
  - 사전 준비: 기존 AM/W 메트릭 DELETE 후 실행
  - 예상: ~300명 (18팀), ~3.5시간

- **Task S604: Ligue 1 전체 스크래핑**
  - `npm run scrape:scoutlab -- --league="Ligue 1" --match-position`
  - 사전 준비: 기존 AM/W 메트릭 DELETE 후 실행
  - 예상: ~300명 (18팀), ~3.5시간

- **Task S605: PL 재스크래핑 (AM/W → match-position 전환)** ✅
  - `npm run scrape:scoutlab -- --league="Premier League" --match-position`
  - 기존 AM/W 단일 포지션 → 선수 본인 포지션 기준으로 전환
  - 314명 1차 스크래핑 → 53명 실패(Arsenal/Brentford/Man City 팀 단위) → 재시도 전원 성공
  - 최종: 358명, 1,297건, 포지션 분포 AM/W 84 · MF 87 · CB 77 · FB 66 · FW 44
  - 수동 테스트 잔여 데이터(Salah·Alcaraz) 정리 완료, 중복 0

- **Task S605-b: 구 데이터 클린업 + comparisonPosition 자동 설정** ✅
  - football-data.org 명칭("Manchester City FC" 등)으로 된 메트릭 없는 고아 선수 287명(PL 283 + Serie A 4) 삭제
  - 선수 선택 시 `comparisonPosition`을 선수 실제 포지션 기반으로 자동 매핑 (CB→CB, FB→FB 등)
  - `positionToComparisonPosition()` 헬퍼 + `isComparisonPositionExplicit` 플래그 추가
  - 메인 page.tsx + summary/progression/compare 4개 페이지 일괄 적용
  - `scoutlab_players.position` 불일치 46명(PL 45 + Serie A 1) 일괄 수정 — metrics.comparison_position 기준
  - 팀 필터 리그 연동: `teamsByLeague` 맵 방식으로 클라이언트사이드 즉시 필터링
  - 리그 변경 시 팀 선택 자동 초기화

- **Task S606: Similarity 보완 수집** (S601~S605에서 대부분 수집 완료)
  - `--match-position`이 메트릭 + Similarity 동시 수집하므로 별도 수집은 누락분만 대상
  - `--similarity-only` 플래그로 누락 선수만 보완

- **Task S607: 데이터 검증 + Scatter/Ranking 통합 테스트**
  - 5대 리그 선수 데이터가 Scatter/Ranking/Compare에서 정상 표시되는지 확인
  - 리그별 선수 수, 메트릭 완성도, 포지션 분포 점검

---

## Phase S7: Action Maps 스크래퍼 + 필터 보강 — 예정

ScoutLab의 Action Maps 탭은 피치 위 라인 좌표 데이터로, 메트릭에서 파생 불가한 고유 데이터. 스크래퍼 신규 구현 + Scatter/Ranking 필터 보강으로 ScoutLab 원본 수준의 UX 달성.

- **Task S701: Action Maps 스크래퍼 구현**
  - `scripts/scraper/lib/parsers.ts`: Action Maps 탭 DOM 파싱 (carries/passes/crosses 라인 좌표)
  - `scripts/scraper/lib/db.ts`: `upsertActionMaps()` — scoutlab_action_maps 테이블 저장
  - `scripts/scraper/main.ts`: `--action-maps-only` CLI 모드 추가
  - Streamlit 피치 SVG 좌표계 → 105×68m 정규화 매핑

- **Task S702: Action Maps PL 전체 수집**
  - PL 359명 × 3타입(carries/passes/crosses) = ~1,077행
  - 예상: ~6시간

- **Task S703: Action Maps 5대 리그 수집**
  - 나머지 4개 리그 순차 실행
  - 예상: ~20시간

- **Task S704: Scatter 필터 보강**
  - Minutes 필터 (≥900분, ≥450분) 추가
  - Age 필터 (U21, U23, U25) 추가
  - Show Top Players 토글 추가
  - 리그 로고 필터 버튼 추가

- **Task S705: Ranking 필터 보강**
  - Minutes 필터, Age 필터, 리그 로고 필터 추가
  - Scatter와 동일한 필터 컴포넌트 공유

- **Task S706: Player Card UI 디테일**
  - "% Min as Starter" 메트릭 표시
  - 서브카테고리 헤더 (Shot Creation, Quality of Chances, Via Carries 등) 구현

---

## Phase S8: 멀티시즌 + Share as Image — 예정

Progression 탭 본격 활용을 위한 멀티시즌 데이터 확장 + 바이럴 잠재력을 위한 이미지 공유.

- **Task S801: 24/25 시즌 PL 전체 스크래핑**
  - 현재 10명만 → 전체 확장
  - 예상: ~4시간

- **Task S802: 24/25 시즌 5대 리그 스크래핑**
  - 4개 리그 순차 실행
  - 예상: ~16시간

- **Task S803: 포지션 비교 그룹 전체 스크래핑**
  - PL 25/26 기준 5개 포지션 그룹 × 4개 mode×adj = 20조합 전체
  - `npm run scrape:scoutlab -- --positions=CB,FB,MF,FW` (AM/W 기본 제외)
  - 예상: ~16시간

- **Task S804: Share as Image 구현**
  - 각 탭(Player Card, Summary, Radar, Compare)에서 현재 뷰를 이미지로 생성
  - satori 또는 html-to-image 기반
  - pitch-ac 브랜딩 워터마크 포함
  - Web Share API (모바일) + 다운로드 버튼

- **Task S805: Progression 통합 테스트**
  - 멀티시즌 데이터로 Progression 차트 검증
  - 시즌 간 메트릭 변화 추이 정상 표시 확인

---

## Phase UX1: ScoutLab 한국어 맥락 부연 + 팝오버 ✅

> **목표**: ScoutLab의 모든 메트릭에 한국어 맥락 부연 + 팝오버 상세 해설 추가. 영어 메트릭명은 유지하되, 번역체가 아닌 자연스러운 맥락적 설명으로 접근성 향상.
> **참고**: docs/adr/0001-page-architecture-redesign.md

- **Task UX101: Glossary 데이터 한국어 리라이트** ✅
  - ✅ `ScoutlabGlossaryTerm` 인터페이스 확장 (brief, example 필드 추가)
  - ✅ 실제 DB 메트릭 키(UPPER CASE) 79개에 맞춰 brief + description + example 전면 재작성
  - ✅ `SCOUTLAB_GLOSSARY_MAP` 파생 맵 추가 (O(1) 키 조회)

- **Task UX102: 메트릭 한국어 부연 표시 시스템** ✅
  - ✅ `format-metric.ts`에 `getMetricBrief()`, `formatMetricLabel()` 추가
  - ✅ 7개 컴포넌트에 `formatMetricLabel` 적용 (ranking-view, ranking-filter-panel, scatter-view, scatter-filter-panel, metric-compare-table, progression-view, progression-metric-select)
  - ✅ Player Card 메트릭 행에 한국어 brief 병기 (`metric-row.tsx` 분리)

- **Task UX103: 팝오버 상세 해설 컴포넌트** ✅
  - ✅ `metric-popover.tsx` 신규 생성 (CircleHelp 아이콘 + Radix Popover)
  - ✅ `metric-row.tsx` Client Component 분리 (MetricPopover 포함)
  - ✅ metric-compare-table, ranking-table 헤더에 팝오버 적용
  - ✅ Glossary 페이지 리디자인 (brief 뱃지 + 풍부한 description + example)

---

## Phase UX2: ScoutLab 코믹 차트 디자인 ✅

> **목표**: ScoutLab의 recharts 차트 내부까지 코믹 디자인 시스템 적용. 데이터 로직은 변경 없이 순수 시각적 변경만.

- **Task UX201: 레이더 차트 코믹화** ✅
  - ✅ `scoutlab-radar-chart.tsx`: 코믹 색상 팔레트(comic-skyblue, comic-yellow 등)
  - ✅ 배경에 종이 질감 오버레이
  - ✅ 툴팁을 말풍선 스타일로 변경
  - ✅ 비교 모드 색상: comic-skyblue vs comic-pink

- **Task UX202: 산점도 코믹화** ✅
  - ✅ `scatter-plot.tsx`: 리그별 코믹 컬러, 커스텀 Tooltip 말풍선 스타일
  - ✅ 배경 종이 질감, 축 라벨 코믹 폰트

- **Task UX203: 라인 차트(Progression) 코믹화** ✅
  - ✅ `progression-chart.tsx`: 코믹 색상 라인, 종이 질감 배경
  - ✅ 데이터 포인트 코믹 스타일 마커

- **Task UX204: 공통 차트 테마 유틸** ✅
  - ✅ `scouting/_lib/chart-theme.ts`: 코믹 차트 공통 색상/폰트/스타일 상수
  - ✅ 모든 차트 컴포넌트에서 import하여 일관성 유지
  - ✅ 색상 대비(contrast) 접근성 검증

---

## Phase MD: MATCHDAY 자동 동기화 ✅

> **목표**: 경기 결과가 수동 동기화 없이 자동 반영되도록 킥오프+2.5h 오프셋 기반 Cron 구현.
> **참고**: docs/adr/0002-matchday-auto-sync.md

- **Task MD101: 스케줄 판단 로직** ✅
  - ✅ `lib/services/sync/schedule-calculator.ts`: `getPendingResultLeagues()` 구현
  - ✅ DB에서 `status='NS' AND date < now()-2.5h` 경기의 league_id 조회 → LeagueConfig[] 반환
  - ✅ 빈 배열 = 동기화 불필요 → cron 조기 종료 (0 API 호출)

- **Task MD102: sync-results Cron 라우트** ✅
  - ✅ `app/api/cron/sync-results/route.ts`: 결과 동기화 전용 엔드포인트
  - ✅ `getPendingResultLeagues()` → 빈 배열이면 skipped 반환, 있으면 리그별 fixtures+standings 순차 동기화
  - ✅ `writeSyncLog()` 요약 로그 (`entity: "sync-results-cron"`)
  - ✅ `maxDuration = 120` (최악 5리그 × 2 API, rate limiter 대기 포함)

- **Task MD103: sync-fixtures 5대 리그 확장 + vercel.json** ✅
  - ✅ `sync-fixtures` 라우트: `syncFixtures()` → `syncAllLeagueFixtures()` (PL만 → 5대 리그)
  - ✅ `vercel.json`: sync-fixtures 04:00 UTC, sync-results 13:00~23:00 UTC 매시간 (11회/일)
  - ✅ DB 부분 인덱스: `idx_fixtures_status_date ON fixtures(status, date) WHERE status='NS'`

---

## Phase HP3: HOME 패널 재구성 ✅

> **목표**: HOME을 5대 리그 허브답게 재구성. 6패널 → 4패널 (Hero, 경기, 순위, QuickLinks, CTA).

- **Task HP301: 기존 패널 정리** ✅
  - ✅ LeagueLeadersPanel 제거 (Ranking 페이지와 중복)
  - ✅ TopScorersPanel 제거 (PL 한정)
  - ✅ ScoutlabSpotlight 제거 (정적 소개)

- **Task HP302: "5대 리그 순위 한눈에" 패널** ✅
  - ✅ `league-standings-panel.tsx` 신규 (Client Component, 탭 전환)
  - ✅ 5개 리그 탭: EPL/LaLiga/Serie A/BuLi/Ligue 1, 각 상위 7팀
  - ✅ 승점 바 시각화 + 1위 대비 차이 표시
  - ✅ FULL STANDINGS → `/ranking?league={slug}` 링크

- **Task HP303: "이번 라운드/오늘 경기" 패널 통합** ✅
  - ✅ `round-matches-panel.tsx` 신규 (today-matches-panel 대체)
  - ✅ 오늘 경기 있으면 → MiniFixtureCard, 없으면 → 다음 라운드 미리보기
  - ✅ `home-content.tsx`에서 `getCurrentGameweek` + `getFixturesByGameweek` 추가
  - ✅ `collectTeamIds` 상위 7팀 확장, QuickLinks 가로 3열, 스켈레톤 갱신

---

## Phase SB: 접이식 사이드바 네비게이션 ✅

> **목표**: 데스크탑 좌측에 접이식 사이드바 추가. 리그 바로가기, 대회 placeholder, 스카우팅 서브탭을 보조 네비로 제공. 메인 5개 메뉴는 헤더에만 유지.

- **Task SB01: shadcn/ui Sidebar 설치 + CSS 변수** ✅
  - ✅ `npx shadcn@latest add sidebar tooltip` — sidebar, sheet, skeleton, tooltip 컴포넌트 설치
  - ✅ `globals.css`: sidebar CSS 변수를 코믹 테마로 재정의 (라이트/다크)
  - ✅ `@theme inline`에 `--color-sidebar-*` Tailwind v4 매핑 추가

- **Task SB02: Scouting 탭 설정 추출** ✅
  - ✅ `components/nav/scouting-tabs-config.ts` 신규 — 10개 탭 공유 설정 분리
  - ✅ `scouting-tab-nav.tsx`에서 공유 config import 전환

- **Task SB03: Sidebar 설정 + AppSidebar 컴포넌트** ✅
  - ✅ `components/nav/sidebar-config.ts` 신규 — 5대 리그 링크 (emblem URL + flag), 대회 placeholder (UCL/UEL/UECL disabled)
  - ✅ `components/nav/app-sidebar.tsx` 신규 — `collapsible="icon"`, 커스텀 접기 버튼 (ChevronsLeft/Right)
  - ✅ LEAGUES 그룹: competition emblem + shortName, `/ranking?league={slug}` 링크
  - ✅ TOURNAMENTS 그룹: 점선 보더 + "Soon" 배지
  - ✅ SCOUTING 그룹: `/scouting` 경로에서만 조건부 표시, `buildContextQuery` 활용
  - ✅ 코믹 스타일: Bangers 그룹 라벨, 2px 보더 + shadow 활성 상태, SidebarSeparator 구분선
  - ✅ SidebarFooter에 ThemeSwitcher 배치

- **Task SB04: 레이아웃 리팩토링** ✅
  - ✅ `app/(app)/layout.tsx`: SidebarProvider + AppSidebar + SidebarInset 구조
  - ✅ `app/(marketing)/layout.tsx`: SidebarProvider + AppSidebar 추가
  - ✅ `app-header.tsx`: ThemeSwitcher 모바일 전용 (`md:hidden`)
  - ✅ `scouting/layout.tsx`: 수평 탭 바 모바일 전용 (`md:hidden`)

- **Task SB05: Ranking query parameter 지원** ✅
  - ✅ `ranking-content.tsx`: `searchParams.get("league")` 읽어서 초기 탭 설정
  - ✅ 사이드바 `/ranking?league=laliga` 클릭 시 해당 탭 활성화

- **Task SB06: 사이드바 디자인 개선** ✅
  - ✅ `SidebarSeparator` → `FadeDivider` 그라데이션 구분선 교체 (양 끝 투명 페이드)
  - ✅ 사이드바 헤더에서 로고 제거 (헤더와 중복 방지)
  - ✅ 접기/펼치기 토글 버튼 오른쪽 정렬
  - ✅ 사이드바 우측 border를 검은 실선에서 그라데이션 페이드로 교체
  - ✅ 토글 버튼·아이콘 크기 미세 조정

- **Task SB07: 모바일 상단 바 추가** ✅
  - ✅ `components/nav/mobile-top-bar.tsx` 신규 — 모바일 전용 상단 바 (`md:hidden`)
  - ✅ 로고 + ThemeSwitcher + AuthButton 표시 (데스크탑 헤더 숨김 시 대체)
  - ✅ `app/(app)/layout.tsx`에 MobileTopBar 통합

- **Task SB08: 헤더·사이드바 UX 안정화** ✅
  - ✅ `app-header.tsx`: ThemeSwitcher `md:hidden` 제거 → 데스크탑에서도 테마 버튼 표시
  - ✅ `app-header.tsx`: 우측 영역 `shrink-0`, 로고 `whitespace-nowrap` — 로그인 시 레이아웃 깨짐 방지
  - ✅ `(marketing)/page.tsx`: `authSlot={null}` → `AuthButton` 전달 — 홈 페이지 로그인 버튼 복원
  - ✅ `auth-button.tsx`: 로그인 상태 이메일 `max-w-[120px] truncate` 컴팩트화, `LogoutButton` size="sm"
  - ✅ `app-sidebar.tsx`: SidebarFooter ThemeSwitcher 제거 — 상단 헤더에만 테마 버튼 유지
  - ✅ `app-sidebar.tsx`: Scouting 서브탭 조건부 표시(`isScouting`) 제거 → 모든 페이지에서 표시
  - ✅ `scouting/layout.tsx`: 수평 탭 바 `md:hidden` 제거 → 데스크탑에서도 상단 탭 + 사이드바 공존

---

## Phase HP4: 홈 UI 컴팩트화 + 테마 스위처 간소화 ✅

> **목표**: 홈 화면 패널·카드·테이블이 과도하게 크므로 전체적으로 축소. 테마 스위처에서 불필요한 system 옵션 제거.

- **Task HP401: 코믹 디자인 토큰 축소** ✅
  - ✅ `globals.css`: border 3px→2px, border-thin 2px→1px
  - ✅ `globals.css`: panel gap 16px→10px, padding 24px→14px
  - ✅ `globals.css`: 텍스트 토큰 ~15% 축소 (text-2xl 30→26px, text-lg 20→18px 등)
  - ✅ `globals.css`: body 텍스트 동일 비율 축소 (body-base 14→13px 등)
  - ✅ 라이트/다크 모드 양쪽 동일 적용

- **Task HP402: 홈 컴포넌트 내부 간격 축소** ✅
  - ✅ `comic-panel.tsx`: 패널 타이틀 mb-3/pb-3 → mb-2/pb-2, 대제목 mb-4 → mb-2
  - ✅ `mini-fixture-card.tsx`: 카드 px-3/py-2 → px-2/py-1.5, gap-3→2, 로고 24→20px
  - ✅ `round-matches-panel.tsx`: 카드 간격 space-y-2→1.5, 하단 링크 mt-3→2
  - ✅ `league-standings-panel.tsx`: 테이블 셀 px-3/py-2 → px-2/py-1.5, 탭 간격 mb-3→2
  - ✅ `news-placeholder.tsx`: py-8→4, COMING SOON text-2xl→xl, 버튼 패딩 축소
  - ✅ `best-eleven-placeholder.tsx`: py-8→4, COMING SOON text-2xl→xl

- **Task HP403: 테마 스위처 간소화** ✅
  - ✅ `theme-switcher.tsx`: 드롭다운(light/dark/system) → 토글 버튼(light↔dark)
  - ✅ system 옵션 제거, Laptop 아이콘·DropdownMenu 임포트 제거

---

## Phase RK2: RANKING + MATCHDAY UCL Champions League 확장 ✅

> **목표**: Ranking 페이지에 UCL 탭 추가 (36팀 리그 페이즈 순위표), Matchday에 UCL 경기 통합 표시.
> UEL/UECL은 football-data.org 유료 티어이므로 제외.

- **Task RK201: DB 마이그레이션 + 상수 확장** ✅ - 완료
  - ✅ `0012_ucl_standings_unique.sql`: standings UNIQUE 제약 `(team_id, season)` → `(team_id, season, league_id)`
  - ✅ `CompetitionSlug` 타입, `UCL_CONFIG`, `ALL_COMPETITIONS`, `ALL_COMPETITION_IDS`, `COMPETITION_BY_ID/SLUG` 추가
  - ✅ 기존 `TOP5_LEAGUES`, `LEAGUE_BY_SLUG`, `LEAGUE_BY_ID` 하위 호환 유지

- **Task RK202: UCL 순위표 UI + Matchday 통합** ✅ - 완료
  - ✅ `standings-table.tsx`: UCL 존 규칙 (1-8 R16 직행/blue, 9-24 Playoff/amber, 25-36 Eliminated/gray) + 전용 범례
  - ✅ `ranking-content.tsx`: `ALL_COMPETITIONS` 기반 UCL 탭 추가
  - ✅ `fixture-repository.ts`: `getFixturesByDate()` → `ALL_COMPETITION_IDS` (UCL 경기 포함)
  - ✅ `matchday/_utils.ts`: `groupFixturesByLeague()` → `ALL_COMPETITIONS` 순서 유지
  - ✅ `standing-repository.ts`: `getStandingsByTeamIds()` → `TOP5_LEAGUE_IDS` 필터 (UCL standings 덮어쓰기 방지)

- **Task RK203: 동기화 시스템 + 사이드바** ✅ - 완료
  - ✅ `sync-teams.ts`: `syncAllLeagueTeams/Standings()` → `ALL_COMPETITIONS`, onConflict 키 변경
  - ✅ `sync-fixtures.ts`: `syncAllLeagueFixtures()` → `ALL_COMPETITIONS` (6 API 요청)
  - ✅ `schedule-calculator.ts`: `LEAGUE_BY_ID` → `COMPETITION_BY_ID`
  - ✅ 사이드바 UCL 항목 활성화 (`href: "/ranking?league=ucl"`), UEL/UECL은 `disabled` 유지

- **Hotfix RK2-01: UCL 데이터 동기화 수정** ✅ - 2026-05-25
  - ✅ Supabase에 `0012_ucl_standings_unique.sql` 마이그레이션 적용 (standings UNIQUE 제약 변경)
  - ✅ `sync-fixtures.ts`: `gameweek === null` 필터 제거 — UCL 결승(matchday=null) 동기화 허용
  - ✅ football-data.org 무료 플랜 UCL 지원 확인 (TIER_ONE, 순위 36팀 + 경기 189개)
  - ✅ 전체 동기화 실행 완료 (fixtures 6대회 + standings 6대회)

---

## Phase RK3: RANKING 선수 순위 — 예정 (우선순위 5, 데이터 적재 후)

> **목표**: 득점왕/어시왕/공격포인트/클린시트 등 주요 스탯별 선수 순위 표시.
> **전제**: ScoutLab 5대 리그 데이터 적재 완료 (Phase S6)

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

---

## Phase MP: MATCHDAY 매치픽 — 예정 (우선순위 6)

> **목표**: 유저가 경기 결과를 예측하는 참여형 콘텐츠. 경기 상세 페이지 하위 기능.
> **전제**: 인증(F216) 구현 완료 (이미 있음)

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

---

## Phase NW: NEWS 이적뉴스 큐레이션 — 완료 ✅

> **목표**: 해외축구 이적 뉴스를 소스 유형별로 태깅하여 소셜 피드 형태로 제공. 원본 소스(트윗/기사/영상)로 직접 연결하는 큐레이션 허브.
> **핵심 전략**: 로컬 스크립트로 주기적 크롤링 → DB 저장 → API로 서빙. 소스 링크 있는 글만 자동 수집, 링크 없는 양질의 번역글은 수동 추가.
> **데이터 소스**: 에펨코리아 해외축구 게시판 정보/SNS 카테고리 (Playwright + cheerio HTML 파싱)
> **원칙**: 에펨코리아는 데이터 소스일 뿐, 유저에게 출처를 노출하지 않음. 본문 저장 안 함 (저작권 리스크 회피).

### 설계 결정 사항

| 항목               | 결정                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **소스 태그**      | `tweet` · `article` · `video` · `summary` (summary는 수동 추가만)                         |
| **자동 수집 기준** | 본문에 소스 링크(트윗/기사/영상)가 있는 글만 자동 수집                                    |
| **수동 추가**      | 소스 링크 없지만 출처 확실한 번역글은 Supabase 대시보드에서 수동 입력                     |
| **소스 유형 판별** | 본문 링크 도메인 기반 — 도메인 화이트리스트 상수 배열로 관리                              |
| **크롤링 실행**    | 로컬 스크립트 (`scripts/`), `npm run sync:news`로 수동 실행                               |
| **크롤링 범위**    | 정보/SNS 카테고리(181831933) 1페이지 (~20-30개 글)                                        |
| **크롤링 도구**    | Playwright (페이지 렌더링) + cheerio (HTML 파싱). fetch 기반은 봇 차단(HTTP 430)으로 폐기 |
| **본문 크롤링**    | 새 글만 본문 크롤링, 기존 글은 메타데이터(조회/추천/댓글)만 업데이트                      |
| **DB 저장**        | 제목 + 메타데이터 + 소스 링크 + source_type. 본문 텍스트 저장 안 함                       |
| **필터링**         | 금칙어 상수 배열(1차 방어) + hidden 플래그(Supabase 대시보드에서 수동 숨김)               |
| **카드 클릭**      | 소스 링크로 새 탭 이동 (에펨코리아 원글 URL 미노출)                                       |
| **카드 UI**        | lucide-react 아이콘 + 텍스트 뱃지, 소스 링크 항상 노출 (아코디언 아님)                    |
| **리스트**         | 최신순 고정 + 무한 스크롤                                                                 |
| **팀 필터**        | MVP에서 없음, 추후 확장 가능하도록 구조만 열어둠                                          |
| **HOME 연동**      | 별도 작업으로 분리 (Phase NW 범위 밖)                                                     |

### 소스 유형 판별 기준

| 태그      | 판별 기준                       | 도메인 예시                                                                       |
| --------- | ------------------------------- | --------------------------------------------------------------------------------- |
| `tweet`   | `x.com`, `twitter.com`          | 파브리치오 로마노 트윗 번역                                                       |
| `article` | 스포츠 매체 도메인 화이트리스트 | `espn.com`, `theathletic.com`, `bbc.co.uk/sport`, `skysports.com`, `marca.com` 등 |
| `video`   | 영상 플랫폼 도메인              | `youtube.com`, `youtu.be`, `instagram.com` 등                                     |
| `summary` | 소스 링크 없음 (수동 추가만)    | —                                                                                 |

### Task NW100: DB 스키마 + 의존성 + 상수 + 타입 ✅

- ✅ Supabase 마이그레이션: `transfer_news` 테이블
  ```sql
  create table transfer_news (
    id            bigint primary key,        -- 에펨코리아 게시글 ID (또는 수동 추가 시 생성)
    title         text not null,
    author        text,
    source_type   text not null,             -- 'tweet' | 'article' | 'video' | 'summary'
    source_urls   text[],                    -- 본문에서 추출한 원본 링크들
    view_count    integer default 0,
    like_count    integer default 0,
    comment_count integer default 0,
    hidden        boolean default false,     -- 수동 숨김 플래그
    published_at  timestamptz not null,
    crawled_at    timestamptz default now(),
    body_crawled  boolean default false      -- 본문 크롤링 완료 여부
  );
  ```
- ✅ RLS: 읽기 공개, 쓰기 service_role만
- ✅ `npm install cheerio` (dependencies)
- ✅ `lib/constants/fmkorea.ts` — 카테고리 ID, 금칙어 배열, 도메인 화이트리스트
  - 정보/SNS 카테고리: 181831933
  - 팀별 카테고리 (추후 확장용): 맨시티 853076194, 맨유 3417026549, 아스날 732894504, 리버풀 259678968, 첼시 463201349, 토트넘 1798914341, PL 전체 33854722
  - ✅ `BANNED_KEYWORDS`: 금칙어 상수 배열
  - ✅ `ARTICLE_DOMAINS`: 스포츠 매체 도메인 화이트리스트
  - ✅ `VIDEO_DOMAINS`: 영상 플랫폼 도메인 목록
  - ✅ `TWEET_DOMAINS`: `['x.com', 'twitter.com']`
- ✅ `types/transfer-news.ts` — `TransferNewsItem`, `SourceType`, `TransferNewsListResponse`
- ✅ `types/index.ts`에 re-export

### Task NW101: 크롤링 엔진 (`lib/api/fmkorea/`) ✅

- ✅ ~~`rate-limiter.ts`~~ — Playwright `waitForTimeout`으로 대체 (폐기)
- ✅ ~~`client.ts`~~ — `fmkoreaFetch()` fetch 기반 → Playwright 전환으로 폐기 (HTTP 430 봇 차단 대응)
- ✅ `types.ts` — `FmkRawPost`, `FmkRawArticle` (Raw 크롤링 타입)
- ✅ `parsers.ts` — cheerio HTML 파싱 (테이블 기반 `<tr>` 레이아웃)
  - ✅ `parsePostList(html)`: 리스트 페이지 파싱 → 제목/메타 추출
  - ✅ `parseArticleUrls(html)`: 본문에서 모든 외부 링크 추출 + FMKorea 리다이렉트 래퍼(`link.fmkorea.org`) 언랩
  - ✅ 한국어 숫자 표기 파싱 ("6만" → 60000)
- ✅ `classifiers.ts` — 소스 유형 판별
  - ✅ `classifySourceType(urls)`: 도메인 화이트리스트 매칭 → `SourceType` 반환
  - ✅ 우선순위: tweet > article > video > summary
- ✅ `mappers.ts` — Raw → DB/App 타입 변환 (dbRowToTransferNewsItem, rawPostToDbRow, rawPostToMetaUpdate)
- ✅ `filters.ts` — 금칙어 필터링 (`isBannedPost`)
- ✅ `index.ts` — re-export (fmkoreaFetch/FmkoreaFetchError export 제거)

### Task NW102: 크롤링 스크립트 (`scripts/sync-news/`) ✅

- ✅ `scripts/sync-news/main.ts` — Playwright 기반 메인 실행 스크립트
- ✅ 실행 흐름:
  1. ✅ Playwright chromium headless 브라우저 launch
  2. ✅ 축구 소식통(`football_news`) 리스트 페이지 접속 → `page.content()` + cheerio 파싱
  3. ✅ `waitForSelector("table.bd_lst tbody tr")`로 DOM 로딩 보장
  4. ✅ 각 글 제목 → 금칙어 필터링
  5. ✅ DB 조회 → 이미 있는 글은 메타데이터만 upsert
  6. ✅ 새 글만 → `page.goto()` 본문 크롤링 (5~8초 랜덤 대기) → 링크 추출 → source_type 태깅
  7. ✅ 소스 링크 없는 글은 스킵 (자동 수집 대상 아님)
  8. ✅ DB upsert + `sync_logs` 기록
  9. ✅ `finally`에서 `browser.close()` 보장
- ✅ `package.json`에 `"sync:news"` 스크립트 추가
- ✅ Supabase `service_role` 키 사용 (`SUPABASE_SERVICE_ROLE_KEY`)

### Task NW103: API 라우트 + 커스텀 훅 ✅

- ✅ `app/api/news/transfers/route.ts`
  - ✅ `GET /api/news/transfers?cursor={id}&limit=20`
  - ✅ DB에서 조회 (hidden=false, 최신순), cursor 기반 페이지네이션
  - ✅ `Cache-Control: s-maxage=60, stale-while-revalidate=300`
- ✅ `lib/hooks/use-transfer-news.ts`
  - ✅ TanStack Query `useInfiniteQuery` (무한 스크롤)
  - ✅ staleTime 1분, cursor 기반 다음 페이지 로딩

### Task NW104: NEWS 페이지 UI 컴포넌트 ✅

- ✅ `app/(app)/news/page.tsx` — 기존 Coming Soon placeholder 교체
- ✅ `app/(app)/news/_components/`
  - ✅ `news-feed.tsx` — Client Component, `useInfiniteQuery` + `IntersectionObserver` 무한 스크롤
  - ✅ `news-card.tsx` — 뉴스 카드
    - ✅ 소스 타입 뱃지 (lucide 아이콘 + 텍스트): Twitter→`tweet`, Newspaper→`article`, Play→`video`, FileText→`summary`
    - ✅ 제목 + 조회/추천/댓글 + 게시 시간
    - ✅ 소스 링크 목록 항상 노출 (새 탭 열기)
    - ✅ `summary` 타입은 클릭 불가, 제목만 표시
  - ✅ `source-type-badge.tsx` — 소스 타입별 아이콘 + 텍스트 뱃지
  - ✅ `news-skeleton.tsx` — 로딩 스켈레톤
  - ✅ `empty-news.tsx` — 빈 상태 UI

### Task NW105: HOME 트렌딩 뉴스 패널 연동 — 별도 작업

- Phase NW 범위 밖, NEWS 페이지 안정화 이후 진행
- NEWS 데이터에서 최신 2~3개를 HOME에 노출
- HP3의 보류 패널(4번) 채우기

### 캐싱 전략

| 레이어              | 전략                                   | TTL                                       |
| ------------------- | -------------------------------------- | ----------------------------------------- |
| DB (Supabase)       | 크롤링 스크립트가 주기적 저장          | 수동 실행 주기에 따름                     |
| API Route           | `Cache-Control`                        | `s-maxage=60, stale-while-revalidate=300` |
| TanStack Query      | `useInfiniteQuery`                     | staleTime 1분                             |
| 크롤링 Rate Limiter | Playwright `waitForTimeout` 5~8초 랜덤 | —                                         |

---

## Phase CV: 전술 시각화 플랫폼 — 장기 목표 (최후순위)

> **비전**: 중계 영상에서 선수 움직임, 패스 궤적, 상호작용 데이터를 직접 추출하여 전술적 맥락을 시각화.
> ScoutLab 기반 메트릭을 점진적으로 자체 CV 파이프라인으로 교체해나가는 전략.
> **우선순위**: ScoutLab UX 완성(UX1~UX2) + 페이지 개선(MD~NW) 이후 착수. News와 별도 독립 섹션.

### 기술 결정 사항

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

### Phase CV1: CV 파이프라인 프로토타입 — 예정

- **Task CV101: 개발 환경 구축**
  - Python 프로젝트 구조 (`scripts/cv/` 또는 별도 repo)
  - Ultralytics YOLO + Supervision + SoccerNet 설치
  - SoccerNet 데이터셋 다운로드 (테스트용 1~2경기)

- **Task CV102: 선수 탐지 + 추적 파이프라인**
  - YOLO 선수 탐지 (사전학습 또는 축구 fine-tuned 모델)
  - ByteTrack/BoT-SORT 추적
  - Supervision 래퍼로 통합

- **Task CV103: Homography (카메라→피치 좌표 변환)**
  - SoccerNet Camera Calibration 또는 Narya 활용
  - 픽셀 좌표 → 105×68m 피치 좌표 변환
  - 정확도 검증 (알려진 위치와 비교)

- **Task CV104: 팀 분류 (Home/Away)**
  - 저지 색상 기반 K-Means 클러스터링
  - Supervision TeamClassifier 활용
  - 심판/관중 필터링

- **Task CV105: 출력 포맷 정의 + 데이터 저장**
  - 프레임별 JSON 포맷: `{ frame, timestamp, players: [{ id, team, x, y }] }`
  - 경기별 요약: 평균 포지션, 팀 형태(shape), 점유 영역
  - Supabase DB 스키마 (경기 메타데이터 + 처리 상태)
  - Supabase Storage 또는 S3에 프레임 JSON 업로드

- **Task CV106: 프로토타입 검증**
  - SoccerNet 테스트 경기 1~2개 전체 처리
  - 추적 정확도 평가 (ID 스위칭 빈도, 좌표 정밀도)
  - 처리 시간 측정 (90분 경기 기준)

### Phase CV2: 웹 시각화 + Tactics 섹션 — 예정

- **Task CV201: Tactics 탭 신설**
  - `app/(app)/tactics/` 라우트 생성
  - `nav-config.ts`: Tactics 6번째 탭 추가 (News와 별도 독립)
  - 경기 목록 페이지 (CV 처리된 경기만 표시)

- **Task CV202: Canvas 피치맵 렌더러**
  - `components/tactics/pitch-canvas.tsx`: Canvas 2D 피치 배경 + 선수 점 렌더링
  - 기존 `pitch-svg.tsx` 좌표계(105×68m) 재활용
  - 홈/어웨이 색상 구분, 선수 ID 라벨

- **Task CV203: 타임라인 재생 컨트롤**
  - 재생/일시정지/속도 조절 (0.5x, 1x, 2x)
  - 타임라인 슬라이더 (스크러빙)
  - `requestAnimationFrame` 기반 프레임 루프
  - 경기 JSON 파일 fetch + 프레임 버퍼링

- **Task CV204: 정적 분석 뷰**
  - 평균 포지션 맵
  - 히트맵 (선수별/팀별)
  - 팀 형태(shape) 오버레이

### Phase CV3: L5 포메이션 추론 — 예정

- **Task CV301: 포메이션 감지 알고리즘**
  - 프레임별 선수 위치 → 클러스터링 → 라인 분류 (수비-미드-공격)
  - 시간대별 포메이션 변화 타임라인

- **Task CV302: 포메이션 시각화**
  - 포메이션 다이어그램 (4-3-3, 4-2-3-1 등)
  - 시간대별 포메이션 전환 애니메이션

---

## 기능-Task 매핑

| 기능 ID | 기능명                    | 커버 Task        |
| ------- | ------------------------- | ---------------- |
| F111    | 글로벌 내비게이션         | Task 604         |
| F112    | 기본 인증                 | 레거시 완료      |
| F113    | 코믹 디자인 앱 통일       | Task 7B1~7B6     |
| F114    | 디자인 시스템 문서화      | Task 7C1~7C3     |
| F115    | UI 영어 전환              | Task 7D2         |
| F120    | ScoutLab DB 인프라        | Task S101~S103   |
| F122    | ScoutLab 데이터 스크래퍼  | Task S201~S204   |
| F123    | ScoutLab 분석 뷰          | Task S301~S312   |
| F126    | 네비게이션 구조 개편      | Task N101        |
| F127    | Ranking 순위표 페이지     | Task N102        |
| F129    | 매치데이 5대 리그 확장    | Task N201~N206   |
| F130    | football-data.org 전환    | Task FD01~FD09   |
| F133    | Ranking 5대 리그 순위표   | Task RK01~RK06   |
| F134    | PL 선수 데이터 동기화     | Task PD01~PD06   |
| F135    | ScoutLab 모드 토글 구현   | Task S501~S508   |
| F136    | 홈 화면 5대 리그 리디자인 | Task HP201~HP205 |
| F201    | ScoutLab 5대 리그 확장    | Task S601~S607   |
| F202    | Action Maps 스크래퍼      | Task S701~S703   |
| F203    | Scatter/Ranking 필터 보강 | Task S704~S705   |
| F204    | 멀티시즌 데이터 확장      | Task S801~S803   |
| F205    | Share as Image            | Task S804        |
| F206    | 전술 시각화 (CV 프로토)   | Task CV101~CV106 |
| F207    | Tactics 웹 시각화         | Task CV201~CV204 |
| F208    | 포메이션 추론             | Task CV301~CV302 |
| F218    | ScoutLab 한국어 부연      | Task UX101~UX103 |
| F219    | ScoutLab 코믹 차트        | Task UX201~UX204 |
| F220    | MATCHDAY 자동 동기화 ✅   | Task MD101~MD103 |
| F221    | HOME ScoutLab 쇼케이스    | Task HP301~HP303 |
| F222    | RANKING UCL/UEL           | Task RK201~RK203 |
| F223    | RANKING 선수 순위         | Task RK301~RK303 |
| F224    | MATCHDAY 매치픽           | Task MP101~MP104 |
| F225    | NEWS 이적뉴스 큐레이션    | Task NW100~NW104 |

---

**최종 업데이트**: 2026-05-26 (Phase NW — 크롤러 Playwright 전환, 실제 데이터 수집 완료)
**진행 상황**: Phase 1~5A 레거시 완료 ✅ | Phase 6~7E 완료 ✅ | Phase S1~S5 완료 ✅ | Phase N1~N2 완료 ✅ | Phase AF+FD 완료 ✅ | Phase HP+HP2+HP3+HP4 완료 ✅ | Phase RK+RK2+PD 완료 ✅ | Phase UX1~UX2 완료 ✅ | Phase MD 완료 ✅ | Phase SB 완료 ✅ | Phase S6 완료 ✅ | **Phase NW 완료 ✅** → RK3 → MP → S7 → S8 → CV
