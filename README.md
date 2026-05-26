# pitch-ac

**THE ULTIMATE 5-LEAGUE DATA HUB**

> **Live Demo: [pitch-ac.vercel.app](https://pitch-ac.vercel.app/)**

유럽 5대 리그(EPL, La Liga, Serie A, Bundesliga, Ligue 1)의 경기·순위·선수 데이터를 맥락과 함께 시각화하는 축구 데이터 플랫폼. 60+ 고급 메트릭 기반 **ScoutLab 스카우팅 분석**을 핵심으로, 중계 영상에서 선수 움직임과 전술 패턴을 추출하는 **CV 전술 시각화**까지 확장할 계획입니다.

## 주요 기능

### Matchday (매치데이 대시보드)

- 5대 리그 + UCL 날짜별 전 경기 목록
- 경기 상태 배지 (NS/FT/POSTP)
- 경기 상세: 프리매치(팀 폼, H2H, 부상자) / 포스트매치(골 이벤트, 순위 시뮬레이션)
- 킥오프+2.5h 오프셋 기반 자동 동기화

### Ranking (순위표)

- 5대 리그 + UCL Champions League 팀 순위표
- 순위/팀/경기수/승무패/득실/승점/최근 폼
- UCL/UEL/강등권 색상 하이라이트

### ScoutLab (스카우팅 분석)

- 60+ 고급 메트릭 기반 스카우팅 분석 (Big 5 리그)
- 10개 분석 탭: Player Card, Summary, Radar, Progression, Action Maps, Scatter, Similarity, Ranking, Compare, Glossary
- 한국어 맥락 부연 + 팝오버 상세 해설
- 코믹 디자인 차트 (레이더, 산점도, 라인 차트)

### 홈페이지

- ScoutLab 쇼케이스 중심 랜딩
- 이번 라운드/오늘 경기 + 5대 리그 순위 한눈에
- 종이 질감 배경 (SVG feTurbulence)

## 기술 스택

| 카테고리        | 기술                                                               |
| --------------- | ------------------------------------------------------------------ |
| 프레임워크      | Next.js 16+ (App Router), React 19, TypeScript 5.6+ strict         |
| 스타일링        | Tailwind CSS v4 (CSS-first, `@theme inline`), shadcn/ui (new-york) |
| 폰트            | Geist Sans, Fredoka, Bangers, Permanent Marker                     |
| 상태관리        | TanStack Query v5, Zustand v5                                      |
| 차트            | Recharts                                                           |
| 백엔드/DB       | Supabase (PostgreSQL, 인증, RLS), `@supabase/ssr`                  |
| 데이터 소스     | football-data.org (무료 플랜, 10 요청/분)                          |
| 스카우팅 데이터 | ScoutLab (Playwright 스크래퍼, Supabase DB 캐시)                   |
| 모니터링        | Sentry (`@sentry/nextjs`)                                          |
| 배포            | Vercel (Cron, Edge Functions)                                      |
| 코드 품질       | ESLint, Prettier, Husky, lint-staged                               |

## 시작하기

### 환경 변수

`.env.local` 파일을 생성하고 다음 변수를 설정합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase API 퍼블리셔블 키>
FOOTBALL_DATA_API_KEY=<football-data.org API 키>
```

### 개발 서버 실행

```bash
npm install
npm run dev
```

[localhost:3000](http://localhost:3000/)에서 확인할 수 있습니다.

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

## 프로젝트 구조

```
app/
├── (marketing)/        # 홈페이지 (랜딩)
├── (app)/              # 앱 내부 페이지
│   ├── matchday/       # 매치데이 대시보드 + 경기 상세
│   ├── ranking/        # 5대 리그 + UCL 순위표
│   ├── scouting/       # ScoutLab 10개 탭
│   └── news/           # Coming Soon
├── (auth)/             # 로그인/회원가입
└── api/                # API 라우트 + Cron 동기화

lib/
├── api/football-data/  # football-data.org 클라이언트
├── services/           # 비즈니스 로직 (동기화, 스케줄 등)
├── supabase/           # Supabase 클라이언트 (client/server/proxy)
└── constants/          # 리그 설정, 상수

components/
├── nav/                # 헤더, 사이드바, 모바일 탭 바
├── comic/              # 코믹 디자인 시스템 컴포넌트
└── ui/                 # shadcn/ui 컴포넌트

scripts/
└── scraper/            # ScoutLab Playwright 스크래퍼

docs/
├── PRD.md              # 제품 요구사항 문서
└── ROADMAP.md          # 개발 로드맵
```

## 데이터 동기화

| 데이터 유형 | 주기                                 | 방법                |
| ----------- | ------------------------------------ | ------------------- |
| 팀/순위     | 주 1회 (월요일 04:00 UTC)            | Vercel Cron         |
| 경기 일정   | 매일 06:00 UTC                       | Vercel Cron         |
| 경기 결과   | 킥오프+2.5h (13:00~23:00 UTC 매시간) | Vercel Cron         |
| ScoutLab    | 수동                                 | Playwright 스크래퍼 |

## 개발 진행 상태

### 완료

- 5대 리그 데이터 인프라 (football-data.org, Supabase DB)
- 매치데이 대시보드 + 경기 상세 (프리매치/포스트매치)
- Ranking 5대 리그 + UCL 순위표
- ScoutLab 10개 분석 탭 (PL 데이터)
- 코믹 디자인 시스템 전체 적용
- ScoutLab 한국어 맥락 부연 + 팝오버 해설
- ScoutLab 코믹 차트 디자인
- 매치데이 자동 동기화 (킥오프+2.5h Cron)
- 홈페이지 리뉴얼 (5대 리그 허브)
- 접이식 사이드바 네비게이션
- 인증 (이메일 + Google OAuth)

### 예정

- ScoutLab 5대 리그 데이터 확장 (La Liga, Serie A, Bundesliga, Ligue 1)
- Action Maps 스크래퍼 구현
- 멀티시즌 데이터 + Share as Image
- Ranking 선수 순위
- MATCHDAY 매치픽 (유저 경기 예측)
- NEWS 이적뉴스/팀소식
- CV 전술 시각화 (장기 목표)

## 문서

- [PRD](docs/PRD.md) — 제품 요구사항 문서
- [ROADMAP](docs/ROADMAP.md) — 상세 개발 로드맵
