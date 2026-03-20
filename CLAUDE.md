# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

PL(프리미어리그) 선수·경기 데이터를 맥락과 함께 시각적으로 보여주는 데이터 플랫폼.
"흩어진 데이터를 한 곳에, 숫자를 이야기로" — FBref의 데이터 깊이를 인스타그램의 비주얼로.

### MVP 핵심 기능
- **선수 프로필**: 핵심 스탯 + 맥락(리그 순위, 백분위, 전년 비교) + 레이더 차트
- **선수 비교 배틀카드**: 2~3명 비교 + 시각적 카드 + SNS 공유용 이미지 생성
- **매치데이 대시보드**: 프리매치(폼, H2H, 순위 시뮬레이션) → 라이브(모멘텀 그래프, 실시간 스탯, 이벤트 타임라인) → 포스트매치(데이터 리뷰)

## 개발 명령어

```bash
npm run dev           # 개발 서버 실행
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 서버 실행
npm run lint          # ESLint 검사
```

## 기술 스택 (현재 설치됨)

- **프레임워크**: Next.js 16 (App Router, `cacheComponents: true`) + React 19
- **언어**: TypeScript 5 (strict 모드, `any` 금지)
- **스타일링**: Tailwind CSS v3 + tailwindcss-animate
- **UI 컴포넌트**: shadcn/ui (new-york 스타일, `components.json` 참고)
- **DB/인증**: Supabase (`@supabase/ssr` + `@supabase/supabase-js`)
- **테마**: next-themes (class 기반 다크모드)
- **아이콘**: lucide-react (개별 임포트 필수)

### 계획된 추가 스택 (아직 미설치)
Zustand v5, TanStack Query v5, Recharts, Prisma, sonner, Prettier, Husky + lint-staged

## 코드 스타일

- TypeScript strict 모드, `any` 타입 금지
- default export 대신 **named export** 사용 (페이지 컴포넌트는 예외로 default export)
- Tailwind 유틸리티 클래스만 사용, 커스텀 CSS 파일 금지
- Server Components 우선, 필요한 경우만 `"use client"`
- 모든 숫자 데이터에 맥락(리그 순위, 백분위, 전년 비교) 함께 표시

## 아키텍처

### 현재 프로젝트 구조
Supabase Next.js 스타터킷 기반. 인증 플로우가 구현되어 있음.

```
app/
  layout.tsx              # 루트 레이아웃 (Geist 폰트, ThemeProvider)
  page.tsx                # 랜딩 페이지
  globals.css             # Tailwind + shadcn/ui CSS 변수
  auth/
    login/page.tsx        # 로그인
    sign-up/page.tsx      # 회원가입
    forgot-password/      # 비밀번호 찾기
    update-password/      # 비밀번호 변경
    confirm/route.ts      # 이메일 확인 콜백 (Route Handler)
    error/page.tsx        # 인증 에러
  protected/
    layout.tsx            # 인증된 사용자용 레이아웃 (nav + footer)
    page.tsx              # 보호된 페이지
components/
  ui/                     # shadcn/ui 컴포넌트 (button, card, input, label, badge 등)
  auth-button.tsx         # 인증 상태 표시/로그아웃 버튼
  login-form.tsx          # 로그인 폼 (Server Action 사용)
  sign-up-form.tsx        # 회원가입 폼
  theme-switcher.tsx      # 테마 전환
lib/
  utils.ts                # cn() 유틸리티, hasEnvVars 체크
  supabase/
    client.ts             # 브라우저용 Supabase 클라이언트 (createBrowserClient)
    server.ts             # 서버용 Supabase 클라이언트 (createServerClient + cookies)
    proxy.ts              # Middleware용 세션 갱신 (updateSession)
```

### 계획된 디렉토리 구조 (MVP 확장 시)
```
app/
  /(marketing)            # 공개 페이지 (랜딩, 소개)
  /(app)                  # 메인 앱 라우트
    /players              # 선수 프로필, 검색
    /compare              # 선수 비교 배틀카드
    /matchday             # 매치데이 대시보드
  /api                    # API 라우트
components/
  /charts                 # 차트 컴포넌트 (레이더, 라인, 바, 모멘텀)
  /cards                  # 선수 카드, 배틀카드, 매치 카드
  /matchday               # 매치데이 전용 컴포넌트
types/                    # 타입 정의 (Player, Match, PlayerStats 등)
hooks/                    # 커스텀 훅 (usePlayer, useMatch, useLiveData 등)
```

### Path Aliases
`@/*` → 프로젝트 루트의 모든 파일 (`tsconfig.json`의 paths 설정)

### Supabase 클라이언트 사용 패턴
- **브라우저**: `import { createClient } from "@/lib/supabase/client"` — Client Component에서 사용
- **서버**: `import { createClient } from "@/lib/supabase/server"` — Server Component/Route Handler에서 사용. 매 요청마다 새 인스턴스 생성 필수 (Fluid Compute 호환)
- **Middleware**: `lib/supabase/proxy.ts`의 `updateSession()` — 세션 쿠키 갱신, 미인증 사용자 `/auth/login`으로 리다이렉트

### 레이어드 아키텍처 (향후 API 구현 시)
- Controller (API Route) → Service → Repository 패턴
- `ApiResponse<T> = { data: T | null; error: string | null }` — 모든 API 응답에 사용
- DTO 패턴 사용

## UX 원칙

- **모든 숫자에 맥락을**: 단독 숫자 표시 금지, 비교 대상(리그 순위, 백분위, 전년 비교)과 함께 표시
- **3초 안에 핵심 파악**: 색상·아이콘·크기로 정보 우선순위 시각화, Progressive Disclosure
- **공유하고 싶은 디자인**: 배틀카드·프로필 요약의 SNS 공유 최적화 (OG 이미지, 다운로드)
- **초보 팬도 환영**: 전문 용어(xG, xA 등)에 설명 팝오버 제공

## 환경 변수

필수 변수 (`.env.local`에 설정):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable/anon 키
