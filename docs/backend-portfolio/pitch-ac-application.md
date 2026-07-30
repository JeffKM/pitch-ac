# pitch-ac에 4개 개념 적용 매핑

pitch-ac는 **Next.js + Supabase(Postgres) + TanStack Query** 스택이라 ORM·결제가 없다.
따라서 Spring/JPA 개념을 그대로가 아니라 **TS 스택으로 번역**해서 적용한다.
(예: "JPA fetch join" → "Supabase nested select", "Lombok @Builder" → "TS fluent builder")

각 항목의 ✅는 즉시 적용 가능, 🆕는 신규 기능으로 추가해야 함을 뜻한다.

---

## ① Builder 패턴 — 적용 후보

TS는 객체 리터럴 + optional이 흔해 Builder가 덜 idiomatic하지만,
**"옵션이 많고 점진적으로 조립되는 곳"** 에는 잘 맞는다.

1. ✅ **Supabase 동적 쿼리 빌더 (`PlayerQueryBuilder`)**
   - 위치: `app/api/scoutlab/players/search/route.ts` — 리그/팀/포지션/정렬 필터를 동적 조합
   - 현재: `.eq().in().order().limit()`를 분기문으로 붙임
   - 개선: `new PlayerQuery().league('PL').team(65).sortBy('goals').limit(20).build()`
   - 어필: "동적 쿼리 조립을 빌더로 추상화"
2. ✅ **Test Data Builder (테스트 픽스처)**
   - vitest 테스트 존재 → `aPlayer().withGoals(10).injured().build()`
   - GoF 빌더의 교과서적 활용, 테스트 가독성 향상
3. ✅ **맥락 스탯 조립 (`ContextualStatBuilder`)**
   - CLAUDE.md 규칙: "모든 숫자에 맥락(순위/백분위/전년비) 최소 1개"
   - `stat(23).rank(3).percentile(91).yoy(+5).build()` — 필수값 + 선택 맥락
   - 도메인 규칙을 타입으로 강제
4. ✅ **OG 배틀카드 조립** — `app/api/og/_lib/battle-card.tsx` (선수 A/B + 여러 옵션)
5. ✅ **football-data API 요청 빌더** — query param 많은 외부 호출 조립

> **문장화 포인트:** "빌더 썼다"가 아니라 _점층적 생성자 안티패턴 회피 + 불변 객체 + 동적 쿼리 조립_ 이라는 **이유**를 적어야 "설계 고민"이 드러난다.

---

## ② N+1 — 이미 절반 구현됨, 마저 + 측정

pitch-ac는 ORM이 없어 N+1이 "반복 await / 반복 쿼리" 형태로 나타난다.

1. ✅ **이미 있는 모범 사례** — `lib/repositories/player-repository.ts:75`
   `getPlayerSeasonStatsByIds` (배치 `.in()` + Map, 주석에 "N+1 방지"). 그대로 포폴 근거.
2. ✅ **Supabase nested select = fetch join**
   - fixture 조회 후 팀/스탠딩을 따로 조회한다면:
     `.select("*, home_team:teams!home(*), away_team:teams!away(*)")` 로 한 방에
   - JPA fetch join의 Supabase 버전 → N+1 제거 정석
3. ✅ **DataLoader 패턴** — 요청 단위 batching+캐싱
   - 현재 `react cache()`(`getPlayerById`)는 **같은 id 중복 제거**만 함
   - 한 발 더: 서로 다른 id를 틱마다 모아 1쿼리로
4. ✅ **`select("*")` → 필요 컬럼만** — "쿼리 낭비" 줄이기 (네트워크+DB I/O)
5. ✅ **"진부 탈출" = 측정**
   - `EXPLAIN ANALYZE`, 쿼리 수 before/after(예: 21→2), Sentry span(`@sentry/nextjs` 보유)
   - **측정→개선→재측정** 루프가 진부함을 벗긴다

---

## ③ I/O 최적화 — 적용처 많음

1. ✅ **순차 await → 병렬 (`Promise.all`)** — sync 라우트/`fixture-detail-service`에서 독립 조회 병렬화. 즉효.
2. ✅ **벌크 쓰기** — sync 스크립트 행별 insert → `upsert([...])` 배치 (커밋 S702 "배치 추출"이 이 방향)
3. ✅ **레이어드 캐싱** — Next `unstable_cache`/`revalidate`, React `cache()`, TanStack `staleTime`
   - football-data 분당 10회 제한 → 캐싱이 곧 생존
4. ✅ **레이트 리미터 = I/O 제어** — `lib/api/football-data/rate-limiter.ts` (슬라이딩 윈도우, 이미 존재). 백오프/큐 추가 여지.
5. ✅ **커넥션 풀링** — 서버리스에서 Supabase Supavisor(pgBouncer) 풀 모드 → "커넥션 고갈 방지"
6. ✅ **스트리밍** — RSC streaming + Suspense로 TTFB 단축, OG 이미지 스트리밍
7. ✅ **스크래퍼 동시성 제어** — `scripts/scraper`, `vision-rate-limiter` (Playwright/Gemini 동시성 + 배치)

> **측정 도구:** Sentry performance span, 부하 비교표.

---

## ④ 결제 파이프라인 — 신규 기능으로 추가 (수익화 겸)

pitch-ac에 **프리미엄 구독**(월 구독 → 무제한 비교/고급 스탯/배틀카드 PDF)을 붙이면 자연스럽다.
토스페이먼츠 연동:

- 🆕 **테이블**: `subscriptions`, `payments`, `payment_events` (+ RLS)
- 🆕 **파이프라인**: 결제위젯 → 승인 API(`/confirm`) → 웹훅 수신 → 구독 활성화
- 🆕 **멱등성**: `idempotencyKey`/`paymentKey` 유니크 제약 → 중복 승인·중복 웹훅 방어
- 🆕 **정합성**: 결제승인+구독활성화를 **Supabase Edge Function/RPC 트랜잭션**으로 원자화
  - `docs/.claude/rules/api-routes.md` 규칙 "여러 테이블 수정 시 트랜잭션 필수"와 정확히 일치
- 🆕 **정기결제(빌링키)**: 토스 빌링 — 매월 자동결제를 `app/api/cron/*` 패턴으로
- 🆕 **실패/취소/환불**: 상태머신(`pending→paid→canceled/refunded`), 웹훅 재시도 대비

> 이 기능 하나로 "결제 + 멱등성 + 트랜잭션 정합성 + 웹훅"을 실제로 확보.
> 단, Spring 직무용 결제 증명은 별도 나라카 메타 서버(`../naraka-valley/docs/meta-server/04-payment-shop.md`)에서.
