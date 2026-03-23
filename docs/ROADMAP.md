# pitch-ac 개발 로드맵

맨체스터 시티 선수들이 카툰 캐릭터로 살아 움직이는 팬사이트.

## 개요

pitch-ac는 맨시티 팬을 위한 카툰 팬사이트로 다음 기능을 제공합니다:

- **맨시티 매치데이**: 게임위크별 맨시티 경기 포커스, 라이브 카툰 리액션
- **카툰 스쿼드**: 선수 카툰 아바타, 감정 표현, 말풍선 대사
- **카툰 포메이션 피치**: 라인업을 카툰 캐릭터로 시각화
- **바이럴 콘텐츠**: 카툰 카드 자동 생성, SNS 공유 최적화

## 현재 상태

- PL 데이터 인프라 완성 (SportMonks API, Supabase DB, 실시간 폴링)
- 인증 플로우 구현 완료 (이메일 + Google OAuth)
- **피벗 진행 중**: PL 전체 → 맨시티 전용 카툰 팬사이트

---

## 레거시 완료 (Phase 1~4)

> PL 데이터 플랫폼 시절 완료된 인프라. 맨시티 팬사이트의 데이터 기반으로 활용.

- ✅ Phase 1: 애플리케이션 골격 (Route Groups, 타입 정의, 내비게이션)
- ✅ Phase 2: UI/UX (매치데이, 경기 상세, 선수 검색/프로필, 비교, 레이더 차트, 용어 팝오버)
- ✅ Phase 3: 백엔드 연동 (Supabase DB 9개 테이블, SportMonks API, Cron 동기화, 맥락 계산)
- ✅ Phase 4: 고급 기능 (라이브 스코어 실시간, OG 이미지, 성능 최적화, 프로덕션 배포)
- ✅ Phase 5-A: 안정성 (React cache, server-only, CSP, Vitest, Sentry)

---

## Phase 6: 맨시티 팬사이트 기반 전환 ✅

PL 전체 → 맨시티 전용 필터링 + 브랜딩. 카툰 에셋 없이 뼈대 먼저.

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

## Phase 7: 카툰 에셋 시스템 구축 ✅

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
  - `app-header.tsx`: 코믹 보더, Bangers 로고, 네비 링크 코믹 스타일 (활성=노랑, 비활성=검정)
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

## Phase 8: 카툰 매치데이 (핵심) — 예정

- **Task 801: 카툰 포메이션 피치 뷰**
  - `lineup-display.tsx`의 `LineupPlayerDot` → `CartoonAvatar` 교체
  - 카툰 스타일 피치 배경 (SVG/이미지)
  - 기존 grid 파싱 + 행 그룹핑 로직 재활용

- **Task 802: 실시간 감정 반응**
  - `hooks/use-cartoon-mood.ts`: TanStack Query 폴링 → 감정 계산
  - 골 발생 → celebrating + 말풍선
  - 실점 → GK shocked, 전체 sad (3초 후 focused 복귀)
  - 경기 종료 → 결과에 따른 감정 전환

- **Task 803: 이벤트 리액션 오버레이**
  - `components/cartoon/reaction-overlay.tsx`
  - 풀스크린 카툰 오버레이 (골/레드카드 시 2~3초)
  - 기존 `goal-notification.tsx` sonner toast를 카툰 오버레이로 대체

- **Task 804: 매치 헤더 카툰화**
  - `match-header.tsx`: 팀 로고 옆 대표 카툰 캐릭터
  - 스코어 표시 카툰 스타일 전환

---

## Phase 9: 바이럴 콘텐츠 엔진 — 예정

- **Task 901: 카툰 갤러리 페이지**
  - `/gallery` 실제 구현 (플레이스홀더 교체)
  - 경기 후 자동 생성 카툰 카드 목록
  - "오늘의 MVP", "매치 결과", "베스트 모먼트" 카드

- **Task 902: 공유용 카툰 카드 이미지 생성**
  - 기존 satori 패턴 확장 (`app/api/cartoon/share/route.tsx`)
  - 매치 결과 카드, MVP 카드, 비교 배틀카드
  - pitch-ac 브랜딩 워터마크

- **Task 903: SNS 공유 최적화**
  - Web Share API (모바일 네이티브 공유)
  - 카카오톡, 인스타 스토리, 트위터 최적화 사이즈
  - 이미지 다운로드 버튼

---

## Phase 10: 에셋 확충 & 폴리시 — 예정

- **Task 1001: 전체 스쿼드 에셋 완성**
  - ~25명 × 12개 감정 = ~300개 에셋
  - 선수별 시그니처 세러머니 이미지

- **Task 1002: 이벤트 애니메이션**
  - Lottie 또는 CSS 짧은 애니메이션
  - 골 세러머니, 카드, 교체 시 효과

- **Task 1003: 성능 최적화**
  - 에셋 프리로드 전략
  - 스프라이트 시트 검토
  - 다크모드 카툰 변형

---

## 기능-Task 매핑

| 기능 ID | 기능명                 | 커버 Task     |
| ------- | ---------------------- | ------------- |
| F101    | 맨시티 매치 포커스     | Task 602, 605 |
| F102    | 카툰 포메이션 피치 뷰  | Task 801      |
| F103    | 실시간 무드 리액션     | Task 703, 802 |
| F104    | 말풍선 대사            | Task 703, 705 |
| F105    | 카툰 스쿼드 그리드     | Task 705      |
| F106    | 카툰 선수 프로필       | Task 705      |
| F107    | 공유 카드 생성         | Task 902      |
| F108    | 카툰 갤러리            | Task 901      |
| F109    | 이벤트 리액션 오버레이 | Task 803      |
| F110    | 소셜 공유              | Task 903      |
| F111    | 글로벌 내비게이션      | Task 604      |
| F112    | 기본 인증              | 레거시 완료   |
| F113    | 코믹 디자인 앱 통일    | Task 7B1~7B6  |
| F114    | 디자인 시스템 문서화   | Task 7C1~7C3  |
| F115    | UI 영어 전환           | Task 7D2      |
| F116    | 카드 간소화            | Task 7D1      |
| F117    | 컵 대회 통합           | Task 7E1~7E5  |
| F118    | 연기 경기(POSTP) 표시  | Task 7E2~7E3  |
| F119    | 컵 GW 앵커 기반 할당   | Task 7E6      |

---

**최종 업데이트**: 2026-03-24
**진행 상황**: Phase 1~5A 레거시 완료 ✅ | Phase 6 완료 ✅ | Phase 7+7B+7C+7D+7E+7E6 완료 ✅ | Phase 8~10 예정
