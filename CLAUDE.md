# pitch-ac

PL(프리미어리그) 선수·경기 데이터를 맥락과 함께 시각적으로 보여주는 데이터 플랫폼.
핵심 기능: 선수 프로필(스탯+맥락), 선수 비교 배틀카드, 매치데이 대시보드.
현재 상태: Supabase 스타터킷 기반, 인증 플로우 구현됨. MVP 개발 초기 단계.

## 개발 명령어

```bash
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
```

## 기술 스택 특이사항

- Tailwind CSS **v3** 사용 (글로벌 설정의 v4와 다름 — v3 문법 사용할 것)
- Next.js `cacheComponents: true` 활성화 (`next.config.ts`)
- shadcn/ui 설정은 `components.json` 참조
- Supabase 인증: `@supabase/ssr` 기반, `lib/supabase/proxy.ts`로 세션 관리

## 프로젝트 규칙

- default export 대신 named export (page.tsx, layout.tsx 등 Next.js 규약 파일은 예외)
- 모든 숫자 데이터에 맥락 함께 표시 (리그 순위, 백분위, 전년 비교 중 최소 1개)
- 축구 전문 용어(xG, xA 등)에는 설명 팝오버 제공
- 커스텀 CSS 파일 금지, Tailwind 유틸리티 클래스만 사용
- `@/*` path alias 사용

## Supabase 인증

- 브라우저: `@/lib/supabase/client` (Client Component)
- 서버: `@/lib/supabase/server` (매 요청마다 새 인스턴스 생성 필수)
- 세션 갱신: `lib/supabase/proxy.ts`의 `updateSession()`

## 환경 변수

`.env.local` 필수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Summary Instructions

대화 압축 시 반드시 유지할 내용:
1. PL 데이터 플랫폼, 모든 숫자에 맥락 필수
2. Tailwind v3 사용 (v4 아님)
3. Supabase 서버 클라이언트는 매 요청마다 새 인스턴스
