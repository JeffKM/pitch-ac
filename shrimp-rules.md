# Development Guidelines

## 프로젝트 개요

- **목적**: PL(프리미어리그) 선수·경기 데이터를 맥락(순위·백분위·전년 비교)과 함께 시각적으로 보여주는 데이터 플랫폼
- **핵심 기능**: 매치데이 대시보드, 선수 프로필(맥락 스탯), 선수 비교 배틀카드, OG 이미지 공유
- **현재 상태**: Supabase 스타터킷 기반, 인증 플로우 구현 완료, PL 데이터 기능 미구현 (MVP 초기)
- **기술 스택**: Next.js 16+ (App Router), React 19, TypeScript 5 (strict), Tailwind CSS v4, shadcn/ui, Supabase, TanStack Query v5, Zustand v5

---

## 프로젝트 아키텍처

### 디렉토리 구조

```
pitch-ac/
├── app/                          # Next.js App Router
│   ├── globals.css               # Tailwind v4 테마 정의 (@theme inline, OKLCH)
│   ├── layout.tsx                # 루트 레이아웃 (ThemeProvider)
│   ├── page.tsx                  # 루트 페이지 (→ /matchday 리디렉션 예정)
│   ├── auth/                     # 인증 라우트 (구현 완료)
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── callback/route.ts     # OAuth 콜백
│   │   └── confirm/route.ts      # 이메일 인증
│   └── protected/                # 인증 필요 페이지
├── components/                   # 공유 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트 (CLI로 추가)
│   └── *.tsx                     # 커스텀 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # 브라우저용 Supabase 클라이언트
│   │   ├── server.ts             # 서버용 Supabase 클라이언트
│   │   └── proxy.ts              # 미들웨어 세션 갱신
│   └── utils.ts                  # cn() 유틸리티
├── docs/                         # PRD, ROADMAP, LEANCANVAS
├── proxy.ts                      # Next.js 미들웨어 진입점
├── components.json               # shadcn/ui 설정
├── eslint.config.mjs             # ESLint flat config
├── prettier.config.mjs           # Prettier 설정
└── postcss.config.mjs            # PostCSS (Tailwind v4)
```

### 계획된 Route Groups 구조 (Phase 1)

```
app/
├── (marketing)/                  # 랜딩, 소개 페이지
├── (app)/                        # 핵심 앱 기능
│   ├── layout.tsx                # 글로벌 내비게이션 포함
│   ├── matchday/
│   │   ├── page.tsx              # 매치데이 대시보드
│   │   └── [fixtureId]/page.tsx  # 경기 상세
│   ├── players/
│   │   ├── page.tsx              # 선수 검색
│   │   └── [playerId]/page.tsx   # 선수 프로필
│   └── compare/
│       └── page.tsx              # 선수 비교
└── (auth)/                       # 인증 라우트
```

### 레이어드 아키텍처

- **Route Handler / Server Component** → **Service Layer** → **Repository (Supabase)**
- DTO 패턴 사용, API 응답은 `ApiResponse<T>` 래퍼로 일관성 유지
- 의존성 주입 원칙 준수

---

## 코드 규칙

### Export 규칙

- **named export 필수** — `export function ComponentName()` 또는 `export const value`
- **예외 파일** (default export 허용): `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`, `default.tsx`, `next.config.ts`, `postcss.config.mjs`, `prettier.config.mjs`, `eslint.config.mjs`

```tsx
// DO
export function PlayerCard() { ... }

// DON'T
export default function PlayerCard() { ... }
```

### 임포트 규칙

- `eslint-plugin-simple-import-sort` 자동 정렬 적용
- 개별 임포트 사용 (트리쉐이킹)
- `@/*` path alias 필수 사용

```tsx
// DO
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft } from "lucide-react";

// DON'T
import * as Icons from "lucide-react";
import { Button } from "../../components/ui/button";
```

### 포매팅

- 들여쓰기: 2칸
- 세미콜론: 사용
- 따옴표: 더블쿼트 `"`
- trailing comma: `all`
- print width: 80
- 줄바꿈: LF

### 주석 및 문서

- 코드 주석: 한국어
- 커밋 메시지: 한국어, 컨벤셔널 커밋 (이모지 접두사)
- 문서: 한국어
- 변수명/함수명: 영어

---

## 기능 구현 규칙

### 맥락 데이터 필수 규칙 (핵심)

- **모든 숫자 데이터에 맥락을 함께 표시** — 리그 순위, 백분위, 전년 비교 중 **최소 1개** 필수

```tsx
// DO — 맥락과 함께 표시
<StatCard
  label="Goals"
  value={15}
  rank={3}              // 리그 순위
  percentile={94}       // 포지션 내 백분위
  prevSeason={12}       // 전년 비교
/>

// DON'T — 숫자만 단독 표시
<StatCard label="Goals" value={15} />
```

### 축구 전문 용어 팝오버

- xG, xA, xGI, 점유율, 키패스 등 전문 용어에 `GlossaryPopover` 컴포넌트로 [?] 설명 제공
- 1줄 정의 + 비유 + 예시 구조

```tsx
// DO
<span>xG <GlossaryPopover term="xG" /></span>

// DON'T — 용어 설명 없이 약어만 표시
<span>xG: 12.5</span>
```

### Server Component vs Client Component

- **Server Component 우선** — 데이터 패칭, 인증 확인, 정적 렌더링
- **Client Component 사용 조건**:
  - 사용자 상호작용 (onClick, onChange 등)
  - 브라우저 API 접근 (localStorage, window 등)
  - 상태 관리 (useState, useReducer, Zustand)
  - 실시간 폴링 (TanStack Query refetchInterval)
  - 차트 렌더링 (Recharts)

```
판단 흐름:
1. 데이터 패칭만 필요? → Server Component
2. 인증 확인만 필요? → Server Component
3. 클릭/입력 이벤트 있음? → Client Component
4. 실시간 갱신 필요? → Client Component
5. 차트/애니메이션? → Client Component
```

### Supabase 클라이언트 생성 패턴

```tsx
// 서버 (Server Component / Route Handler)
// 매 요청마다 새 인스턴스 생성 필수 — 전역 변수 저장 금지
import { createClient } from "@/lib/supabase/server";

async function getData() {
  const supabase = await createClient(); // 함수 내부에서 생성
  const { data } = await supabase.from("players").select("*");
  return data;
}

// 브라우저 (Client Component)
import { createClient } from "@/lib/supabase/client";

function handleAction() {
  const supabase = createClient();
  // ...
}
```

---

## 프레임워크/라이브러리 사용 규칙

### Tailwind CSS v4

- **`tailwind.config.ts` 파일 없음** — CSS-first 설정 방식
- 모든 테마·색상·변수는 `app/globals.css`의 `@theme inline` 블록에서 정의
- 색상 공간: OKLCH
- 커스텀 CSS 파일 생성 금지 — Tailwind 유틸리티 클래스만 사용
- 애니메이션: `tw-animate-css` 패키지
- PostCSS 플러그인: `@tailwindcss/postcss`

```css
/* DO — globals.css에서 테마 변수 정의 */
@theme inline {
  --color-primary: var(--primary);
}

/* DON'T — 별도 CSS 파일 생성 */
/* components/player-card.css ← 금지 */
```

### shadcn/ui

- 스타일: `new-york`
- 컴포넌트 경로: `@/components/ui/`
- 추가 방법: `npx shadcn@latest add <component-name>`
- `components.json` 설정 참조
- RSC 지원 활성화 (`"rsc": true`)

### lucide-react

- **개별 아이콘 임포트 필수**

```tsx
// DO
import { ChevronLeft, Trophy } from "lucide-react";

// DON'T
import * as LucideIcons from "lucide-react";
```

### TanStack Query v5 (서버 상태)

- 라이브 경기 폴링: `refetchInterval: 60_000` (60초)
- 비라이브 폴링: `refetchInterval: 300_000` (5분)
- API 캐싱, 에러 핸들링, 로딩 상태 관리

### Zustand v5 (클라이언트 상태)

- UI 상태, 비교 선수 목록 등 클라이언트 전용 상태만 관리
- 서버 상태는 TanStack Query로 처리

### 차트/시각화

- **Recharts** — 레이더 차트, 스파크라인 (Client Component로 구현)
- **@vercel/og** — 배틀카드 OG 이미지 동적 생성

### next-themes

- `ThemeProvider`는 루트 레이아웃에 1회만 설정
- `attribute="class"`, `defaultTheme="system"` 설정 유지

---

## 워크플로우 규칙

### 코드 품질 검증

| 명령어                 | 용도                                       |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | 개발 서버 실행                             |
| `npm run build`        | 프로덕션 빌드                              |
| `npm run lint`         | ESLint 검사                                |
| `npm run lint:fix`     | ESLint 자동 수정                           |
| `npm run format`       | Prettier 포매팅                            |
| `npm run format:check` | Prettier 검사                              |
| `npm run type-check`   | TypeScript 타입 검사                       |
| `npm run validate`     | type-check + lint + format:check 통합 검증 |

### Pre-commit 훅

- Husky가 `pre-commit`에서 자동 실행:
  1. `lint-staged` — 변경 파일에 ESLint + Prettier 적용
  2. `tsc --noEmit` — 전체 프로젝트 타입 검사
- 커밋 전 반드시 `npm run validate` 통과 확인

### 커밋 메시지 형식

```
<이모지> <타입>: <한국어 설명>

예시:
✨ feat: 매치데이 대시보드 경기 카드 컴포넌트 추가
🐛 fix: 선수 프로필 맥락 스탯 백분위 계산 오류 수정
♻️ refactor: Supabase 클라이언트 팩토리 패턴 적용
📝 docs: PRD 기반 린캔버스 문서 추가
🔧 chore: ESLint 설정 업데이트
```

---

## 주요 파일 상호작용 규칙

### 테마/색상 변경

- `app/globals.css` **만** 수정 — `@theme inline` 블록 및 `:root` / `.dark` 변수
- `tailwind.config.ts` 생성하지 않음

### UI 컴포넌트 추가

- shadcn/ui CLI 사용: `npx shadcn@latest add <name>`
- 생성 위치: `components/ui/<name>.tsx`
- `components.json` 설정 자동 참조

### 인증 관련 수정

- 3개 파일을 동시에 확인:
  1. `lib/supabase/client.ts` — 브라우저 클라이언트
  2. `lib/supabase/server.ts` — 서버 클라이언트
  3. `lib/supabase/proxy.ts` — 미들웨어 세션 갱신
- `proxy.ts` (루트) — 미들웨어 진입점, matcher 패턴 확인

### 새 페이지 추가

1. `app/` 내 해당 Route Group에 `page.tsx` 생성
2. `page.tsx`는 **default export** 사용 (ESLint 예외)
3. 동적 라우트: `[param]` 폴더 사용
4. 레이아웃 필요시 같은 디렉토리에 `layout.tsx` 생성

### ESLint 규칙 변경

- `eslint.config.mjs` 수정
- default export 예외 파일 추가 시 `files` 배열에 패턴 추가

### 환경변수 추가

- `.env.local`에 추가
- `NEXT_PUBLIC_` 접두사: 클라이언트 노출 가능
- 접두사 없음: 서버 전용

---

## AI 결정 기준

### Server Component vs Client Component 판단 트리

```
새 컴포넌트 생성 →
├── 데이터 패칭/DB 조회만? → Server Component
├── 인증 확인만? → Server Component
├── 정적 UI (props 기반)? → Server Component
├── 사용자 입력/클릭 필요? → Client Component ("use client")
├── useState/useEffect 필요? → Client Component
├── 실시간 폴링 필요? → Client Component (TanStack Query)
├── Recharts 차트? → Client Component
└── 확실하지 않음? → Server Component로 시작, 필요시 전환
```

### API 데이터 소스 선택

| 데이터                       | 소스                                   |
| ---------------------------- | -------------------------------------- |
| 경기 일정/결과, 라이브스코어 | SportMonks (메인)                      |
| 선수 시즌 스탯, xG           | SportMonks (메인)                      |
| 라인업, 이벤트               | SportMonks (메인)                      |
| H2H 상세, 예측               | API-Football (보충)                    |
| 부상/결장                    | SportMonks (메인)                      |
| 순위                         | SportMonks (메인), API-Football (검증) |

- SportMonks League ID: `8` (PL)
- API-Football League ID: `39` (PL)

### 맥락 데이터 표시 방식

| 맥락 유형 | 표시 형식                   | 예시                |
| --------- | --------------------------- | ------------------- |
| 리그 순위 | `#N`                        | #3 in PL            |
| 백분위    | `N%` (프로그레스 바 시각화) | Top 6% among FWD    |
| 전년 비교 | `↑↓` + 증감 수치            | ↑ +3 vs last season |

- 최소 1개 필수, 가능하면 3개 모두 표시

---

## 금지 사항

- **`tailwind.config.ts` 생성 금지** — Tailwind CSS v4는 CSS-first, `globals.css`에서 관리
- **커스텀 CSS 파일 생성 금지** — Tailwind 유틸리티 클래스만 사용
- **default export 금지** — 위 예외 파일 목록 외 모든 파일
- **Supabase 서버 클라이언트 전역 변수 저장 금지** — 매 요청마다 `await createClient()` 호출
- **숫자 데이터 단독 표시 금지** — 반드시 맥락(순위/백분위/전년 비교) 동반
- **축구 전문 용어 설명 없이 표시 금지** — `GlossaryPopover` 필수
- **`import *` 사용 금지** — 개별 임포트만 허용
- **상대 경로 임포트 금지** — `@/*` alias 사용
- **`tailwindcss-animate` 사용 금지** — `tw-animate-css` 사용
- **Server Component에서 브라우저 API 접근 금지**
- **Client Component에서 `cookies()`, `headers()` 접근 금지**
- **`.env.local` 파일 커밋 금지**
- **`node_modules/`, `.next/`, `shrimp_data/` 커밋 금지**
- **pre-commit 훅 건너뛰기(`--no-verify`) 금지**
