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

- **Task 008: 레이더 차트 컴포넌트 구현 (F007)**
  - [ ] Recharts 기반 레이더 차트 Client Component
  - [ ] 선수 능력치 vs 포지션 평균 오버레이 (2개 데이터셋)
  - [ ] 강점/약점 라벨 표시
  - [ ] 비교 모드: 2명의 선수 데이터 중첩 (선수 비교 페이지용)
  - [ ] 반응형 크기 조절
  - [ ] 선수 프로필 페이지, 선수 비교 페이지 양쪽에 적용
  - **Playwright 검증**:
    - [ ] `/players/[더미playerId]` 접속 → 레이더 차트 SVG 요소 렌더링 확인
    - [ ] SVG 내 2개의 폴리곤/패스 요소 존재 확인 (선수 vs 포지션 평균)
    - [ ] 강점/약점 텍스트 라벨 표시 확인
    - [ ] `/compare?p1=X&p2=Y` 접속 → 레이더 차트 SVG에 2개 데이터셋 렌더링 확인
    - [ ] 뷰포트 375px → 차트 컨테이너 너비가 뷰포트에 맞게 축소 확인
    - [ ] 뷰포트 1280px → 차트 컨테이너 너비가 확대 확인
  - **관련 기능**: F007
  - **의존성**: Task 002

- **Task 009: 선수 비교 배틀카드 UI (F009)**
  - [ ] 선수 A/B 자동완성 검색 입력 (각 슬롯 독립)
  - [ ] 레이더 차트 오버레이 (Task 008 비교 모드 활용)
  - [ ] 스탯 비교 테이블: 골·xG·어시스트·키패스·드리블·평균 평점
  - [ ] 지표별 승자 트로피 아이콘
  - [ ] "Verdict: X leads in N/6 categories" 텍스트
  - [ ] URL 파라미터 기반 선수 선택 (p1, p2 쿼리 파라미터)
  - [ ] "Share as Image" 버튼 (Phase 4에서 실제 구현, UI만 배치)
  - **Playwright 검증**:
    - [ ] `/compare` 접속 → 선수 A/B 검색 슬롯 2개 표시 확인
    - [ ] 선수 A 슬롯에 이름 입력 → 자동완성 드롭다운 표시 및 선택
    - [ ] 선수 B 슬롯에 이름 입력 → 자동완성 드롭다운 표시 및 선택
    - [ ] 양 선수 선택 후 스탯 비교 테이블(6행) 렌더링 확인
    - [ ] 각 행에 트로피 아이콘 표시 확인
    - [ ] "Verdict: X leads in N/6 categories" 텍스트 표시 확인
    - [ ] URL이 `?p1=[id1]&p2=[id2]` 형태로 업데이트 확인
    - [ ] `/compare?p1=[id1]&p2=[id2]` 직접 접속 → 두 선수 자동 로드 확인
    - [ ] "Share as Image" 버튼 UI 요소 존재 확인
  - **관련 기능**: F009
  - **의존성**: Task 006, Task 008

- **Task 010: 용어 설명 팝오버 시스템 (F012)**
  - [ ] `GlossaryPopover` 공통 컴포넌트: term 전달 시 정의·비유·예시 팝오버 표시
  - [ ] 15~20개 축구 전문 용어 데이터 구축 (xG, xA, xGI, 점유율, 키패스 등)
  - [ ] 수치 옆 [?] 아이콘으로 트리거
  - [ ] 선수 프로필 페이지, 경기 상세 페이지에 적용
  - **Playwright 검증**:
    - [ ] `/players/[더미playerId]` 접속 → xG 수치 옆 [?] 버튼 클릭
    - [ ] 팝오버 열림 확인 (정의·비유·예시 텍스트 표시)
    - [ ] 팝오버 외부 영역 클릭 → 팝오버 닫힘 확인
    - [ ] Escape 키 입력 → 팝오버 닫힘 확인
    - [ ] `/matchday/[더미fixtureId]` → xG [?] 버튼 클릭 → 팝오버 표시 확인
    - [ ] 팝오버 내 "xG"(Expected Goals) 정의 텍스트 포함 여부 확인
  - **관련 기능**: F012
  - **의존성**: Task 005, Task 007

---

### Phase 3: 백엔드 및 데이터 연동

- **Task 011: Supabase 데이터베이스 스키마 구축** — 우선순위
  - [ ] Supabase Migration 파일 생성:
    - `teams` 테이블 (PL 20개 팀)
    - `players` 테이블 (~550명 선수)
    - `player_id_mapping` 테이블 (sportmonks_id, api_football_id)
    - `player_season_stats` 테이블 (시즌 스탯 + 맥락 데이터)
    - `player_match_stats` 테이블 (경기별 스탯)
    - `fixtures` 테이블 (경기 정보 + 라이브 데이터 JSONB)
    - `glossary` 테이블 (용어 사전)
  - [ ] 인덱스 설정: team_id, player_id, fixture_id, gameweek, season
  - [ ] RLS 정책: 읽기 공개, 쓰기 서비스 역할만 허용
  - [ ] 초기 시드 데이터: glossary 용어 15~20개
  - **테스트**:
    - [ ] 모든 테이블 CRUD 동작 확인
    - [ ] RLS 정책 검증 (anon 읽기 O, 쓰기 X)
    - [ ] FK 관계 무결성 확인
  - **Playwright 검증**:
    - [ ] `/api/health` 또는 `/api/db-check` 접속 → DB 연결 성공 JSON 응답 확인
    - [ ] `/matchday` 접속 → 500 에러 페이지 미표시 (DB 연결 실패 없음 확인)
    - [ ] 콘솔에 Supabase 연결 에러 없음 확인
  - **관련 기능**: 전체
  - **의존성**: 없음 (Phase 2와 병렬 진행 가능)

- **Task 012: SportMonks API 서비스 레이어 구축**
  - [ ] `lib/api/sportmonks/` 디렉토리 구조:
    - `client.ts` — HTTP 클라이언트 (인증, rate limiting, 에러 핸들링)
    - `fixtures.ts` — 경기 일정/결과/라이브스코어/스탯/라인업/이벤트
    - `players.ts` — 선수 정보/시즌 스탯/부상
    - `teams.ts` — 팀 정보/순위
    - `rounds.ts` — 라운드/게임위크
    - `types.ts` — SportMonks 응답 타입 정의
  - [ ] includes 시스템 활용한 중첩 데이터 조회 패턴 구현
  - [ ] League ID: 8 (PL) 상수 설정
  - [ ] 응답 데이터 → 내부 타입 변환 매퍼 (SportMonks → App 타입)
  - **테스트**:
    - [ ] 각 엔드포인트 호출 및 응답 구조 검증
    - [ ] includes 파라미터 조합별 응답 확인
    - [ ] rate limit 도달 시 에러 핸들링 검증
    - [ ] 타입 변환 매퍼 정확성 검증
  - **Playwright 검증**:
    - [ ] `/api/debug/sportmonks/fixtures` 접속 → SportMonks 응답 JSON 렌더링 확인
    - [ ] `/api/debug/sportmonks/players` 접속 → 선수 데이터 JSON 렌더링 확인
    - [ ] 잘못된 API 키 설정 시 → 500이 아닌 적절한 에러 메시지 JSON 응답 확인
  - **관련 기능**: F001~F008
  - **의존성**: Task 002 (타입 정의)

- **Task 013: API-Football 서비스 레이어 구축**
  - [ ] `lib/api/api-football/` 디렉토리 구조:
    - `client.ts` — HTTP 클라이언트 (인증, rate limiting)
    - `fixtures.ts` — H2H 상세, 예측
    - `players.ts` — 추가 스탯 보충
    - `types.ts` — API-Football 응답 타입 정의
  - [ ] League ID: 39 (PL) 상수 설정
  - [ ] 응답 데이터 → 내부 타입 변환 매퍼
  - **테스트**:
    - [ ] H2H 데이터 조회 및 응답 검증
    - [ ] SportMonks 미지원 데이터 보충 시나리오 검증
  - **Playwright 검증**:
    - [ ] `/api/debug/api-football/h2h?home=[teamId]&away=[teamId]` 접속 → H2H 데이터 JSON 확인
    - [ ] 경기 상세 페이지 H2H 탭 → 실제 API-Football 데이터 렌더링 확인
  - **관련 기능**: F003 (H2H 보충)
  - **의존성**: Task 002 (타입 정의)

- **Task 014: 선수 ID 매핑 시스템 구현**
  - [ ] SportMonks ID ↔ API-Football ID 매핑 로직
  - [ ] `player_id_mapping` 테이블 기반 조회
  - [ ] 매핑 없는 선수 감지 및 로깅
  - [ ] 초기 매핑 데이터 시딩 스크립트 (이름+팀 기반 자동 매칭)
  - **테스트**:
    - [ ] 매핑 존재 시 정상 조회
    - [ ] 매핑 없는 선수에 대한 폴백 동작 확인
  - **Playwright 검증**:
    - [ ] `/api/debug/player-mapping?sportmonksId=[id]` 접속 → API-Football ID 반환 JSON 확인
    - [ ] 선수 프로필 페이지 접속 → SportMonks + API-Football 양쪽 데이터 모두 렌더링 확인
    - [ ] 매핑 없는 선수 ID로 프로필 접속 → 에러 없이 부분 데이터 렌더링 확인
  - **관련 기능**: 전체 (API 간 데이터 통합)
  - **의존성**: Task 011, Task 012, Task 013

- **Task 015: 데이터 동기화 Cron 시스템 구축**
  - [ ] Vercel Cron 설정 (`vercel.json`):
    - 주 1회: 팀·선수 기본정보 동기화
    - 일간: 게임위크 종료 후 시즌 스탯 동기화
    - 매치데이 전날: 프리매치 데이터 동기화
    - 경기 종료 후: xG/상세 스탯 배치 동기화
  - [ ] `app/api/cron/` API 라우트:
    - `sync-teams/route.ts`
    - `sync-players/route.ts`
    - `sync-fixtures/route.ts`
    - `sync-stats/route.ts`
  - [ ] Cron 인증 (CRON_SECRET 환경변수)
  - [ ] 동기화 로그 및 에러 알림
  - **테스트**:
    - [ ] 각 Cron 엔드포인트 수동 호출 및 DB 반영 확인
    - [ ] 중복 실행 방지 (idempotency) 검증
    - [ ] 부분 실패 시 롤백 또는 재시도 동작 확인
  - **Playwright 검증**:
    - [ ] `Authorization: Bearer [CRON_SECRET]` 헤더로 `/api/cron/sync-teams` GET → `{ success: true }` JSON 확인
    - [ ] 인증 헤더 없이 `/api/cron/sync-teams` GET → 401 응답 확인
    - [ ] Cron 실행 후 `/matchday` 접속 → 동기화된 데이터 렌더링 확인
  - **관련 기능**: 전체 (데이터 최신성)
  - **의존성**: Task 011, Task 012

- **Task 016: 매치데이 데이터 연동 (F001, F002)**
  - [ ] 매치데이 대시보드 서버 컴포넌트에서 Supabase 직접 조회
  - [ ] 게임위크별 경기 목록 쿼리 (fixtures + teams JOIN)
  - [ ] 더미 데이터 → 실제 DB 데이터로 교체
  - [ ] TanStack Query 기반 라이브 폴링 설정 (Client Component):
    - 라이브 경기: refetchInterval 60초
    - 비라이브: refetchInterval 5분
  - **테스트**:
    - [ ] 게임위크 데이터 정상 렌더링 확인
    - [ ] 라이브 폴링 동작 확인 (네트워크 탭)
    - [ ] 빈 게임위크 처리 확인
  - **Playwright 검증**:
    - [ ] `/matchday` 접속 → 실제 PL 팀명 (더미 데이터가 아닌 DB 데이터) 렌더링 확인
    - [ ] 네트워크 요청 목록에서 60초 간격 폴링 요청 발생 확인
    - [ ] 경기 없는 게임위크 번호로 이동 → 빈 상태 UI 표시 확인
    - [ ] 페이지 새로고침 후 동일 데이터 유지 확인 (캐시/DB 일관성)
  - **관련 기능**: F001, F002
  - **의존성**: Task 004, Task 011, Task 015

- **Task 017: 경기 상세 데이터 연동 (F003, F004, F005)**
  - [ ] 경기 상세 서버 컴포넌트에서 fixture 데이터 조회
  - [ ] 프리매치: 최근 5경기 폼, H2H, 부상자 데이터 연동
  - [ ] 라이브: 스탯·이벤트·라인업 실시간 데이터 연동
  - [ ] 포스트매치: 최종 스탯 데이터 연동
  - [ ] 더미 데이터 → 실제 API/DB 데이터로 교체
  - **테스트**:
    - [ ] 각 탭별 데이터 정상 렌더링 확인
    - [ ] 경기 상태별 탭 자동 선택 확인
    - [ ] 존재하지 않는 fixtureId 에러 핸들링
  - **Playwright 검증**:
    - [ ] 실제 fixture ID로 `/matchday/[fixtureId]` 접속 → DB 데이터 렌더링 확인
    - [ ] 예정 경기 → 프리매치 탭 자동 선택 확인
    - [ ] 라이브 경기 → 라이브 탭 자동 선택 확인
    - [ ] 종료 경기 → 포스트매치 탭 자동 선택 확인
    - [ ] 존재하지 않는 fixtureId 접속 → 404 또는 에러 UI 표시 확인 (500 아님)
  - **관련 기능**: F003, F004, F005
  - **의존성**: Task 005, Task 011, Task 012, Task 013

- **Task 018: 선수 데이터 연동 (F006, F007, F008, F011)**
  - [ ] 선수 검색: Supabase full-text search 또는 ilike 기반 Fuzzy 검색
  - [ ] 선수 프로필: 시즌 스탯 + 맥락 데이터 조회
  - [ ] 레이더 차트: 포지션 평균 데이터 계산 쿼리
  - [ ] 최근 10경기 폼: player_match_stats 조회
  - [ ] 더미 데이터 → 실제 DB 데이터로 교체
  - **테스트**:
    - [ ] 검색어별 결과 정확성 확인
    - [ ] 맥락 데이터 (순위, 백분위) 정상 계산 확인
    - [ ] 존재하지 않는 playerId 에러 핸들링
  - **Playwright 검증**:
    - [ ] `/players`에서 실제 선수명 "Salah" 검색 → 검색 결과에 Mohamed Salah 표시 확인
    - [ ] 실제 player ID로 `/players/[playerId]` 접속 → 실제 시즌 스탯 수치 렌더링 확인
    - [ ] 선수 프로필 → 레이더 차트에 실제 포지션 평균 데이터 오버레이 확인
    - [ ] 최근 10경기 스파크라인에 실제 경기 데이터 반영 확인
    - [ ] 존재하지 않는 playerId 접속 → 404 또는 에러 UI 표시 확인 (500 아님)
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
**📊 진행 상황**: Phase 1 완료, Phase 2 진행 중 (5/23 Tasks 완료)
