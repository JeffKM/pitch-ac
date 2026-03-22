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

---

**최종 업데이트**: 2026-03-23
**진행 상황**: Phase 1~5A 레거시 완료 ✅ | Phase 6 완료 ✅ | Phase 7+7B 완료 ✅ | Phase 8~10 예정
