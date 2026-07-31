# pitch-ac

유럽 5대 리그(PL, La Liga, Serie A, Bundesliga, Ligue 1) 경기·순위·선수 데이터를 맥락과 함께 시각화하는 축구 데이터 플랫폼.
핵심 기능: 매치데이 대시보드, Ranking(5대 리그+UCL 순위표), ScoutLab(60+ 메트릭 스카우팅 분석), News(이적뉴스 큐레이션).
현재 상태: 5대 리그 데이터 인프라 완료, ScoutLab 메트릭 1,519명·Action Maps 1,843명(5대 리그 전체). 로드맵은 `docs/ROADMAP.md` 참조.

## 모델 운용 정책 (IMPORTANT — 모든 세션에서 강제)

메인 루프(Fable)는 **오케스트레이터 전용**이다. Fable이 직접 코드를 작성·수정하는 것은 정책 위반.

- **Fable(메인 루프)이 하는 일**: 요구사항 파악, 계획 수립, 작업 분해, Agent 도구로 위임, 결과 검토·종합, 사용자 보고. 이것뿐이다.
- **실제 작업은 반드시 Agent 도구의 `model` 파라미터로 위임한다**:
  - `model: "opus"` — 복잡한 구현, 아키텍처 변경, 까다로운 버그 수정, 코드 리뷰
  - `model: "sonnet"` — 일반 구현, 리팩토링, 테스트 작성, 문서화, 탐색·조사, 단순 수정
- **Fable의 직접 Edit/Write 허용 예외** (이것 외에는 전부 위임):
  - CLAUDE.md·메모리·ROADMAP 등 지시/기록 문서 갱신
  - 서브에이전트 결과물의 1~2줄 수준 미세 조정
- Workflow 스크립트 사용 시에도 각 `agent()` 호출에 `model: 'opus'` 또는 `model: 'sonnet'`을 명시한다 (생략 시 Fable을 상속하므로 반드시 명시).
- 작업 시작 전 자가 점검: "지금 내가 Edit/Write/Bash로 구현을 직접 하려는가?" → 그렇다면 멈추고 Agent로 위임.

## 개발 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 포매팅
npm run format:check # Prettier 검사
npm run type-check   # TypeScript 타입 체크
npm run validate     # type-check + lint + format:check 통합 검증
```

## 코드 품질 자동화

- **Prettier** — `prettier.config.mjs` (prettier-plugin-tailwindcss, tailwindStylesheet 방식)
- **ESLint** — `eslint-config-prettier` + `simple-import-sort` + named export 강제
- **Husky** — pre-commit 훅에서 `lint-staged` + `tsc --noEmit` 실행
- **lint-staged** — 커밋 시 변경 파일만 ESLint + Prettier 자동 적용

## 기술 스택 특이사항

- Tailwind CSS **v4** 사용 (CSS-first 설정, `@theme inline` 방식)
- tailwind.config.ts 없음 — 모든 테마 설정은 `app/globals.css`에 정의
- 색상: OKLCH 색상 공간, 애니메이션: tw-animate-css
- Next.js `cacheComponents: true` 활성화 (`next.config.ts`)
- shadcn/ui 설정은 `components.json` 참조
- Supabase 인증: `@supabase/ssr` 기반, `lib/supabase/proxy.ts`로 세션 관리

## 프로젝트 규칙

- default export 대신 named export (page.tsx, layout.tsx 등 Next.js 규약 파일은 예외)
- 모든 숫자 데이터에 맥락 함께 표시 (리그 순위, 백분위, 전년 비교 중 최소 1개)
- 축구 전문 용어(xG, xA 등)에는 설명 팝오버 제공
- 커스텀 CSS 파일 금지, Tailwind 유틸리티 클래스만 사용
- `@/*` path alias 사용

## 개발 워크플로우 (스킬 기반)

작업 유형별 표준 프로세스. 해당 유형의 작업을 시작하기 전에 명시된 스킬을 로드한다.

- **기능 개발**: `superpowers:brainstorming`(설계 합의) → `superpowers:writing-plans`(구현 계획) → `superpowers:test-driven-development` → `code-reviewer`(리뷰)
- **UI 작업**: 기능 개발 프로세스 + 완료 전 `design-review` 또는 `web-design-guidelines` 통과
- **버그 수정**: `superpowers:systematic-debugging` — 근본 원인 규명 전 수정 금지
- **배포 전 검증**: `qa`(Playwright 시나리오) + `security-scan`
- **DB/쿼리 작업**: `postgres-best-practices` 참조 + Supabase advisors 확인
- **차트/시각화**: `dataviz` 로드 후 작성
- **로드맵 관리**: `development-planner` 스킬 사용. Phase 헤더의 `> 적용 스킬:` 태그 유지

## Supabase 인증

- 브라우저: `@/lib/supabase/client` (Client Component)
- 서버: `@/lib/supabase/server` (매 요청마다 새 인스턴스 생성 필수)
- 세션 갱신: `lib/supabase/proxy.ts`의 `updateSession()`

## 외부 API

- **football-data.org** (api.football-data.org/v4) — 무료 플랜 (10 요청/분)
- 인증: `X-Auth-Token` 헤더
- Competition codes: PL, PD(La Liga), SA(Serie A), BL1(Bundesliga), FL1(Ligue 1)
- PL Competition ID: 2021, 맨시티 Team ID: 65
- 클라이언트: `lib/api/football-data/client.ts`
- Rate limiter: `lib/api/football-data/rate-limiter.ts` (분당 10회 슬라이딩 윈도우)
- 이미지: `crests.football-data.org` (SVG 크레스트)

## 환경 변수

`.env.local` 필수:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `FOOTBALL_DATA_API_KEY`
- `GOOGLE_AI_API_KEY` (Action Maps Vision 추출용, Google AI Studio에서 발급)

## Summary Instructions

대화 압축 시 반드시 유지할 내용:

1. PL 데이터 플랫폼, 모든 숫자에 맥락 필수
2. Tailwind v4 사용 (CSS-first, @theme inline)
3. Supabase 서버 클라이언트는 매 요청마다 새 인스턴스
