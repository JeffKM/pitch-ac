# pitch-ac 개발 로드맵

PL 선수·경기 데이터를 맥락과 함께 시각적으로 보여주는 데이터 플랫폼.

## 개요

pitch-ac는 글로벌 PL 팬을 위한 데이터 해석 플랫폼으로 다음 기능을 제공합니다:

- **매치데이 대시보드**: 게임위크별 경기 목록, 라이브 스코어, 프리매치/포스트매치 정보
- **선수 프로필**: 시즌 스탯에 리그 순위·백분위·전년 비교 맥락을 더한 해석
- **선수 비교 배틀카드**: 2명의 선수를 시각적으로 비교하고 SNS 공유 이미지 생성
- **맥락 기반 수치 표현**: 모든 숫자에 최소 1개의 맥락 정보 동반

## 현재 상태

- Supabase 스타터킷 기반, 인증 플로우 구현 완료 (이메일 + Google OAuth)
- 기본 shadcn/ui 컴포넌트 설치됨 (Button, Card, Input, Label, Badge, Checkbox, DropdownMenu)
- Tailwind CSS v4, TypeScript strict, Husky + lint-staged 코드 품질 자동화 구축 완료
- PL 데이터 관련 기능은 미구현 상태

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅

- **Task 001: Route Groups 재구성 및 페이지 스캐폴딩** ✅ — 완료
  - ✅ Route Groups 구조 생성: `(marketing)`, `(app)`, `(auth)`
  - ✅ `(app)` 그룹 내 페이지 파일 생성:
    - `/matchday/page.tsx` — 매치데이 대시보드
    - `/matchday/[fixtureId]/page.tsx` — 경기 상세
    - `/players/page.tsx` — 선수 검색
    - `/players/[playerId]/page.tsx` — 선수 프로필
    - `/compare/page.tsx` — 선수 비교
  - ✅ `(auth)` 그룹으로 기존 인증 라우트 이동 (`/auth/login`, `/auth/sign-up` 등)
  - ✅ `(app)` 레이아웃에 내비게이션 + 콘텐츠 영역 골격 구현
  - ✅ 루트 `/` → `/matchday` 리디렉션 설정
  - ✅ 기존 스타터킷 튜토리얼 컴포넌트 정리 (tutorial 폴더, hero.tsx 등)
  - **Playwright 검증** ✅:
    - ✅ `http://localhost:3000/` 접속 → URL이 `/matchday`로 자동 리디렉션 확인
    - ✅ `/matchday`, `/players`, `/compare`, `/auth/login` 각 라우트 정상 렌더링
    - ✅ `/matchday/123`, `/players/456` 동적 라우트 — params 값 페이지에 표시 확인
    - ✅ 콘솔 에러 없음 (loading.tsx Suspense 경계 추가로 해결)
  - **관련 기능**: F013, F014
  - **의존성**: 없음

- **Task 002: TypeScript 타입 정의 및 더미 데이터 구축** ✅ — 완료
  - ✅ `types/` 디렉토리 생성 및 핵심 타입 정의:
    - `team.ts` — Team, TeamStanding
    - `player.ts` — Player, PlayerSeasonStats, PlayerMatchStats, PlayerIdMapping
    - `fixture.ts` — Fixture, FixtureEvent, FixtureLiveStats, Lineup
    - `glossary.ts` — GlossaryTerm
    - `api.ts` — ApiResponse\<T\> 래퍼, 페이지네이션
    - `radar.ts` — RadarDimension, RadarDataPoint, RadarData (추가)
  - ✅ `lib/mock/` 디렉토리에 더미 데이터 생성:
    - 6개 팀 더미 데이터 (빅6, 실제 API Football ID 사용)
    - 12명 선수 더미 데이터 (GK 2, DEF 3, MID 4, FWD 3)
    - GW28 경기 6경기 (FT 2, LIVE 2, NS 2) — 라인업·이벤트·liveStats 포함
    - 맥락 데이터 포함 (순위, 백분위, 전년 비교, StatContext)
    - 축구 용어 15개 (xG, xA 등 팝오버용)
  - ✅ 더미 데이터에서 실제 PL 선수·팀 이름 사용 (UI 현실감 확보)
  - **Playwright 검증** ✅:
    - ✅ 개발 서버 실행 후 `/matchday`, `/players`, `/compare` 접속 시 콘솔 에러 없음 (Errors: 0)
    - ✅ TypeScript 컴파일 에러로 인한 빌드 실패 없음 (`npm run build` 성공)
    - ✅ `/matchday` — "Arsenal 2 - 1 Chelsea", "Liverpool 3 - 2 Manchester City" 등 실제 PL 팀명 텍스트 확인
    - ✅ `/players` — 12명 선수 이름·팀·포지션 목록 렌더링 확인
    - ✅ `/compare` — "12명의 선수 데이터가 로드되었습니다" 텍스트 확인
  - **관련 기능**: 전체
  - **의존성**: 없음

- **Task 003: 글로벌 내비게이션 구현 (F013)** ✅ — 완료
  - ✅ 데스크탑 상단 고정 헤더:
    - Logo (pitch-ac) → `/matchday` 이동
    - Matchday, Players, Compare 메뉴 링크
    - 테마 토글 (다크/라이트)
    - 인증 상태별 버튼 (Log In / Sign Up 또는 사용자 드롭다운)
  - ✅ 모바일 하단 탭 바 (4탭):
    - Matchday, Players, Compare, More
  - ✅ 반응형 브레이크포인트: 데스크탑(md 이상) 헤더 / 모바일(md 미만) 하단 탭
  - ✅ 현재 활성 페이지 하이라이트
  - **Playwright 검증** ✅:
    - ✅ 뷰포트 1280×800: 상단 헤더 표시, 하단 탭 바 미표시 확인
    - ✅ 뷰포트 375×812: 상단 헤더 미표시, 하단 탭 바 표시 확인
    - ✅ 로고("pitch-ac") 클릭 → `/matchday`로 이동
    - ✅ 헤더 "매치데이" 링크 클릭 → `/matchday` 이동, 링크 active 스타일 확인
    - ✅ 헤더 "선수" 링크 클릭 → `/players` 이동, 링크 active 스타일 확인
    - ✅ 헤더 "비교" 링크 클릭 → `/compare` 이동, 링크 active 스타일 확인
    - ✅ 테마 토글 클릭 → `<html>` 태그 class가 `dark` ↔ `light` 전환 확인
    - ✅ 미인증 상태: "Sign in", "Sign up" 버튼 표시 확인
    - ✅ 모바일 하단 탭 "더보기" 클릭 → `/more` 이동
  - **🔧 코드 리뷰 개선** (2026-03-21):
    - ✅ `AppHeader` / `MobileTabBar` 조건부 className에 `cn()` 유틸리티 적용
    - ✅ `nav-config.ts` 영어 라벨 → 한국어 통일 (매치데이, 선수, 비교, 더보기)
  - **관련 기능**: F013
  - **의존성**: Task 001

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

- **Task 004: 매치데이 대시보드 UI (F001)** ✅ — 완료
  - ✅ 게임위크 헤더: 번호 + 날짜 범위 + 이전/다음 화살표
  - ✅ 날짜별 경기 카드 그룹핑
  - ✅ 경기 카드 컴포넌트:
    - 팀 로고 + 이름 + 스코어
    - 상태 배지 (예정: 킥오프 시간, 라이브: 경기 시간, 종료: FT)
    - 종료 경기: xG + 점유율 미리보기
  - ✅ 라이브 경기 시각적 구분 (펄스 애니메이션, 강조 보더)
  - ✅ 경기 카드 클릭 → 경기 상세 페이지 이동
  - ✅ 빈 상태 / 로딩 스켈레톤 UI
  - **Playwright 검증** ✅:
    - ✅ `/matchday` 접속 → "Gameweek N" 형태의 헤더 텍스트 표시
    - ✅ 이전(←)/다음(→) 화살표 버튼 존재 확인 및 클릭 시 게임위크 번호 변경
    - ✅ 경기 카드 최소 1개 이상 렌더링 확인
    - ✅ 카드에 양팀 이름 텍스트 표시 확인
    - ✅ 종료 경기 카드에 "FT" 배지 표시 확인
    - ✅ 라이브 경기 카드에 pulse 애니메이션 요소 존재 확인 (CSS 클래스 확인)
    - ✅ 종료 경기 카드에 xG 수치 텍스트 표시 확인
    - ✅ 경기 카드 클릭 → `/matchday/[fixtureId]` URL로 이동 확인
    - ⏭️ 페이지 초기 로드 시 스켈레톤 UI 표시 후 실제 카드로 교체 확인 (정적 렌더링으로 스켈레톤 전환 불가, 스킵)
  - **🔧 코드 리뷰 개선** (2026-03-21):
    - ✅ `fixture-date-group.tsx` `React.ReactNode` → `import type { ReactNode }` 수정 (타입 에러 수정)
    - ✅ `GameweekHeader` `router.push` → `Link` + `asChild` 패턴으로 교체 (prefetch 활성화, Server Component 전환)
    - ✅ `buildDateRange` 날짜 비교를 포맷 문자열이 아닌 날짜 키(`sv-SE`) 기반으로 개선
    - ✅ `/matchday/[fixtureId]/not-found.tsx` 추가 및 `page.tsx`에 `notFound()` 연결
    - ✅ `DEFAULT_GW` 하드코딩에 TODO 주석 추가 (추후 API 연동 예정 명시)
  - **관련 기능**: F001
  - **의존성**: Task 002, Task 003

- **Task 005: 경기 상세 페이지 UI (F003, F004, F005)** ✅ — 완료
  - ✅ 경기 헤더: 양팀 로고·이름·스코어, 경기 상태·시간
  - ✅ 탭 네비게이션: 프리매치 / 라이브 / 포스트매치 (경기 상태에 따라 자동 선택)
  - ✅ **프리매치 탭**:
    - 양팀 최근 5경기 폼 (W/D/L 배지)
    - H2H 최근 5경기 결과
    - 부상/결장 선수 목록
    - 순위 시뮬레이션 (승/무/패 시)
  - ✅ **라이브 탭**:
    - 스탯 바 (점유율·슈팅·xG) — 수평 프로그레스 바
    - 이벤트 타임라인 (골·교체·카드, 시간순)
    - 양팀 라인업 (4-3-3 등 포메이션 시각화 또는 리스트)
    - 자동 갱신 표시기 ("60초마다 갱신")
  - ✅ **포스트매치 탭**:
    - 최종 스탯 비교 테이블
    - 주요 이벤트 요약
  - ✅ 선수 이름 클릭 → 선수 프로필 페이지 이동
  - **Playwright 검증** ✅:
    - ✅ `/matchday/[더미fixtureId]` 접속 → 양팀 이름·스코어 헤더 렌더링 확인
    - ✅ "프리매치", "라이브", "포스트매치" 탭 버튼 3개 표시 확인
    - ✅ 프리매치 탭 클릭 → W/D/L 배지(폼) 표시 확인
    - ✅ 프리매치 탭: H2H 섹션 및 부상 선수 섹션 렌더링 확인
    - ✅ 라이브 탭 클릭 → 점유율 프로그레스 바 표시 확인
    - ✅ 라이브 탭: "60초마다 갱신" 또는 갱신 표시기 텍스트 존재 확인
    - ✅ 라이브 탭: 이벤트 타임라인 아이템 최소 1개 렌더링 확인
    - ✅ 포스트매치 탭 클릭 → 스탯 비교 테이블 렌더링 확인
    - ✅ 경기 상태가 "예정"인 더미 데이터 → 프리매치 탭이 기본 선택 확인
    - ✅ 선수 이름 링크 클릭 → `/players/[playerId]`로 이동 확인
  - **관련 기능**: F003, F004, F005
  - **의존성**: Task 002, Task 003

- **Task 006: 선수 검색 페이지 UI (F011)** ✅ — 완료
  - ✅ 검색 입력 필드 (shadcn Command + Popover 기반 Combobox)
  - ✅ Fuzzy search 자동완성 드롭다운 (선수 사진·팀·포지션)
  - ✅ 최근 검색어 표시 (localStorage, 최대 5개)
  - ✅ 검색 결과 그리드 (선수 카드: 사진·이름·팀·포지션·핵심 스탯 1개)
  - ✅ 빈 상태 / 검색 중 로딩 UI
  - **Playwright 검증** ✅:
    - ✅ `/players` 접속 → 검색 입력 필드 표시 확인
    - ✅ 검색 필드 클릭 → 최근 검색어 드롭다운 표시 확인
    - ✅ "Sal" 입력 → 자동완성 드롭다운에 "Salah" 포함 결과 표시 확인
    - ✅ 드롭다운 아이템에 팀명·포지션 텍스트 표시 확인
    - ✅ 존재하지 않는 이름 입력 → "결과 없음" 빈 상태 UI 표시 확인
    - ✅ 자동완성 아이템 클릭 → 검색 결과 그리드에 해당 선수 카드 표시
    - ✅ 선수 카드에 이름·팀·포지션·스탯 텍스트 표시 확인
    - ✅ 선수 카드 클릭 → `/players/[playerId]`로 이동 확인
  - **관련 기능**: F011
  - **의존성**: Task 002, Task 003

- **Task 007: 선수 프로필 페이지 UI (F006, F008)** ✅ — 완료
  - ✅ 헤더 카드: 선수 사진·이름·클럽·등번호·포지션·국적
  - ✅ 맥락 스탯 카드 그리드:
    - 각 수치(골/어시스트/xG/xA) + 리그 순위 + 백분위 바 + 전년 비교(↑↓)
    - 수치 옆 [?] 용어 설명 팝오버 트리거
  - ✅ 최근 10경기 폼 스파크라인 + 상승/하락 트렌드 텍스트
  - ✅ "Compare" 버튼 → 선수 비교 페이지 이동 (p1 파라미터)
  - ✅ 로딩 스켈레톤 UI
  - **Playwright 검증** ✅:
    - ✅ `/players/[더미playerId]` 접속 → 선수 이름·클럽·포지션 헤더 렌더링 확인
    - ✅ 스탯 카드 그리드 최소 4개(골/어시스트/xG/xA) 렌더링 확인
    - ✅ 각 스탯 카드에 리그 순위 텍스트(예: "1위") 표시 확인
    - ✅ 각 스탯 카드에 백분위 프로그레스 바 요소 존재 확인
    - ✅ 전년 비교 방향 아이콘(↑ 또는 ↓) 텍스트 표시 확인
    - ✅ 스탯 수치 옆 [?] 아이콘 버튼 존재 확인
    - ✅ 최근 폼 스파크라인 SVG 또는 차트 요소 렌더링 확인
    - ✅ "선수 비교" 버튼 → `/compare?p1=[playerId]` URL로 이동 확인
    - ✅ 로딩 스켈레톤 UI (loading.tsx) 구현 완료
  - **관련 기능**: F006, F008
  - **의존성**: Task 002, Task 003

- **Task 008: 레이더 차트 컴포넌트 구현 (F007)** ✅ — 완료
  - ✅ Recharts 기반 레이더 차트 Client Component (`components/charts/player-radar-chart.tsx`)
  - ✅ 선수 능력치 vs 포지션 평균 오버레이 (2개 데이터셋, discriminated union props)
  - ✅ 강점/약점 라벨 표시 (강점: emerald Badge, 약점: destructive Badge)
  - ✅ 비교 모드: 2명의 선수 데이터 중첩 (선수 비교 페이지용)
  - ✅ 반응형 크기 조절 (모바일 250px → 태블릿 300px → 데스크탑 350px)
  - ✅ 선수 프로필 페이지, 선수 비교 페이지 양쪽에 적용
  - **Playwright 검증** ✅:
    - ✅ `/players/[더미playerId]` 접속 → 레이더 차트 SVG 요소 렌더링 확인
    - ✅ SVG 내 2개의 폴리곤/패스 요소 존재 확인 (`.recharts-radar-polygon` 2개)
    - ✅ 강점/약점 텍스트 라벨 표시 확인 ("강점: 스피드", "약점: 수비" 등)
    - ✅ `/compare?p1=X&p2=Y` 접속 → 레이더 차트 SVG에 2개 데이터셋 렌더링 확인
    - ✅ 뷰포트 375px → 차트 컨테이너 너비 325px (뷰포트에 맞게 축소) 확인
    - ✅ 뷰포트 1280px → 차트 컨테이너 너비 1230px (확대) 확인
  - **관련 기능**: F007
  - **의존성**: Task 002

- **Task 009: 선수 비교 배틀카드 UI (F009)** ✅ — 완료
  - ✅ 선수 A/B 자동완성 검색 입력 (각 슬롯 독립, `PlayerSearchCombobox` 재사용)
  - ✅ 레이더 차트 오버레이 (Task 008 비교 모드 활용)
  - ✅ 스탯 비교 테이블: 골·xG·어시스트·키패스·드리블·평균 평점
  - ✅ 지표별 승자 트로피 아이콘 (`lucide-react/Trophy`, chart-1/chart-2 색상)
  - ✅ "Verdict: X leads in N/6 categories" 텍스트
  - ✅ URL 파라미터 기반 선수 선택 (p1, p2 쿼리 파라미터, `useRouter` + Suspense 내 await)
  - ✅ "Share as Image" 버튼 (Phase 4에서 실제 구현, UI만 배치)
  - **Playwright 검증** ✅:
    - ✅ `/compare` 접속 → 선수 A/B 검색 슬롯 2개 표시 확인
    - ✅ 선수 A 슬롯에 이름 입력 → 자동완성 드롭다운 표시 및 선택
    - ✅ 선수 B 슬롯에 이름 입력 → 자동완성 드롭다운 표시 및 선택
    - ✅ 양 선수 선택 후 스탯 비교 테이블(6행) 렌더링 확인
    - ✅ 각 행에 트로피 아이콘 표시 확인
    - ✅ "Verdict: X leads in N/6 categories" 텍스트 표시 확인
    - ✅ URL이 `?p1=[id1]&p2=[id2]` 형태로 업데이트 확인
    - ✅ `/compare?p1=[id1]&p2=[id2]` 직접 접속 → 두 선수 자동 로드 확인
    - ✅ "Share as Image" 버튼 UI 요소 존재 확인
  - **관련 기능**: F009
  - **의존성**: Task 006, Task 008

- **Task 010: 용어 설명 팝오버 시스템 (F012)** ✅ — 완료
  - ✅ `GlossaryPopover` 공통 컴포넌트: term 전달 시 정의·비유·예시 팝오버 표시 (`components/glossary-popover.tsx`로 공용화)
  - ✅ 20개 축구 전문 용어 데이터 구축 (xG, xA, xGI, 점유율, 키패스, 골, 슈팅, 코너킥, 파울, 평균 평점 등)
  - ✅ 수치 옆 [?] 아이콘으로 트리거
  - ✅ 선수 프로필 페이지 (골/xG/xA/키패스/드리블/평균 평점 6개 스탯), 경기 상세 페이지 (점유율/슈팅/유효슈팅/xG/코너킥/파울 6개 스탯), 비교 페이지 (골/xG/키패스/드리블/평균 평점 5개 스탯)에 적용
  - **Playwright 검증** ✅:
    - ✅ `/players/110` 접속 → xG 수치 옆 [?] 버튼 클릭
    - ✅ 팝오버 열림 확인 (정의·비유·예시 텍스트 표시)
    - ✅ 팝오버 외부 영역 클릭 → 팝오버 닫힘 확인
    - ✅ Escape 키 입력 → 팝오버 닫힘 확인
    - ✅ `/matchday/5001` → xG [?] 버튼 클릭 → 팝오버 표시 확인
    - ✅ 팝오버 내 "Expected Goals" 정의 텍스트 포함 여부 확인
  - **관련 기능**: F012
  - **의존성**: Task 005, Task 007

---

### Phase 3: 백엔드 및 데이터 연동

- **Task 011: Supabase 데이터베이스 스키마 구축** ✅ — 완료
  - ✅ Supabase Migration 파일 생성 (`supabase/migrations/`):
    - `teams` 테이블 (PL 20개 팀)
    - `players` 테이블 (~550명 선수)
    - `player_season_stats` 테이블 (시즌 스탯 + context JSONB + radar_data JSONB)
    - `player_match_stats` 테이블 (경기별 스탯)
    - `fixtures` 테이블 (경기 정보 + events/live_stats/lineups JSONB)
    - `standings` 테이블 (리그 순위표 + form JSONB)
    - `glossary` 테이블 (용어 사전, 20행 시드)
    - `injuries` 테이블 (부상/결장 선수)
    - `sync_logs` 테이블 (API 동기화 로그)
  - ✅ 인덱스 설정: team_id, player_id, fixture_id, gameweek, season, position
  - ✅ RLS 정책: 읽기 공개, 쓰기 service_role만 허용
  - ✅ 초기 시드 데이터: glossary 용어 20개 (xG, xA, 점유율, 키패스 등)
  - ✅ updated_at 자동 갱신 트리거 (모든 테이블)
  - ✅ goal_difference GENERATED ALWAYS AS 컬럼 (standings)
  - **설계 결정**:
    - SportMonks ID를 PK로 직접 사용 (별도 매핑 테이블 불필요)
    - xG/xA: `REAL NULL` (Starter 플랜 미지원 → 향후 플랜 업그레이드 시 자동 채워짐)
    - events·lineups·live_stats는 JSONB (구조화 쿼리 불필요, 전체 전달)
    - Task 013(API-Football) 생략 결정 — SportMonks 단일 소스로 충분
  - **Playwright 검증** ✅:
    - ✅ `/api/health` 접속 → `{"ok":true, "supabase_db": "DB 연결 성공 (glossary: 20행)"}` 확인
    - ✅ `/matchday` 접속 → 500 에러 페이지 미표시, 콘솔 에러 없음 확인
    - ✅ Supabase 연결 에러 없음 확인
  - **관련 기능**: 전체
  - **의존성**: 없음

- **Task 012: SportMonks API 서비스 레이어 구축** ✅ — 완료
  - ✅ `lib/api/sportmonks/` 디렉토리 구조:
    - `constants.ts` — SPORTMONKS_BASE_URL, PL_LEAGUE_ID(8), CURRENT_SEASON_ID(25583), STAT_TYPE_ID, EVENT_TYPE_ID, POSITION_MAP, FIXTURE_STATE_MAP
    - `types.ts` — SmApiResponse, SmPlayer, SmFixture, SmStanding, SmRound 등 Raw API 타입
    - `client.ts` — `import "server-only"`, Authorization 헤더 인증, Next.js fetch 캐싱, AbortController(10초 타임아웃), SportMonksApiError/RateLimitError
    - `fixtures.ts` — getFixturesByRound, getFixtureById, getLivePLFixtures, getH2HFixtures, getSeasonFixtures
    - `players.ts` — getPlayerById, searchPlayers, getSquadByTeamAndSeason, getSeasonPlayerStats
    - `teams.ts` — getLeagueTeams, getTeamById, getStandings
    - `rounds.ts` — getSeasonRounds, getCurrentRound(is_current 폴백: 최근 종료 라운드), getRoundById
    - `mappers.ts` — mapSmTeamToTeam, mapSmPlayerToPlayer, mapSmPlayerToSeasonStats, mapSmFixtureToFixture, mapSmStandingToTeamStanding, mapSmFixtureToH2HResult, extractStatValue
    - `index.ts` — re-export
  - ✅ 필터 형식: `?filters=key:value;key:value` (세미콜론 구분, 검증 완료)
  - ✅ include 형식: `?include=a;b.nested` (세미콜론 구분)
  - ✅ League ID: 8 (PL), Season ID: 25583 (2025/2026) 상수 설정
  - ✅ xG/xA: Starter 플랜 미지원 → mapper에서 null 반환 (향후 자동 추출 준비됨)
  - ✅ `getCurrentRound` 폴백: 게임위크 공백(국제 A매치 휴식기) 시 최근 종료 라운드 반환
  - ✅ 디버그 API 라우트:
    - `app/api/debug/sportmonks/fixtures/route.ts` — 현재 라운드 경기 목록
    - `app/api/debug/sportmonks/players/route.ts` — 선수 검색
    - `app/api/debug/sportmonks/standings/route.ts` — PL 순위표
    - `app/api/health/route.ts` — DB 연결 + API 키 확인 (production 403 가드)
  - **Playwright 검증** ✅:
    - ✅ `/api/debug/sportmonks/fixtures` → GW30 경기 20개, FT 상태, 실제 PL 선수 이벤트 데이터 확인 (Haaland 골, Cole Palmer 출전)
    - ✅ `/api/debug/sportmonks/players?q=Salah` → Mohamed Salah (id:4125, FWD, 등번호 10, 이집트) 반환 확인
    - ✅ `/api/debug/sportmonks/standings` → 20팀 실제 순위 (Arsenal 1위 70점, Man City 2위 61점) 확인
    - ✅ `/api/debug/sportmonks/players` (검색어 없음) → 400 + 한국어 에러 메시지 반환 확인
  - **관련 기능**: F001~F008
  - **의존성**: Task 002 (타입 정의)

- **Task 013: API-Football 서비스 레이어 구축** ⏭️ — 생략 결정
  - SportMonks Starter 플랜으로 PL H2H·스탯 데이터 충분히 확보 가능
  - API-Football 이중 소스 관리 복잡도 대비 실익 낮음
  - **결정**: SportMonks 단일 소스로 진행, 필요 시 Phase 4에서 재검토

- **Task 014: 선수 ID 매핑 시스템 구현** ⏭️ — 생략 결정
  - Task 013 생략으로 SportMonks ID만 사용 (매핑 불필요)
  - Supabase teams/players 테이블에 SportMonks ID를 PK로 직접 사용
  - **결정**: 단일 API 소스 전략으로 불필요

- **Task 015: 데이터 동기화 Cron 시스템 구축** ✅ — 완료
  - See: `/tasks/015-data-sync-cron.md`
  - ✅ Vercel Cron 설정 (`vercel.json`):
    - 주 1회(월요일 04:00 UTC): 팀·선수 기본정보 동기화
    - 매일(06:00/07:00 UTC): 경기·시즌 스탯 동기화
    - 매치데이 전날 프리매치 → 일간 fixtures 동기화에 통합
    - xG/상세 스탯 → Starter 플랜 미지원으로 sync-stats 일간 배치로 대체
  - ✅ `app/api/cron/` API 라우트:
    - `sync-teams/route.ts` (팀 기본정보 + 순위표)
    - `sync-players/route.ts` (20팀 스쿼드 순차 처리)
    - `sync-fixtures/route.ts` (시즌 전체 경기, 페이지네이션)
    - `sync-stats/route.ts` (선수 시즌 누적 스탯, 페이지네이션)
  - ✅ Cron 인증 (`CRON_SECRET` 환경변수, 개발 환경 스킵)
  - ✅ 동기화 로그 (`sync_logs` 테이블 기록, 에러 메시지 포함)
  - ✅ `lib/supabase/admin.ts` — service_role 기반 admin 클라이언트
  - ✅ `lib/services/sync/` 서비스 레이어:
    - `auth.ts` — Cron 인증 미들웨어
    - `log.ts` — sync_logs 기록 유틸리티
    - `db-mappers.ts` — SportMonks → Supabase 데이터 변환
    - `retry.ts` — 재시도 로직
    - `sync-teams.ts` — 팀 + 순위 동기화
    - `sync-fixtures.ts` — 경기 동기화
    - `sync-players.ts` — 선수 동기화
    - `sync-stats.ts` — 시즌 스탯 동기화
    - `index.ts` — re-export
  - ✅ Idempotency: 모든 쓰기 upsert(ON CONFLICT)
  - ✅ 부분 실패 허용: FK 위반 선수 건너뜀, 팀별 독립 처리
  - **핵심 기술 결정**:
    - `getFixturesByRound` 방식 변경: `/football/fixtures?fixtureRoundIds` 필터가 Starter 플랜에서 무시됨 → `/football/rounds/{id}?include=fixtures.X` 방식으로 전환
    - 선수 동기화 전략: 현재 라운드 events/lineups에서 player_id 추출 → `getPlayerById` 배치 처리 (BATCH_SIZE=50)
    - 팀 동기화 보완: `getLeagueTeams()` + fixture participants에서 누락 팀 보완
  - **Playwright 검증** ✅:
    - ✅ sync-teams: 20팀, 20 standings 정상 동기화 확인
    - ✅ sync-players: 50명 동기화 확인 (총 399명 중 배치 제한)
    - ✅ sync-fixtures: 380경기 동기화 확인 (GW1~38, 20개 홈팀)
    - ✅ sync-stats: 50개 stats 동기화 확인
  - **관련 기능**: 전체 (데이터 최신성)
  - **의존성**: Task 011, Task 012

- **Task 016: 매치데이 데이터 연동 (F001, F002)** ✅ — 완료
  - ✅ 매치데이 대시보드 서버 컴포넌트에서 Supabase 직접 조회
  - ✅ 게임위크별 경기 목록 쿼리 (fixtures + teams JOIN)
  - ✅ 더미 데이터 → 실제 DB 데이터로 교체
  - ✅ TanStack Query 기반 라이브 폴링 설정 (Client Component):
    - 라이브 경기: refetchInterval 60초
    - 비라이브: refetchInterval 5분
  - **Playwright MCP 직접 브라우저 검증** ✅ (UI 변경에 유연하도록 E2E 코드 파일 대신 MCP 직접 검증 방식 채택):
    - ✅ `/matchday` 접속 → GW31 실제 DB 데이터 렌더링 (Wolves 2-2 Arsenal, BOU 2-2 MUN 등)
    - ✅ 다음 게임위크 클릭 → URL gw=32 변경 및 GW32 경기 목록 정상 렌더링
    - ✅ GW1 → 이전 버튼 `button[disabled]` 확인
    - ✅ GW38 → 다음 버튼 `button[disabled]` 확인
    - ✅ `GET /api/matchday/fixtures?gw=1` → 200, fixtures 10개, teams/standings/hasLive 포함
    - ✅ `GET /api/matchday/fixtures?gw=0` → 400, `INVALID_GW` 에러 코드
    - ✅ `GET /api/matchday/fixtures?gw=39` → 400
    - ✅ `GET /api/matchday/fixtures` (파라미터 없음) → 400
  - **관련 기능**: F001, F002
  - **의존성**: Task 004, Task 011, Task 015

- **Task 017: 경기 상세 데이터 연동 (F003, F004, F005)** ✅ — 완료
  - ✅ 경기 상세 서버 컴포넌트에서 fixture 데이터 조회 (Supabase DB)
  - ✅ 프리매치: H2H SportMonks API 직접 호출, 부상자 DB 조회 (빈 배열 fallback)
  - ✅ 라이브: 스탯·이벤트·라인업 DB 데이터 연동, 60초 TanStack Query 폴링
  - ✅ 포스트매치: 최종 스탯·이벤트 DB 데이터 연동
  - ✅ 더미 데이터(`lib/mock`) → 실제 Supabase DB + SportMonks API로 완전 교체
  - **구현 세부사항**:
    - `lib/repositories/fixture-repository.ts` — `getFixtureById()` 추가
    - `lib/repositories/injury-repository.ts` — injuries 테이블 DB 조회 (신규)
    - `lib/repositories/mappers.ts` — `InjuryRow` + `injuryRowToInjuredPlayer()` 추가
    - `lib/services/h2h.ts` — SportMonks H2H API → H2HResult[] 변환 서비스 (신규)
    - `app/api/matchday/fixture/route.ts` — 경기 상세 폴링 API `GET /api/matchday/fixture?id=N` (신규)
    - `lib/hooks/use-fixture-detail.ts` — TanStack Query 훅 (LIVE: 60초, 비라이브: 폴링 없음) (신규)
    - `app/(app)/matchday/[fixtureId]/_components/fixture-detail-content.tsx` — 폴링 Client Component 래퍼 (신규)
    - `app/(app)/matchday/[fixtureId]/page.tsx` — Server Component → initialData → Client 폴링 패턴
  - **Playwright MCP 직접 브라우저 검증** ✅ (E2E 코드 파일 대신 MCP 직접 검증 방식 채택):
    - ✅ 실제 fixture ID(`/matchday/19427718`) 접속 → Wolves 2-2 Arsenal DB 데이터 렌더링 확인
    - ✅ 예정 경기(`/matchday/19427187`) → 프리매치 탭 자동 선택 확인 (Brighton vs Liverpool)
    - ✅ 종료 경기 → 포스트매치 탭 자동 선택 확인
    - ✅ 포스트매치 탭: 점유율·슈팅·유효슈팅·코너킥·파울 실데이터 + 이벤트 타임라인 (실제 선수명·링크)
    - ✅ 프리매치 탭: H2H 실데이터 (SportMonks API, 최근 6경기) 표시 확인
    - ✅ 프리매치 탭: 부상자 없음 graceful fallback ("부상자 없음") 표시 확인
    - ✅ 순위 시뮬레이터 인터랙션: "홈팀 승" 클릭 → +3pts → 43pts 즉시 반영 확인
    - ✅ 라이브 탭: "60초마다 자동 갱신" 표시기 확인
    - ✅ API 엔드포인트(`/api/matchday/fixture?id=19427718`) JSON 구조 정상 확인
    - ✅ 콘솔 에러 0개
  - **관련 기능**: F003, F004, F005
  - **의존성**: Task 005, Task 011, Task 012, Task 013

- **Task 018: 선수 데이터 연동 (F006, F007, F008, F011)** ✅ — 완료
  - ✅ 선수 검색: 클라이언트 사이드 ilike 기반 Fuzzy 검색 (이름/팀/포지션/국적 필터링)
  - ✅ 선수 프로필: 시즌 스탯 + 맥락 데이터 DB 조회 (player_season_stats)
  - ✅ 레이더 차트: DB 저장된 radar_data JSONB 조회 + 포지션 평균 오버레이
  - ✅ 최근 10경기 폼: player_match_stats 조회 (fixture_id 역순, limit 10)
  - ✅ 더미 데이터 → 실제 DB 데이터로 교체
  - **신규 파일**:
    - `lib/repositories/player-repository.ts` — `getAllPlayers`, `getPlayerById`, `getPlayerSeasonStats`, `getPlayerSeasonStatsByIds`, `getMatchStatsByPlayerId` (신규)
    - `lib/repositories/mappers.ts` — `PlayerRow`, `PlayerSeasonStatsRow`, `PlayerMatchStatsRow` 타입 + 변환 함수 3개 추가
    - `lib/repositories/team-repository.ts` — `getAllTeams()` 함수 추가
    - `app/(app)/players/page.tsx` — mock → DB SSR 조회, `getPlayerSeasonStatsByIds` 배치 조회 (N+1 방지)
    - `app/(app)/players/_components/player-search-page.tsx` — mock `searchPlayers` → 인라인 `filterPlayers`
    - `app/(app)/players/_components/player-card-grid.tsx` — mock import 제거, `seasonStatsMap` props 수신
    - `app/(app)/players/[playerId]/page.tsx` — mock → repository, `Promise.all` 병렬 조회
  - **Playwright MCP 직접 브라우저 검증** ✅:
    - ✅ `/players` → DB에서 50명 실제 PL 선수 카드 렌더링 확인
    - ✅ 실제 player ID(`/players/16827155`) 접속 → Bukayo Saka 실시즌 스탯 (골 16, 어시스트 9, 평점 7.7) 렌더링 확인
    - ✅ 선수 프로필 → 레이더 차트에 DB 저장된 포지션 평균 데이터 오버레이 확인
    - ✅ xG/xA → Starter 플랜 미지원 → N/A 처리 확인
    - ✅ 존재하지 않는 playerId(`/players/99999999`) 접속 → 404 표시 확인 (500 아님)
    - ✅ rank=0 기본값(context 미계산) → 맥락 텍스트 숨김 처리 확인 (Task 019에서 계산 예정)
  - **관련 기능**: F006, F007, F008, F011
  - **의존성**: Task 006, Task 007, Task 008, Task 011

- **Task 019: 맥락 데이터 계산 엔진 구현**
  - [ ] 리그 내 순위 계산 (포지션별/전체)
  - [ ] 백분위 계산 (포지션 내 상대적 위치)
  - [ ] 전년 시즌 비교 데이터 생성 (증감율, 방향)
  - [ ] 계산 결과를 `player_season_stats`에 저장하는 배치 로직
  - [ ] 데이터 동기화 Cron과 연계 (스탯 동기화 후 자동 계산)
  - **테스트**:
    - [ ] 순위/백분위 계산 정확성 검증 (경계값 포함)
    - [ ] 전년 데이터 없는 신규 선수 처리 확인
  - **Playwright 검증**:
    - [ ] 선수 프로필 → 골 스탯 카드에 "리그 N위" 형태 텍스트 표시 확인
    - [ ] 선수 프로필 → 백분위 프로그레스 바 값이 0~100 범위 내 확인
    - [ ] 선수 프로필 → 전년 비교 ↑ 또는 ↓ 아이콘 표시 확인
    - [ ] 신규 선수(전년 데이터 없음) 프로필 → 비교 섹션 "해당 없음" 또는 미표시 처리 확인
  - **관련 기능**: F006 (맥락 스탯의 핵심)
  - **의존성**: Task 011, Task 015

---

### Phase 4: 고급 기능 및 최적화

- **Task 020: 라이브 스코어 실시간 시스템 고도화 (F002)**
  - [ ] 라이브 경기 감지 및 폴링 주기 자동 전환 (60초 ↔ 5분)
  - [ ] SportMonks Livescores 엔드포인트 최적화
  - [ ] 라이브 이벤트 발생 시 시각적 피드백 (골 알림 애니메이션 등)
  - [ ] 경기 종료 감지 후 폴링 중단 및 최종 데이터 갱신
  - **Playwright 검증**:
    - [ ] 라이브 경기 존재 시 `/matchday` → 해당 카드에 pulse 애니메이션 클래스 확인
    - [ ] 네트워크 요청 로그에서 라이브 경기 시 60초, 비라이브 시 5분 간격 폴링 확인
    - [ ] 골 발생 이벤트 시뮬레이션 → 스코어 업데이트 및 알림 애니메이션 렌더링 확인
    - [ ] 경기 종료 후 페이지 → "FT" 배지로 변경 및 폴링 중단 확인
  - **관련 기능**: F002
  - **의존성**: Task 016

- **Task 021: 비교 카드 OG 이미지 생성 및 공유 (F010)**
  - [ ] `@vercel/og` 기반 OG 이미지 동적 생성 API 라우트
  - [ ] 배틀카드 디자인 템플릿 (양 선수 사진, 핵심 스탯 비교, 승자 표시)
  - [ ] "Compare on pitch-ac" 워터마크 적용
  - [ ] 이미지 다운로드 기능
  - [ ] 비교 URL 공유 시 OG 메타태그 자동 설정
  - **Playwright 검증**:
    - [ ] `/api/og?p1=[id1]&p2=[id2]` 접속 → PNG 이미지 응답 렌더링 확인
    - [ ] OG 이미지에 "Compare on pitch-ac" 워터마크 텍스트 포함 확인
    - [ ] `/compare?p1=[id1]&p2=[id2]` 페이지 소스 → `<meta property="og:image">` 태그 존재 확인
    - [ ] "Share as Image" 버튼 클릭 → 이미지 다운로드 트리거 확인 (download 속성 링크 또는 blob URL)
  - **관련 기능**: F010
  - **의존성**: Task 009, Task 018

- **Task 022: 성능 최적화**
  - [ ] Server Components 최적화 (데이터 패칭 전략)
  - [ ] 이미지 최적화 (next/image, 선수 사진·팀 로고)
  - [ ] 로딩 상태 개선 (Suspense boundary, 스켈레톤 UI)
  - [ ] API 응답 캐싱 전략 (ISR, stale-while-revalidate)
  - [ ] 번들 사이즈 최적화 (dynamic import, 트리쉐이킹)
  - **Playwright 검증**:
    - [ ] `/matchday` 접속 → 첫 페인트 전 스켈레톤 UI 표시 후 데이터 교체 확인
    - [ ] 선수 사진 이미지 요소 → `loading="lazy"` 속성 또는 `next/image` 렌더링 확인
    - [ ] 두 번째 접속 시 첫 번째보다 응답 시간 단축 확인 (캐시 효과)
    - [ ] 콘솔에 "Large page weight" 또는 번들 경고 없음 확인
  - **관련 기능**: 전체
  - **의존성**: Phase 3 완료

- **Task 023: 프로덕션 배포 및 모니터링**
  - [ ] Vercel 프로덕션 환경 설정
  - [ ] 환경변수 설정 (Supabase, SportMonks, API-Football, CRON_SECRET)
  - [ ] Vercel Cron Jobs 활성화 및 검증
  - [ ] 에러 모니터링 설정
  - [ ] 도메인 연결 및 SSL
  - [ ] OG 메타태그 및 SEO 기본 설정
  - **Playwright 검증**:
    - [ ] 프로덕션 URL 접속 → HTTPS 연결 및 200 응답 확인
    - [ ] 프로덕션 `/matchday` → 실제 PL 데이터 렌더링 확인
    - [ ] 페이지 소스 → `<title>`, `<meta name="description">`, OG 태그 존재 확인
    - [ ] 환경변수 누락 시뮬레이션 → 500 에러 대신 적절한 에러 UI 표시 확인
    - [ ] Vercel Cron 엔드포인트 수동 호출 → 정상 응답 확인
  - **관련 기능**: 전체
  - **의존성**: Phase 3 완료

---

## 기능-Task 매핑 검증

| 기능 ID | 기능명                  | 커버 Task                    |
| ------- | ----------------------- | ---------------------------- |
| F001    | 게임위크 경기 목록      | Task 004, Task 016           |
| F002    | 라이브 스코어 폴링      | Task 004, Task 016, Task 020 |
| F003    | 프리매치 프리뷰         | Task 005, Task 017           |
| F004    | 라이브 경기 스탯        | Task 005, Task 017           |
| F005    | 포스트매치 요약         | Task 005, Task 017           |
| F006    | 선수 프로필 & 맥락 스탯 | Task 007, Task 018, Task 019 |
| F007    | 레이더 차트             | Task 008                     |
| F008    | 최근 폼 스파크라인      | Task 007, Task 018           |
| F009    | 선수 비교 배틀카드      | Task 009, Task 018           |
| F010    | 비교 카드 이미지 공유   | Task 021                     |
| F011    | 선수 검색 자동완성      | Task 006, Task 018           |
| F012    | 용어 설명 팝오버        | Task 010                     |
| F013    | 글로벌 내비게이션       | Task 001, Task 003           |
| F014    | 기본 인증               | ✅ 구현 완료                 |

---

## API 소스별 Task 매핑

| Task     | SportMonks (메인)                 | API-Football (보충) |
| -------- | --------------------------------- | ------------------- |
| Task 012 | 서비스 레이어 전체                | -                   |
| Task 013 | -                                 | 서비스 레이어 전체  |
| Task 016 | fixtures, livescores              | 폴백                |
| Task 017 | fixtures (stats, lineups, events) | H2H 상세            |
| Task 018 | players (statistics, sidelined)   | 추가 스탯 보충      |
| Task 019 | standings                         | standings (검증용)  |

---

**📅 최종 업데이트**: 2026-03-21
**📊 진행 상황**: Phase 1 완료 ✅ | Phase 2 완료 ✅ | Phase 3 진행 중 (Task 011, 012, 015, 016, 017, 018 완료)

- **완료**: Task 001~012 (12개), Task 015~017 (3개), Task 013·014 생략 결정
- **다음**: Task 018 (선수 데이터 연동) → Task 019 (맥락 데이터 계산 엔진)

> **검증 방식 변경 (2026-03-21)**: UI 변경 시 유지보수 부담을 줄이기 위해 `e2e/`, `__tests__/` 코드 파일 방식에서 **Playwright MCP 직접 브라우저 검증** 방식으로 전환. Task 016·017의 E2E 테스트 파일 삭제, 이후 Task들은 MCP 직접 검증으로 진행.
