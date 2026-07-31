# 26/27 시즌 롤오버 자동화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 시즌이 바뀔 때 코드 수정 없이 자동으로 새 시즌 데이터를 동기화·표시하도록, 하드코딩된 시즌 상수를 API 응답/DB에서 파생되는 값으로 전면 교체한다.

**Architecture:** 동기화 계층은 football-data.org 응답에 포함된 `season` 정보(`FdSeason.startDate`)에서 대회별로 시즌 라벨(`"2026/2027"`)을 파생한다. 이렇게 하면 5대 리그는 26/27, UCL은 아직 25/26인 **대회별 롤오버 시차**가 자동으로 처리된다. 조회 계층은 `fixtures.season` 컬럼을 신설하고, 화면이 쓰는 "현재 시즌" 개념을 전역 상수가 아니라 DB의 최신 데이터에서 파생한다. 최종적으로 `CURRENT_SEASON` / `CURRENT_SEASON_LABEL` 상수는 삭제한다.

**Tech Stack:** TypeScript 5 (strict), Next.js 16 App Router, React 19, Supabase(PostgreSQL), vitest 4, football-data.org v4 API

## Global Constraints

- 언어: 주석·문서·커밋 메시지는 **한국어**, 변수/함수명은 영어(camelCase, 컴포넌트는 PascalCase)
- export: **named export** 강제 (`page.tsx`, `layout.tsx`, `route.ts` 등 Next.js 규약 파일과 `vitest.config.ts`는 예외)
- TypeScript strict 모드, 에러 핸들링 필수 (throw 또는 명시적 error 반환)
- 임포트: `@/*` path alias 사용, 개별 임포트(트리쉐이킹)
- 들여쓰기 2칸, Prettier + ESLint(`simple-import-sort`) 자동 적용 — 커밋 시 husky pre-commit 훅이 `lint-staged` + `tsc --noEmit` 실행
- Supabase 서버 클라이언트(`@/lib/supabase/server`의 `createClient()`)는 **매 요청마다 새 인스턴스** 생성
- 동기화 계층은 `@/lib/supabase/admin`의 `createAdminClient()` 사용
- 모든 서버 전용 모듈 최상단에 `import "server-only";` (단, 순수 함수 모듈인 `lib/api/football-data/mappers.ts`, `lib/api/football-data/season.ts`, `lib/constants/*`는 제외)
- 테스트 러너: **vitest** — 전체 `npm run test`, 단일 파일 `npx vitest run <경로>`
- 통합 검증: `npm run validate` (= `type-check` + `lint` + `format:check`)
- 커밋 메시지: 이모지 + 컨벤셔널 커밋 + 한국어 본문, 말미에 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- DB 마이그레이션 파일은 `supabase/migrations/`에 순번대로 추가하고, 적용은 Supabase MCP `mcp__supabase__apply_migration` 사용

## 스코프 제외 (이 계획에서 다루지 않음)

- `scripts/scraper/` ScoutLab 데이터 수집 시즌 전환 → Phase SR04
- teams 테이블 강등팀 잔존 정리 → Phase SR02
- rate-limiter in-memory 상태 이슈 → 별도 백로그(P2)
- Vercel 환경변수 → 이미 해결됨
- `app/(marketing)/_components/round-matches-panel.tsx`의 오프시즌 fallback → 데이터 기반 분기라 수정 불필요

## File Structure

**신규 생성**

| 파일                                                | 책임                                                    |
| --------------------------------------------------- | ------------------------------------------------------- |
| `lib/api/football-data/season.ts`                   | `FdSeason`/`FdMatch[]` → 시즌 라벨 파생 (순수 함수)     |
| `lib/api/football-data/__tests__/season.test.ts`    | 위 유틸 단위 테스트                                     |
| `lib/constants/scoutlab.ts`                         | ScoutLab 활성 시즌 단일 상수 (`SCOUTLAB_ACTIVE_SEASON`) |
| `lib/services/sync/__tests__/sync-fixtures.test.ts` | 경기 동기화가 파생 시즌을 기록하는지 검증               |
| `lib/services/sync/__tests__/sync-teams.test.ts`    | 팀/순위 동기화가 파생 시즌을 기록하는지 검증            |
| `supabase/migrations/0015_fixtures_season.sql`      | `fixtures.season` 컬럼 추가 + 백필 + 인덱스             |

**수정**

| 파일                                                                                                                                            | 변경 내용                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `lib/api/football-data/{fixtures,teams,standings,scorers}.ts`                                                                                   | `season` 파라미터 제거, `getCompetitionMatches`는 응답 전체 반환         |
| `lib/api/football-data/{index,mappers}.ts`                                                                                                      | season 모듈 re-export, `Fixture.season` 매핑                             |
| `types/fixture.ts`                                                                                                                              | `Fixture.season: string` 추가                                            |
| `lib/repositories/mappers.ts`                                                                                                                   | `FixtureRow.season` 추가 및 매핑                                         |
| `lib/repositories/fixture-repository.ts`                                                                                                        | `getCurrentGameweek` 반환 타입 확장, `getFixturesByGameweek` season 필터 |
| `lib/repositories/standing-repository.ts`                                                                                                       | 최신 시즌 파생 조회로 전환                                               |
| `lib/repositories/player-repository.ts`                                                                                                         | `getLatestPlayerSeasonStats` 추가                                        |
| `lib/repositories/index.ts`                                                                                                                     | 신규 함수/타입 re-export                                                 |
| `lib/services/sync/{sync-fixtures,sync-teams,sync-players,calculate-context,db-mappers}.ts`                                                     | 시즌 파생으로 전환                                                       |
| `lib/constants/football.ts`                                                                                                                     | `CURRENT_SEASON`, `CURRENT_SEASON_LABEL` 삭제                            |
| `app/(marketing)/_components/home-content.tsx`                                                                                                  | 파생 시즌 사용                                                           |
| `app/(app)/{ranking,matchday}/page.tsx`, `app/api/matchday/fixtures/route.ts`, `lib/services/fixture-detail-service.ts`, `app/api/og/route.tsx` | 시즌 상수 제거                                                           |
| `app/(app)/scouting/_lib/scoutlab-constants.ts`, `app/api/scoutlab/{ranking,players/search}/route.ts`                                           | `SCOUTLAB_ACTIVE_SEASON` 단일 참조                                       |
| `app/api/debug/football-data/fixtures/route.ts`                                                                                                 | 변경된 반환 타입 대응                                                    |
| 기존 테스트 3종                                                                                                                                 | 픽스처에 `season` 추가                                                   |

---

### Task 1: 시즌 라벨 파생 유틸

**Files:**

- Create: `lib/api/football-data/season.ts`
- Create: `lib/api/football-data/__tests__/season.test.ts`
- Modify: `lib/api/football-data/index.ts:1-20`

**Interfaces:**

- Consumes: `FdSeason`, `FdMatch` (`lib/api/football-data/types.ts:15-21`, `:111-126`)
- Produces:
  - `deriveSeasonLabel(season: FdSeason): string` — `startDate`의 연도로 `"2026/2027"` 생성, 형식 오류 시 throw
  - `deriveSeasonLabelFromMatches(matches: FdMatch[]): string | null` — 경기 목록에서 라벨 파생, 비어 있으면 `null`

- [ ] **Step 1: 실패하는 테스트 작성**

`lib/api/football-data/__tests__/season.test.ts`:

```ts
// 시즌 라벨 파생 유틸 단위 테스트

import { describe, expect, it } from "vitest";

import { deriveSeasonLabel, deriveSeasonLabelFromMatches } from "../season";
import type { FdMatch, FdSeason } from "../types";

function makeSeason(startDate: string): FdSeason {
  return {
    id: 2403,
    startDate,
    endDate: "2027-05-30",
    currentMatchday: 1,
    winner: null,
  };
}

function makeMatch(startDate: string): FdMatch {
  return {
    id: 500001,
    utcDate: "2026-08-21T19:00:00Z",
    status: "SCHEDULED",
    matchday: 1,
    stage: "REGULAR_SEASON",
    group: null,
    lastUpdated: "2026-07-30T00:00:00Z",
    homeTeam: {
      id: 65,
      name: "Manchester City FC",
      shortName: "Man City",
      tla: "MCI",
      crest: "https://crests.football-data.org/65.svg",
    },
    awayTeam: {
      id: 57,
      name: "Arsenal FC",
      shortName: "Arsenal",
      tla: "ARS",
      crest: "https://crests.football-data.org/57.svg",
    },
    score: {
      winner: null,
      duration: "REGULAR",
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null },
    },
    referees: [],
    competition: {
      id: 2021,
      name: "Premier League",
      code: "PL",
      type: "LEAGUE",
      emblem: "",
    },
    season: makeSeason(startDate),
    area: { id: 2072, name: "England", code: "ENG", flag: null },
  };
}

describe("deriveSeasonLabel", () => {
  it("2026-08-21 개막 → 2026/2027", () => {
    expect(deriveSeasonLabel(makeSeason("2026-08-21"))).toBe("2026/2027");
  });

  it("UCL처럼 아직 전환 전인 대회 → 2025/2026", () => {
    expect(deriveSeasonLabel(makeSeason("2025-07-08"))).toBe("2025/2026");
  });

  it("startDate 형식이 잘못되면 예외", () => {
    expect(() => deriveSeasonLabel(makeSeason("2026/08/21"))).toThrow(
      /startDate/,
    );
  });
});

describe("deriveSeasonLabelFromMatches", () => {
  it("첫 경기의 season에서 라벨 파생", () => {
    expect(deriveSeasonLabelFromMatches([makeMatch("2026-08-21")])).toBe(
      "2026/2027",
    );
  });

  it("빈 배열이면 null", () => {
    expect(deriveSeasonLabelFromMatches([])).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run lib/api/football-data/__tests__/season.test.ts`
Expected: FAIL — `Failed to resolve import "../season"`

- [ ] **Step 3: 최소 구현 작성**

`lib/api/football-data/season.ts`:

```ts
// football-data.org 시즌 정보 → 앱 시즌 라벨 파생
// 대회마다 롤오버 시점이 달라(예: UCL은 5대 리그보다 늦게 전환) 전역 상수로 표현할 수 없으므로
// 각 API 응답에 포함된 season 정보에서 라벨을 파생한다.

import type { FdMatch, FdSeason } from "./types";

/** "YYYY-MM-DD..." 형식에서 시작 연도 추출 */
const START_DATE_PATTERN = /^(\d{4})-\d{2}-\d{2}/;

/** FdSeason → 시즌 라벨 (startDate "2026-08-21" → "2026/2027") */
export function deriveSeasonLabel(season: FdSeason): string {
  const matched = START_DATE_PATTERN.exec(season?.startDate ?? "");
  if (!matched) {
    throw new Error(
      `시즌 startDate 형식이 올바르지 않습니다: ${season?.startDate}`,
    );
  }

  const startYear = Number(matched[1]);
  return `${startYear}/${startYear + 1}`;
}

/**
 * 경기 목록에서 시즌 라벨 파생
 * /competitions/{code}/matches 응답에는 최상위 season 필드가 없고 각 경기에만 있다.
 */
export function deriveSeasonLabelFromMatches(
  matches: FdMatch[],
): string | null {
  const withSeason = matches.find((match) => match.season?.startDate);
  return withSeason ? deriveSeasonLabel(withSeason.season) : null;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run lib/api/football-data/__tests__/season.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: 모듈 진입점에 re-export 추가**

`lib/api/football-data/index.ts` — `export * from "./scorers";` 바로 앞에 한 줄 추가 (simple-import-sort 정렬 순서 유지):

```ts
export * from "./client";
export * from "./fixtures";
export * from "./mappers";
export { getUsage } from "./rate-limiter";
export * from "./scorers";
export * from "./season";
export * from "./standings";
export * from "./teams";
```

- [ ] **Step 6: 타입 체크 + 커밋**

Run: `npm run type-check`
Expected: 에러 없음

```bash
git add lib/api/football-data/season.ts lib/api/football-data/__tests__/season.test.ts lib/api/football-data/index.ts
git commit -m "✨ feat: API 응답에서 시즌 라벨을 파생하는 유틸 추가" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: football-data API 계층에서 season 파라미터 제거

무료 플랜에서 `?season=2025`(과거 시즌)도 200을 반환하기 때문에, 하드코딩된 시즌을 계속 넘기면 26/27 개막 후에도 조용히 25/26 데이터만 동기화된다. 파라미터를 아예 없애 API가 판단한 `currentSeason`을 받도록 한다.

**Files:**

- Modify: `lib/api/football-data/fixtures.ts:7-24`
- Modify: `lib/api/football-data/teams.ts:7-20`
- Modify: `lib/api/football-data/standings.ts:7-23`
- Modify: `lib/api/football-data/scorers.ts:7-20`
- Modify: `app/api/debug/football-data/fixtures/route.ts:12-24`
- Modify: `lib/services/sync/sync-fixtures.ts:41`
- Modify: `lib/services/sync/sync-teams.ts:23,72-75`
- Modify: `lib/services/sync/sync-players.ts:34,37`

**Interfaces:**

- Consumes: `footballDataFetch<T>` (`lib/api/football-data/client.ts:44`)
- Produces:
  - `getCompetitionMatches(code: string): Promise<FdMatchesResponse>` — **반환 타입 변경** (기존 `FdMatch[]`)
  - `getCompetitionTeams(code: string): Promise<FdTeamsResponse>`
  - `getCompetitionStandings(code: string): Promise<FdStandingsResponse>`
  - `getCompetitionScorers(code: string): Promise<FdScorersResponse>`

- [ ] **Step 1: `getCompetitionMatches` 시그니처 변경**

`lib/api/football-data/fixtures.ts`의 상단 import와 첫 함수를 아래로 교체 (`getMatchById` 이하 나머지 함수는 그대로):

```ts
// football-data.org 경기(Match) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdMatch, FdMatchesResponse } from "./types";

/**
 * 리그 현재 시즌 전체 경기 조회
 * season 파라미터를 넘기지 않아 API가 판단한 currentSeason을 그대로 사용한다.
 * 시즌 라벨은 응답의 matches[i].season에서 파생한다.
 */
export async function getCompetitionMatches(
  code: string,
): Promise<FdMatchesResponse> {
  return footballDataFetch<FdMatchesResponse>(`/competitions/${code}/matches`, {
    revalidate: 3600,
    tags: [`season-matches-${code}`],
  });
}
```

- [ ] **Step 2: teams/standings/scorers에서 season 파라미터 제거**

`lib/api/football-data/teams.ts`:

```ts
// football-data.org 팀(Team) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdTeamsResponse } from "./types";

/** 리그 현재 시즌 소속 팀 목록 조회 (응답의 season 필드로 시즌 판별) */
export async function getCompetitionTeams(
  code: string,
): Promise<FdTeamsResponse> {
  return footballDataFetch<FdTeamsResponse>(`/competitions/${code}/teams`, {
    revalidate: 86400,
    tags: [`teams-${code}`],
  });
}
```

`lib/api/football-data/standings.ts`:

```ts
// football-data.org 순위(Standings) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdStandingsResponse } from "./types";

/** 리그 현재 시즌 순위표 조회 (응답의 season 필드로 시즌 판별) */
export async function getCompetitionStandings(
  code: string,
): Promise<FdStandingsResponse> {
  return footballDataFetch<FdStandingsResponse>(
    `/competitions/${code}/standings`,
    {
      revalidate: 3600,
      tags: [`standings-${code}`],
    },
  );
}
```

`lib/api/football-data/scorers.ts`:

```ts
// football-data.org 득점 순위(Scorers) 관련 서비스 함수
import "server-only";

import { footballDataFetch } from "./client";
import type { FdScorersResponse } from "./types";

/** 리그 현재 시즌 득점 순위 조회 (응답의 season 필드로 시즌 판별) */
export async function getCompetitionScorers(
  code: string,
): Promise<FdScorersResponse> {
  return footballDataFetch<FdScorersResponse>(`/competitions/${code}/scorers`, {
    revalidate: 3600,
    tags: [`scorers-${code}`],
  });
}
```

- [ ] **Step 3: 호출처 컴파일 오류 해소 (인자 제거 + 반환값 구조분해)**

`app/api/debug/football-data/fixtures/route.ts:12`:

```ts
    const { matches } = await getCompetitionMatches("PL");
    const statusCounts = matches.reduce(
```

`lib/services/sync/sync-fixtures.ts:41` — 이 태스크에서는 인자만 제거한다(시즌 파생은 Task 4):

```ts
const { matches: allMatches } = await getCompetitionMatches(leagueCode);
```

그리고 같은 파일 8-12행의 import에서 `CURRENT_SEASON`을 제거:

```ts
import { ALL_COMPETITIONS, PL_LEAGUE_ID } from "@/lib/constants/football";
```

`lib/services/sync/sync-teams.ts:23`:

```ts
const res = await getCompetitionTeams(leagueCode);
```

`lib/services/sync/sync-teams.ts:72-75`:

```ts
const standingsRes = await getCompetitionStandings(leagueCode);
```

같은 파일 9행 import를 아래로 교체:

```ts
import { ALL_COMPETITIONS } from "@/lib/constants/football";
```

`lib/services/sync/sync-players.ts:34,37`:

```ts
// 1. 팀 + squad 데이터 조회
const teamsRes = await getCompetitionTeams(LEAGUE_CODE);

// 2. 득점자 정보 조회 (등번호 + 출전경기수 보강용)
const scorersRes = await getCompetitionScorers(LEAGUE_CODE);
```

같은 파일 10-14행 import를 아래로 교체:

```ts
import {
  CURRENT_SEASON_LABEL,
  toScoutlabSeason,
} from "@/lib/constants/football";
```

- [ ] **Step 4: 타입 체크 + 기존 테스트 확인**

Run: `npm run type-check && npm run test`
Expected: 타입 에러 없음, 기존 테스트 전부 PASS (sync-players 테스트는 `getCompetitionTeams` 모킹이 인자 수에 의존하지 않아 그대로 통과)

- [ ] **Step 5: 커밋**

```bash
git add lib/api/football-data app/api/debug/football-data/fixtures/route.ts lib/services/sync
git commit -m "♻️ refactor: football-data API 호출에서 하드코딩 season 파라미터 제거" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: fixtures 테이블에 season 컬럼 추가

현재 `fixtures`는 시즌 구분이 없어 26/27 경기가 적재되면 `getFixturesByGameweek()`가 두 시즌의 GW1을 섞어 반환한다. 컬럼을 추가하고 기존 1,941행을 `'2025/2026'`으로 백필한다.

**Files:**

- Create: `supabase/migrations/0015_fixtures_season.sql`

**Interfaces:**

- Produces: `fixtures.season TEXT NOT NULL` 컬럼과 `idx_fixtures_season_league_gw` 인덱스 — Task 4(쓰기), Task 8(읽기)이 의존

- [ ] **Step 1: 적용 전 현황 확인**

Supabase MCP `mcp__supabase__execute_sql` 실행:

```sql
SELECT count(*) AS total FROM fixtures;
```

Expected: `total = 1941` (다르면 그 값을 Step 4의 기대치로 사용)

- [ ] **Step 2: 마이그레이션 파일 작성**

`supabase/migrations/0015_fixtures_season.sql`:

```sql
-- Phase SR: 26/27 시즌 롤오버 — fixtures 시즌 구분 컬럼 추가
-- 시즌 구분이 없으면 26/27 적재 시 gameweek+league_id 조회가 두 시즌을 섞어 반환한다.

-- 1) 컬럼 추가 (기존 행은 NULL)
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS season TEXT;

-- 2) 기존 데이터 백필 — 현재 적재된 경기는 전부 25/26 시즌
UPDATE fixtures SET season = '2025/2026' WHERE season IS NULL;

-- 3) 이후 동기화는 항상 시즌을 기록하므로 NOT NULL 제약 적용
ALTER TABLE fixtures ALTER COLUMN season SET NOT NULL;

-- 4) 시즌+리그+라운드 조회용 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_fixtures_season_league_gw
  ON fixtures(season, league_id, gameweek);

COMMENT ON COLUMN fixtures.season IS 'API season.startDate에서 파생한 시즌 라벨 (예: 2026/2027)';
```

- [ ] **Step 3: 마이그레이션 적용**

Supabase MCP `mcp__supabase__apply_migration` 호출:

- `name`: `fixtures_season`
- `query`: 위 SQL 전문

Expected: 에러 없이 완료

- [ ] **Step 4: 적용 결과 검증**

Supabase MCP `mcp__supabase__execute_sql` 실행:

```sql
SELECT season, count(*) AS cnt FROM fixtures GROUP BY season ORDER BY season;
```

Expected: `2025/2026 | 1941` 한 행만 반환 (NULL 행 없음)

- [ ] **Step 5: 커밋**

```bash
git add supabase/migrations/0015_fixtures_season.sql
git commit -m "🗃️ feat: fixtures 테이블에 season 컬럼 추가 및 25/26 백필" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 경기 데이터에 시즌 흐르게 하기 (타입 → 매퍼 → 동기화)

**Files:**

- Modify: `types/fixture.ts:52-71`
- Modify: `lib/api/football-data/mappers.ts:20-26,82-107`
- Modify: `lib/repositories/mappers.ts:18-31,59-74`
- Modify: `lib/services/sync/db-mappers.ts:76-91`
- Modify: `lib/services/sync/sync-fixtures.ts:1-119`
- Create: `lib/services/sync/__tests__/sync-fixtures.test.ts`
- Test: `lib/api/football-data/__tests__/mappers.test.ts` (mapFdMatchToFixture 케이스 추가)
- Test: `lib/repositories/__tests__/mappers.test.ts:27-50` (baseRow에 season 추가)
- Test: `app/(app)/matchday/__tests__/_utils.test.ts:13-28` (팩토리에 season 추가)

**Interfaces:**

- Consumes: `deriveSeasonLabel`, `deriveSeasonLabelFromMatches` (Task 1), `getCompetitionMatches(code): Promise<FdMatchesResponse>` (Task 2), `fixtures.season` 컬럼 (Task 3)
- Produces:
  - `Fixture.season: string` — 앱 전역 경기 타입에 시즌 추가
  - `FixtureRow.season: string` — DB 행 타입에 시즌 추가
  - `fixtureToDbRow(fixture: Fixture)` — 반환 객체에 `season: fixture.season` 포함 (시그니처 불변)

- [ ] **Step 1: `mapFdMatchToFixture` 실패 테스트 추가**

`lib/api/football-data/__tests__/mappers.test.ts` — import 구문을 아래로 교체하고,

```ts
import {
  calculateAge,
  mapFdMatchToFixture,
  mapFdSquadPlayerToPlayer,
  mapFdSquadPlayerToScoutlabRow,
} from "../mappers";
import type { FdMatch, FdSquadPlayer } from "../types";
```

파일 맨 끝에 아래 블록을 추가:

```ts
// ─── mapFdMatchToFixture ────────────────────────

describe("mapFdMatchToFixture", () => {
  function makeMatch(startDate: string): FdMatch {
    return {
      id: 500001,
      utcDate: "2026-08-21T19:00:00Z",
      status: "SCHEDULED",
      matchday: 1,
      stage: "REGULAR_SEASON",
      group: null,
      lastUpdated: "2026-07-30T00:00:00Z",
      homeTeam: {
        id: 65,
        name: "Manchester City FC",
        shortName: "Man City",
        tla: "MCI",
        crest: "https://crests.football-data.org/65.svg",
      },
      awayTeam: {
        id: 57,
        name: "Arsenal FC",
        shortName: "Arsenal",
        tla: "ARS",
        crest: "https://crests.football-data.org/57.svg",
      },
      score: {
        winner: null,
        duration: "REGULAR",
        fullTime: { home: null, away: null },
        halfTime: { home: null, away: null },
      },
      referees: [],
      competition: {
        id: 2021,
        name: "Premier League",
        code: "PL",
        type: "LEAGUE",
        emblem: "",
      },
      season: {
        id: 2403,
        startDate,
        endDate: "2027-05-30",
        currentMatchday: 1,
        winner: null,
      },
      area: { id: 2072, name: "England", code: "ENG", flag: null },
    };
  }

  it("경기 season.startDate에서 시즌 라벨 파생", () => {
    const fixture = mapFdMatchToFixture(makeMatch("2026-08-21"));
    expect(fixture.season).toBe("2026/2027");
  });

  it("아직 전환 전인 대회는 이전 시즌 라벨 유지", () => {
    const fixture = mapFdMatchToFixture(makeMatch("2025-07-08"));
    expect(fixture.season).toBe("2025/2026");
  });

  it("기본 필드 매핑 유지", () => {
    const fixture = mapFdMatchToFixture(makeMatch("2026-08-21"));
    expect(fixture.id).toBe(500001);
    expect(fixture.gameweek).toBe(1);
    expect(fixture.status).toBe("NS");
    expect(fixture.leagueId).toBe(2021);
    expect(fixture.competitionName).toBe("Premier League");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run lib/api/football-data/__tests__/mappers.test.ts`
Expected: FAIL — `Property 'season' does not exist on type 'Fixture'` (또는 `expected undefined to be "2026/2027"`)

- [ ] **Step 3: `Fixture` 타입에 season 추가**

`types/fixture.ts`의 `Fixture` 인터페이스 — `competitionName` 아래에 필드 추가:

```ts
/** 경기 정보 */
export interface Fixture {
  id: number;
  /** 게임위크 (matchday) */
  gameweek: number | null;
  date: string;
  homeTeamId: number;
  awayTeamId: number;
  status: FixtureStatus;
  /** NS(예정)일 때 null */
  homeScore: number | null;
  /** NS(예정)일 때 null */
  awayScore: number | null;
  /** 이벤트 목록 (NS일 때 빈 배열) */
  events: FixtureEvent[];
  /** football-data.org competition id (PL=2021) */
  leagueId: number;
  /** 대회 표시명 */
  competitionName: string | null;
  /** 시즌 라벨 (예: "2026/2027") — 대회별로 롤오버 시점이 다르다 */
  season: string;
}
```

- [ ] **Step 4: `mapFdMatchToFixture`가 시즌을 채우도록 구현**

`lib/api/football-data/mappers.ts` — 20-26행 import 블록 아래에 season import 추가:

```ts
import { deriveSeasonLabel } from "./season";
import type {
  FdMatch,
  FdMatchTeam,
  FdSquadPlayer,
  FdStandingEntry,
  FdTeam,
} from "./types";
```

그리고 `mapFdMatchToFixture`의 return 문을 아래로 교체:

```ts
return {
  id: raw.id,
  gameweek: raw.matchday ?? null,
  date: raw.utcDate,
  homeTeamId: raw.homeTeam.id,
  awayTeamId: raw.awayTeam.id,
  status,
  homeScore,
  awayScore,
  events,
  leagueId,
  competitionName,
  season: deriveSeasonLabel(raw.season),
};
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx vitest run lib/api/football-data/__tests__/mappers.test.ts`
Expected: PASS

- [ ] **Step 6: DB 행 매퍼 양방향 반영**

`lib/repositories/mappers.ts` — `FixtureRow`에 필드 추가:

```ts
/** fixtures 테이블 행 타입 (Supabase 반환값) */
export interface FixtureRow {
  id: number;
  gameweek: number | null;
  date: string;
  home_team_id: number | null;
  away_team_id: number | null;
  status: "NS" | "LIVE" | "FT" | "POSTP";
  home_score: number | null;
  away_score: number | null;
  events: FixtureEvent[] | null;
  league_id: number;
  competition_name: string | null;
  season: string;
}
```

같은 파일 `fixtureRowToFixture`의 return에 한 줄 추가:

```ts
    leagueId: row.league_id,
    competitionName: row.competition_name ?? null,
    season: row.season,
  };
```

`lib/services/sync/db-mappers.ts`의 `fixtureToDbRow`:

```ts
/** Fixture → fixtures 테이블 행 */
export function fixtureToDbRow(fixture: Fixture) {
  return {
    id: fixture.id,
    gameweek: fixture.gameweek,
    date: fixture.date,
    home_team_id: fixture.homeTeamId || null,
    away_team_id: fixture.awayTeamId || null,
    status: fixture.status,
    home_score: fixture.homeScore,
    away_score: fixture.awayScore,
    events: fixture.events,
    league_id: fixture.leagueId,
    competition_name: fixture.competitionName,
    season: fixture.season,
  };
}
```

- [ ] **Step 7: 기존 테스트 픽스처 갱신**

`lib/repositories/__tests__/mappers.test.ts`의 `baseRow`에 마지막 필드 추가:

```ts
    league_id: 2021,
    competition_name: null,
    season: "2025/2026",
  };
```

`app/(app)/matchday/__tests__/_utils.test.ts`의 `makeFixture` 팩토리에 필드 추가:

```ts
    leagueId: 2021,
    competitionName: null,
    season: "2025/2026",
    ...overrides,
  };
```

- [ ] **Step 8: 전체 테스트 + 타입 체크**

Run: `npm run test && npm run type-check`
Expected: 전부 PASS, 타입 에러 없음

- [ ] **Step 9: sync-fixtures 실패 테스트 작성**

`lib/services/sync/__tests__/sync-fixtures.test.ts`:

```ts
// syncLeagueFixtures 통합 테스트 — 시즌 파생 + DB upsert 모킹

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FdMatch, FdMatchesResponse } from "@/lib/api/football-data/types";

// ─── 모킹 설정 ─────────────────────────────────

vi.mock("server-only", () => ({}));

const upsertCalls: Record<
  string,
  Array<[unknown[], Record<string, string>]>
> = {};
const mockInsert = vi.fn().mockReturnValue({ error: null });

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "sync_logs") {
        return { insert: mockInsert };
      }

      return {
        upsert: (rows: unknown[], opts: Record<string, string>) => {
          if (!upsertCalls[table]) upsertCalls[table] = [];
          upsertCalls[table].push([rows, opts]);
          return { error: null };
        },
        // POSTP 경기 ID 조회 (select → eq → eq)
        select: () => ({
          eq: function () {
            return this;
          },
          then: (resolve: (v: unknown) => void) =>
            resolve({ data: [], error: null }),
        }),
      };
    },
  }),
}));

function makeMatch(startDate: string): FdMatch {
  return {
    id: 500001,
    utcDate: "2026-08-21T19:00:00Z",
    status: "SCHEDULED",
    matchday: 1,
    stage: "REGULAR_SEASON",
    group: null,
    lastUpdated: "2026-07-30T00:00:00Z",
    homeTeam: {
      id: 65,
      name: "Manchester City FC",
      shortName: "Man City",
      tla: "MCI",
      crest: "https://crests.football-data.org/65.svg",
    },
    awayTeam: {
      id: 57,
      name: "Arsenal FC",
      shortName: "Arsenal",
      tla: "ARS",
      crest: "https://crests.football-data.org/57.svg",
    },
    score: {
      winner: null,
      duration: "REGULAR",
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null },
    },
    referees: [],
    competition: {
      id: 2021,
      name: "Premier League",
      code: "PL",
      type: "LEAGUE",
      emblem: "",
    },
    season: {
      id: 2403,
      startDate,
      endDate: "2027-05-30",
      currentMatchday: 1,
      winner: null,
    },
    area: { id: 2072, name: "England", code: "ENG", flag: null },
  };
}

let mockMatchesResponse: FdMatchesResponse = {
  count: 1,
  filters: {},
  competition: {
    id: 2021,
    name: "Premier League",
    code: "PL",
    type: "LEAGUE",
    emblem: "",
  },
  matches: [makeMatch("2026-08-21")],
};

vi.mock("@/lib/api/football-data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/api/football-data")>();
  return {
    ...original,
    getCompetitionMatches: vi.fn(async () => mockMatchesResponse),
  };
});

const { syncLeagueFixtures } = await import("../sync-fixtures");

// ─── 테스트 ─────────────────────────────────────

describe("syncLeagueFixtures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ error: null });
    mockMatchesResponse = {
      count: 1,
      filters: {},
      competition: {
        id: 2021,
        name: "Premier League",
        code: "PL",
        type: "LEAGUE",
        emblem: "",
      },
      matches: [makeMatch("2026-08-21")],
    };
    for (const key of Object.keys(upsertCalls)) {
      delete upsertCalls[key];
    }
  });

  it("fixtures 행에 API에서 파생한 시즌을 기록", async () => {
    const result = await syncLeagueFixtures("PL", 2021);

    expect(result.status).toBe("success");
    const fixtureRows = upsertCalls["fixtures"]![0][0] as Array<{
      id: number;
      season: string;
    }>;
    expect(fixtureRows[0].season).toBe("2026/2027");
  });

  it("teams 행에도 동일한 파생 시즌을 기록", async () => {
    await syncLeagueFixtures("PL", 2021);

    const teamRows = upsertCalls["teams"]![0][0] as Array<{
      id: number;
      season: string;
    }>;
    expect(teamRows).toHaveLength(2);
    expect(teamRows.every((row) => row.season === "2026/2027")).toBe(true);
  });

  it("아직 전환 전인 대회는 이전 시즌 라벨로 기록", async () => {
    mockMatchesResponse = {
      ...mockMatchesResponse,
      matches: [makeMatch("2025-07-08")],
    };

    await syncLeagueFixtures("CL", 2001);

    const fixtureRows = upsertCalls["fixtures"]![0][0] as Array<{
      season: string;
    }>;
    expect(fixtureRows[0].season).toBe("2025/2026");
  });

  it("경기 응답이 비어 시즌을 알 수 없으면 error 결과 반환", async () => {
    mockMatchesResponse = { ...mockMatchesResponse, count: 0, matches: [] };

    const result = await syncLeagueFixtures("PL", 2021);

    expect(result.status).toBe("error");
    expect(result.errorMessage).toContain("시즌 정보");
    expect(upsertCalls["fixtures"]).toBeUndefined();
  });
});
```

- [ ] **Step 10: 테스트 실패 확인**

Run: `npx vitest run lib/services/sync/__tests__/sync-fixtures.test.ts`
Expected: FAIL — 시즌이 `"2025/2026"` 하드코딩이라 첫 테스트가 깨지고, 빈 응답 케이스는 `status: "success"`로 반환됨

- [ ] **Step 11: sync-fixtures 구현**

`lib/services/sync/sync-fixtures.ts`의 1-18행(import + 상수)을 아래로 교체:

```ts
import "server-only";

import {
  deriveSeasonLabelFromMatches,
  getCompetitionMatches,
  mapFdMatchToFixture,
} from "@/lib/api/football-data";
import type { FdMatch } from "@/lib/api/football-data/types";
import { ALL_COMPETITIONS, PL_LEAGUE_ID } from "@/lib/constants/football";
import { createAdminClient } from "@/lib/supabase/admin";

import { fixtureToDbRow, teamToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";
```

같은 파일 41행 부근(경기 조회 직후)을 아래로 교체:

```ts
const { matches: allMatches } = await getCompetitionMatches(leagueCode);

// 시즌 라벨은 응답에서 파생 — 대회마다 롤오버 시점이 다르다
const seasonLabel = deriveSeasonLabelFromMatches(allMatches);
if (!seasonLabel) {
  throw new Error(`${leagueCode} 경기 응답에서 시즌 정보를 확인할 수 없습니다`);
}
```

같은 파일 59행의 팀 행 생성에서 `season: SEASON_LABEL`을 파생값으로 교체:

```ts
              season: seasonLabel,
```

(`const SEASON_LABEL = "2025/2026";` 줄은 Step 1의 import 교체에서 이미 삭제됨 — 남아 있으면 제거)

- [ ] **Step 12: 테스트 통과 확인**

Run: `npx vitest run lib/services/sync/__tests__/sync-fixtures.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 13: 전체 검증 + 커밋**

Run: `npm run test && npm run validate`
Expected: 전부 PASS

```bash
git add types/fixture.ts lib/api/football-data lib/repositories/mappers.ts lib/services/sync "app/(app)/matchday/__tests__/_utils.test.ts" lib/repositories/__tests__/mappers.test.ts
git commit -m "✨ feat: 경기 동기화가 API 파생 시즌을 fixtures.season에 기록" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: 팀·순위 동기화 시즌 파생

**Files:**

- Modify: `lib/services/sync/sync-teams.ts:1-119`
- Create: `lib/services/sync/__tests__/sync-teams.test.ts`

**Interfaces:**

- Consumes: `deriveSeasonLabel(season: FdSeason): string` (Task 1), `getCompetitionTeams(code)`/`getCompetitionStandings(code)` (Task 2)
- Produces: `teams.season` / `standings.season`에 대회별 파생 라벨 기록 — `standings` upsert의 `onConflict: "team_id,season,league_id"` 덕분에 새 시즌은 신규 INSERT되고 25/26 행은 보존된다

- [ ] **Step 1: 실패 테스트 작성**

`lib/services/sync/__tests__/sync-teams.test.ts`:

```ts
// syncTeams / syncStandings 시즌 파생 테스트

import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  FdStandingsResponse,
  FdTeamsResponse,
} from "@/lib/api/football-data/types";

vi.mock("server-only", () => ({}));

const upsertCalls: Record<
  string,
  Array<[unknown[], Record<string, string>]>
> = {};
const mockInsert = vi.fn().mockReturnValue({ error: null });

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "sync_logs") {
        return { insert: mockInsert };
      }
      return {
        upsert: (rows: unknown[], opts: Record<string, string>) => {
          if (!upsertCalls[table]) upsertCalls[table] = [];
          upsertCalls[table].push([rows, opts]);
          return { error: null };
        },
      };
    },
  }),
}));

const competition = {
  id: 2021,
  name: "Premier League",
  code: "PL",
  type: "LEAGUE",
  emblem: "",
};

function makeSeason(startDate: string) {
  return {
    id: 2403,
    startDate,
    endDate: "2027-05-30",
    currentMatchday: 1,
    winner: null,
  };
}

let mockTeamsResponse: FdTeamsResponse = {
  count: 1,
  competition,
  season: makeSeason("2026-08-21"),
  teams: [
    {
      id: 65,
      name: "Manchester City FC",
      shortName: "Man City",
      tla: "MCI",
      crest: "https://crests.football-data.org/65.svg",
      address: "",
      website: "",
      founded: 1880,
      clubColors: "Sky Blue / White",
      venue: "Etihad Stadium",
      coach: null,
      squad: [],
    },
  ],
};

let mockStandingsResponse: FdStandingsResponse = {
  competition,
  season: makeSeason("2026-08-21"),
  standings: [
    {
      stage: "REGULAR_SEASON",
      type: "TOTAL",
      group: null,
      table: [
        {
          position: 1,
          team: {
            id: 65,
            name: "Manchester City FC",
            shortName: "Man City",
            tla: "MCI",
            crest: "",
          },
          playedGames: 1,
          form: "W",
          won: 1,
          draw: 0,
          lost: 0,
          points: 3,
          goalsFor: 2,
          goalsAgainst: 0,
          goalDifference: 2,
        },
      ],
    },
  ],
};

vi.mock("@/lib/api/football-data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/api/football-data")>();
  return {
    ...original,
    getCompetitionTeams: vi.fn(async () => mockTeamsResponse),
    getCompetitionStandings: vi.fn(async () => mockStandingsResponse),
  };
});

const { syncStandings, syncTeams } = await import("../sync-teams");

describe("syncTeams / syncStandings 시즌 파생", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ error: null });
    mockTeamsResponse = {
      ...mockTeamsResponse,
      season: makeSeason("2026-08-21"),
    };
    mockStandingsResponse = {
      ...mockStandingsResponse,
      season: makeSeason("2026-08-21"),
    };
    for (const key of Object.keys(upsertCalls)) {
      delete upsertCalls[key];
    }
  });

  it("teams 행에 응답 season에서 파생한 라벨 기록", async () => {
    const result = await syncTeams("PL");

    expect(result.status).toBe("success");
    const teamRows = upsertCalls["teams"]![0][0] as Array<{ season: string }>;
    expect(teamRows[0].season).toBe("2026/2027");
  });

  it("standings 행에 파생 라벨 기록 + 시즌 단위 onConflict 유지", async () => {
    const result = await syncStandings("PL", 2021);

    expect(result.status).toBe("success");
    const [rows, opts] = upsertCalls["standings"]![0];
    expect((rows as Array<{ season: string }>)[0].season).toBe("2026/2027");
    expect(opts.onConflict).toBe("team_id,season,league_id");
  });

  it("아직 전환 전인 대회는 이전 시즌 라벨 유지", async () => {
    mockStandingsResponse = {
      ...mockStandingsResponse,
      season: makeSeason("2025-07-08"),
    };

    await syncStandings("CL", 2001);

    const rows = upsertCalls["standings"]![0][0] as Array<{ season: string }>;
    expect(rows[0].season).toBe("2025/2026");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run lib/services/sync/__tests__/sync-teams.test.ts`
Expected: FAIL — `expected "2025/2026" to be "2026/2027"` (하드코딩 `SEASON_LABEL` 때문)

- [ ] **Step 3: 구현**

`lib/services/sync/sync-teams.ts`의 1-15행(import + 상수)을 아래로 교체:

```ts
import "server-only";

import {
  deriveSeasonLabel,
  getCompetitionStandings,
  getCompetitionTeams,
  mapFdStandingToTeamStanding,
  mapFdTeamToTeam,
} from "@/lib/api/football-data";
import { ALL_COMPETITIONS } from "@/lib/constants/football";
import { createAdminClient } from "@/lib/supabase/admin";

import { standingToDbRow, teamToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";
```

`syncTeams`의 조회~매핑 부분(기존 23-28행)을 아래로 교체:

```ts
const res = await getCompetitionTeams(leagueCode);
const seasonLabel = deriveSeasonLabel(res.season);

const teamRows = res.teams.map((raw) => {
  const team = mapFdTeamToTeam(raw, seasonLabel);
  return teamToDbRow(team);
});
```

`syncStandings`의 조회~매핑 부분(기존 72-84행)을 아래로 교체:

```ts
const standingsRes = await getCompetitionStandings(leagueCode);
const seasonLabel = deriveSeasonLabel(standingsRes.season);

const totalTable = standingsRes.standings.find((s) => s.type === "TOTAL");
if (!totalTable?.table?.length) {
  throw new Error(`${leagueCode} 순위표 응답이 비어있습니다`);
}

const standingRows = totalTable.table.map((raw) => {
  const standing = mapFdStandingToTeamStanding(raw, leagueId);
  return standingToDbRow(standing, seasonLabel);
});
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run lib/services/sync/__tests__/sync-teams.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add lib/services/sync/sync-teams.ts lib/services/sync/__tests__/sync-teams.test.ts
git commit -m "✨ feat: 팀·순위 동기화가 대회별 파생 시즌을 기록" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: ScoutLab 활성 시즌 단일 상수화

ScoutLab은 26/27 데이터 수집(Phase SR04) 전까지 **의도적으로 25/26에 고정**한다. 다만 `"25/26"` 리터럴이 3곳에 흩어져 있어 SR04에서 한 곳만 고치면 되도록 단일 상수로 모은다. 동기화(`sync-players`)도 같은 상수를 참조해야 UI가 보지 못하는 26/27 ScoutLab 행이 생기지 않는다.

**Files:**

- Create: `lib/constants/scoutlab.ts`
- Modify: `app/(app)/scouting/_lib/scoutlab-constants.ts:1-9,52`
- Modify: `app/api/scoutlab/ranking/route.ts:1-6,25`
- Modify: `app/api/scoutlab/players/search/route.ts:1-9`

**Interfaces:**

- Consumes: `ScoutlabSeason` 타입 (`types/scoutlab.ts:14`, `@/types`에서 re-export)
- Produces: `SCOUTLAB_ACTIVE_SEASON: ScoutlabSeason` — Task 7의 `sync-players`가 사용

- [ ] **Step 1: 단일 상수 파일 생성**

`lib/constants/scoutlab.ts`:

```ts
// ScoutLab 활성 시즌 — 데이터 수집이 끝난 시즌만 노출한다.
// 26/27 데이터 수집 전환은 Phase SR04에서 이 상수 하나만 변경한다.

import type { ScoutlabSeason } from "@/types";

/** ScoutLab 화면·API·동기화가 공통으로 사용하는 활성 시즌 */
export const SCOUTLAB_ACTIVE_SEASON: ScoutlabSeason = "25/26";
```

- [ ] **Step 2: ScoutLab 화면 상수를 재참조로 변경**

`app/(app)/scouting/_lib/scoutlab-constants.ts` — 1-9행 import 블록 아래에 상수 import 추가:

```ts
// ScoutLab 공유 상수 (Server/Client 공용)

import { SCOUTLAB_ACTIVE_SEASON } from "@/lib/constants/scoutlab";
import type {
  ScoutlabAdjustment,
  ScoutlabComparisonPosition,
  ScoutlabLeague,
  ScoutlabMode,
  ScoutlabPosition,
} from "@/types";
```

52행을 교체:

```ts
export const DEFAULT_SEASON = SCOUTLAB_ACTIVE_SEASON;
```

- [ ] **Step 3: ScoutLab API 라우트 2곳 교체**

`app/api/scoutlab/ranking/route.ts` — import 추가 후 25행 교체:

```ts
// ScoutLab Ranking API — 메트릭별 랭킹 데이터 조회
import { NextResponse } from "next/server";

import { SCOUTLAB_ACTIVE_SEASON } from "@/lib/constants/scoutlab";
import { getRankingData } from "@/lib/repositories/scoutlab-repository";
import type { ScoutlabCategory } from "@/types";
```

```ts
const season = searchParams.get("season") ?? SCOUTLAB_ACTIVE_SEASON;
```

`app/api/scoutlab/players/search/route.ts` — import 추가 후 9행 교체:

```ts
// ScoutLab 선수 검색 API — 리그/팀 필터 + 이름 검색
import { NextResponse } from "next/server";

import { SCOUTLAB_ACTIVE_SEASON } from "@/lib/constants/scoutlab";
import { createClient } from "@/lib/supabase/server";
```

```ts
const season = searchParams.get("season") ?? SCOUTLAB_ACTIVE_SEASON;
```

- [ ] **Step 4: 하드코딩 잔존 확인 + 테스트**

Run: `grep -rn '"25/26"' --include="*.ts" --include="*.tsx" app lib`
Expected: `lib/constants/scoutlab.ts` 1곳과 테스트 파일(`app/(app)/scouting/_lib/__tests__/*.test.ts`)만 남음 — 테스트는 기대값이라 그대로 둔다

Run: `npm run test && npm run type-check`
Expected: 전부 PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/constants/scoutlab.ts "app/(app)/scouting/_lib/scoutlab-constants.ts" app/api/scoutlab
git commit -m "♻️ refactor: ScoutLab 활성 시즌을 단일 상수로 통합" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: 선수 동기화·맥락 계산의 시즌 파생

**Files:**

- Modify: `lib/services/sync/sync-players.ts:1-37,58,72,120`
- Modify: `lib/services/sync/calculate-context.ts:1-34,153-200,259-277`
- Test: `lib/services/sync/__tests__/sync-players.test.ts:57-66` (mock season 갱신 + 기대값 추가)

**Interfaces:**

- Consumes: `deriveSeasonLabel` (Task 1), `SCOUTLAB_ACTIVE_SEASON` (Task 6), `toScoutlabSeason` (`lib/constants/football.ts:212`)
- Produces:
  - `syncPlayers()` — `teams.season`은 API 파생 라벨, `scoutlab_players.season`은 `SCOUTLAB_ACTIVE_SEASON` 고정
  - `calculateContext()` — 대상 시즌을 `player_season_stats`의 최신/직전 시즌에서 파생

- [ ] **Step 1: sync-players 테스트에 시즌 기대값 추가**

`lib/services/sync/__tests__/sync-players.test.ts` — `mockTeamsResponse.season`의 `startDate`를 `"2026-08-21"`, `endDate`를 `"2027-05-30"`으로 변경:

```ts
  season: {
    id: 1,
    startDate: "2026-08-21",
    endDate: "2027-05-30",
    currentMatchday: 1,
    winner: null,
  },
```

그리고 `describe("syncPlayers", ...)` 안에 테스트 2개 추가:

```ts
it("teams 행은 API 응답에서 파생한 시즌을 사용", async () => {
  await syncPlayers();

  const teamRows = upsertCalls["teams"]![0][0] as Array<{ season: string }>;
  expect(teamRows[0].season).toBe("2026/2027");
});

it("scoutlab_players 행은 활성 시즌(25/26)에 고정", async () => {
  await syncPlayers();

  const scoutlabRows = upsertCalls["scoutlab_players"]![0][0] as Array<{
    season: string;
  }>;
  expect(scoutlabRows.every((row) => row.season === "25/26")).toBe(true);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run lib/services/sync/__tests__/sync-players.test.ts`
Expected: FAIL — teams 시즌이 `"2025/2026"`으로 나옴

- [ ] **Step 3: sync-players 구현**

`lib/services/sync/sync-players.ts`의 1-23행을 아래로 교체:

```ts
import "server-only";

import {
  deriveSeasonLabel,
  getCompetitionScorers,
  getCompetitionTeams,
  mapFdSquadPlayerToPlayer,
  mapFdSquadPlayerToScoutlabRow,
  mapFdTeamToTeam,
} from "@/lib/api/football-data";
import { SCOUTLAB_ACTIVE_SEASON } from "@/lib/constants/scoutlab";
import { createAdminClient } from "@/lib/supabase/admin";

import { playerToDbRow, teamToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const LEAGUE = "Premier League";
const LEAGUE_CODE = "PL";
// ScoutLab 데이터 수집은 아직 25/26 기준 — Phase SR04에서 전환한다
const SCOUTLAB_SEASON: string = SCOUTLAB_ACTIVE_SEASON;
```

`syncPlayers()` 본문의 API 조회 직후(기존 34-37행)에 시즌 파생 추가:

```ts
// 1. 팀 + squad 데이터 조회
const teamsRes = await getCompetitionTeams(LEAGUE_CODE);
const seasonLabel = deriveSeasonLabel(teamsRes.season);

// 2. 득점자 정보 조회 (등번호 + 출전경기수 보강용)
const scorersRes = await getCompetitionScorers(LEAGUE_CODE);
```

teams 매핑(기존 58행)에서 `SEASON_LABEL` → `seasonLabel`:

```ts
const team = mapFdTeamToTeam(raw, seasonLabel);
```

(`toScoutlabSeason` import와 `SEASON_LABEL` 상수는 Step 3의 import 교체에서 제거됨. `SCOUTLAB_SEASON`을 쓰는 72행·120행은 그대로 둔다.)

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run lib/services/sync/__tests__/sync-players.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: calculate-context가 DB에서 시즌을 파생하도록 수정**

`lib/services/sync/calculate-context.ts` — 12-15행의 상수 블록에서 `CURRENT_SEASON` / `PREV_SEASON` 두 줄을 삭제하고, 그 자리에 아래 헬퍼를 추가:

```ts
// ─── 상수 ────────────────────────────────────────────────

/** 맥락 계산 대상 시즌 (DB에서 파생) */
interface ResolvedSeasons {
  currentSeason: string | null;
  prevSeason: string | null;
}

/**
 * player_season_stats에 적재된 시즌 중 최신/직전 시즌을 파생한다.
 * 시즌 라벨은 "YYYY/YYYY" 형식이라 문자열 내림차순 = 최신순이다.
 */
async function resolveStatsSeasons(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<ResolvedSeasons> {
  const { data: latest, error: latestError } = await supabase
    .from("player_season_stats")
    .select("season")
    .order("season", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) throw latestError;
  const currentSeason = (latest?.season as string | undefined) ?? null;
  if (!currentSeason) return { currentSeason: null, prevSeason: null };

  const { data: prev, error: prevError } = await supabase
    .from("player_season_stats")
    .select("season")
    .lt("season", currentSeason)
    .order("season", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (prevError) throw prevError;

  return {
    currentSeason,
    prevSeason: (prev?.season as string | undefined) ?? null,
  };
}
```

- [ ] **Step 6: calculateContext 본문에서 파생 시즌 사용**

`calculateContext()`의 Step 1 조회부(기존 157-177행)를 아래로 교체:

```ts
  try {
    // Step 0: 대상 시즌 파생 (전역 상수 대신 DB 최신 시즌 사용)
    const { currentSeason, prevSeason } = await resolveStatsSeasons(supabase);

    if (!currentSeason) {
      const result: SyncResult = {
        entity: "context_calculation",
        status: "success",
        recordsSynced: 0,
        errorMessage: "시즌 스탯 데이터 없음 — sync-stats 먼저 실행 필요",
      };
      await writeSyncLog(supabase, result);
      return result;
    }

    // Step 1: 현재 시즌 전체 스탯 + 포지션 JOIN 조회
    const { data: rawStats, error: fetchError } = await supabase
      .from("player_season_stats")
      .select(
        "id, player_id, goals, assists, key_passes, dribbles, average_rating, radar_data, players!inner(position)",
      )
      .eq("season", currentSeason);

    if (fetchError) throw fetchError;

    if (!rawStats || rawStats.length === 0) {
      const result: SyncResult = {
        entity: "context_calculation",
        status: "success",
        recordsSynced: 0,
        errorMessage: `${currentSeason} 시즌 스탯 데이터 없음`,
      };
      await writeSyncLog(supabase, result);
      return result;
    }
```

Step 2의 전년 시즌 조회(기존 193-198행)를 아래로 교체:

```ts
// Step 2: 전년 시즌 스탯 조회 (prevSeason 비교용 — 없으면 건너뜀)
const prevMap = new Map<number, PrevSeasonRow>();
if (prevSeason) {
  const { data: prevRaw } = await supabase
    .from("player_season_stats")
    .select("player_id, goals, assists, key_passes, dribbles, average_rating")
    .eq("season", prevSeason);

  for (const p of prevRaw ?? []) {
    prevMap.set(p.player_id as number, p as PrevSeasonRow);
  }
}
```

Step 6의 upsert 행 생성(기존 273행)에서 시즌을 파생값으로 교체:

```ts
        season: currentSeason,
```

- [ ] **Step 7: 전체 검증 + 커밋**

Run: `npm run test && npm run validate`
Expected: 전부 PASS

```bash
git add lib/services/sync
git commit -m "✨ feat: 선수 동기화·맥락 계산의 시즌을 API·DB에서 파생" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: fixture 조회 계층 시즌 인식

`getFixturesByGameweek()`가 `gameweek` + `league_id`만으로 필터하면 26/27 GW1과 25/26 GW1이 섞인다. 현재 게임위크를 판별할 때 그 경기의 시즌도 함께 얻어 필터에 넘긴다.

**Files:**

- Modify: `lib/repositories/fixture-repository.ts:1-100`
- Modify: `lib/repositories/index.ts:4-9`
- Modify: `app/(marketing)/_components/home-content.tsx:45-93`

**Interfaces:**

- Consumes: `fixtures.season` 컬럼 (Task 3), `FixtureRow.season` (Task 4)
- Produces:
  - `interface CurrentGameweek { gameweek: number; season: string | null }`
  - `getCurrentGameweek(leagueId?: number): Promise<CurrentGameweek>` — **반환 타입 변경** (기존 `Promise<number>`)
  - `getFixturesByGameweek(gameweek: number, leagueId?: number, season?: string): Promise<Fixture[]>` — season 인자가 있으면 해당 시즌만

- [ ] **Step 1: `getCurrentGameweek` 확장**

`lib/repositories/fixture-repository.ts`의 12-63행을 아래로 교체:

```ts
/** 현재 게임위크 판별 결과 — 기준 경기의 시즌을 함께 반환 */
export interface CurrentGameweek {
  gameweek: number;
  /** 기준 경기의 시즌 라벨 (해당 리그 데이터가 없으면 null) */
  season: string | null;
}

/**
 * 현재 게임위크 감지 (리그별):
 * 1) LIVE 경기가 있는 gameweek
 * 2) 가장 가까운 미래 NS 경기의 gameweek
 * 3) 가장 최근 종료된 FT 경기의 gameweek
 * 4) fallback: 1 (시즌 미상)
 */
export const getCurrentGameweek = cache(
  async (leagueId: number = PL_LEAGUE_ID): Promise<CurrentGameweek> => {
    const supabase = await createClient();

    const [liveResult, nextResult, lastResult] = await Promise.all([
      // 1) LIVE 경기
      supabase
        .from("fixtures")
        .select("gameweek, season")
        .eq("status", "LIVE")
        .eq("league_id", leagueId)
        .not("gameweek", "is", null)
        .limit(1)
        .maybeSingle(),
      // 2) 가장 가까운 미래 NS 경기 (POSTP 제외)
      supabase
        .from("fixtures")
        .select("gameweek, season")
        .eq("status", "NS")
        .eq("league_id", leagueId)
        .not("gameweek", "is", null)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle(),
      // 3) 가장 최근 FT 경기
      supabase
        .from("fixtures")
        .select("gameweek, season")
        .eq("status", "FT")
        .eq("league_id", leagueId)
        .not("gameweek", "is", null)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    // 우선순위: LIVE > NS(미래) > FT(과거) > fallback(1)
    for (const result of [liveResult, nextResult, lastResult]) {
      const row = result.data as {
        gameweek: number | null;
        season: string;
      } | null;
      if (row?.gameweek) {
        return { gameweek: row.gameweek, season: row.season };
      }
    }

    return { gameweek: 1, season: null };
  },
);
```

- [ ] **Step 2: `getFixturesByGameweek`에 시즌 필터 추가**

같은 파일 83-100행을 아래로 교체:

```ts
/** 게임위크별 리그 전체 경기 조회 (기본값: PL, season 지정 시 해당 시즌만) */
export async function getFixturesByGameweek(
  gameweek: number,
  leagueId: number = PL_LEAGUE_ID,
  season?: string,
): Promise<Fixture[]> {
  const supabase = await createClient();

  let query = supabase
    .from("fixtures")
    .select("*")
    .eq("gameweek", gameweek)
    .eq("league_id", leagueId);

  // 시즌 미지정 시 과거 시즌의 같은 라운드가 섞일 수 있으므로 가능한 항상 지정한다
  if (season) query = query.eq("season", season);

  const { data, error } = await query.order("date", { ascending: true });

  if (error) throw new Error(`fixtures 조회 실패: ${error.message}`);

  return (data as FixtureRow[]).map(fixtureRowToFixture);
}
```

- [ ] **Step 3: repository 진입점에 타입 export 추가**

`lib/repositories/index.ts`의 4-9행을 아래로 교체:

```ts
export type { CurrentGameweek } from "./fixture-repository";
export {
  getCurrentGameweek,
  getFixtureById,
  getFixturesByDate,
  getFixturesByGameweek,
} from "./fixture-repository";
```

- [ ] **Step 4: 홈 화면이 새 반환 타입을 쓰도록 수정**

`app/(marketing)/_components/home-content.tsx`의 49-72행을 아래로 교체:

```ts
const [todayFixtures, standingsMap, currentGameweek, latestNews] =
  await Promise.all([
    getFixturesByDate(todayDate),
    getAllLeagueStandings(CURRENT_SEASON_LABEL),
    getCurrentGameweek(PL_LEAGUE_ID),
    getLatestNews(3),
  ]);

// 오늘 경기가 없으면 다음 라운드 경기 조회 (현재 게임위크의 시즌으로 한정)
let nextRoundFixtures: Fixture[] = [];
let upcomingFixtures: Fixture[] = [];
if (todayFixtures.length === 0) {
  nextRoundFixtures = await getFixturesByGameweek(
    currentGameweek.gameweek,
    PL_LEAGUE_ID,
    currentGameweek.season ?? undefined,
  );

  // PL 라운드 경기가 모두 종료됐으면 전체 대회에서 다음 예정 경기 조회
  const hasUpcomingInRound = nextRoundFixtures.some((f) => f.status === "NS");
  if (!hasUpcomingInRound) {
    nextRoundFixtures = []; // 종료된 라운드는 표시하지 않음
    upcomingFixtures = await getUpcomingFixtures(6);
  }
}
```

같은 파일 90행의 prop 전달을 교체 (하위 컴포넌트는 계속 `number`를 받는다):

```ts
      currentGameweek={currentGameweek.gameweek}
```

- [ ] **Step 5: 검증**

Run: `npm run test && npm run type-check`
Expected: 전부 PASS (`getAllLeagueStandings(CURRENT_SEASON_LABEL)`는 Task 9에서 정리하므로 여기서는 그대로 둔다)

- [ ] **Step 6: 커밋**

```bash
git add lib/repositories "app/(marketing)/_components/home-content.tsx"
git commit -m "✨ feat: 게임위크 조회에 시즌 필터 추가로 시즌 혼입 방지" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: 순위 조회를 DB 최신 시즌 파생으로 전환

화면이 "현재 시즌"을 전역 상수로 알던 구조를 없앤다. 순위는 대회별로 `standings`에 존재하는 **가장 최신 시즌**을 파생해 조회한다(UCL이 25/26에 머물러 있어도 각 리그는 26/27로 자동 전환).

**Files:**

- Modify: `lib/repositories/standing-repository.ts:1-83`
- Modify: `lib/repositories/index.ts:47-51`
- Modify: `app/(app)/ranking/page.tsx:1-22`
- Modify: `app/(app)/matchday/page.tsx:1-62`
- Modify: `app/api/matchday/fixtures/route.ts:1-51`
- Modify: `lib/services/fixture-detail-service.ts:1-37`
- Modify: `app/(marketing)/_components/home-content.tsx:1-55`

**Interfaces:**

- Produces:
  - `getLatestStandingSeasons(): Promise<Map<number, string>>` — leagueId → 최신 시즌 라벨
  - `getAllLeagueStandings(): Promise<Map<number, TeamStanding[]>>` — **season 인자 제거**
  - `getStandingsByTeamIds(teamIds: number[]): Promise<Map<number, TeamStanding>>` — **season 인자 제거**
  - `getAllStandings(season: string)`는 시그니처 변경 없음

- [ ] **Step 1: standing-repository 재작성**

`lib/repositories/standing-repository.ts`의 29-82행(`getAllLeagueStandings`, `getStandingsByTeamIds`)을 아래로 교체:

```ts
/**
 * 대회별 최신 시즌 라벨 조회 → Map<leagueId, season>
 * 시즌 라벨은 "YYYY/YYYY" 형식이라 문자열 내림차순 = 최신순이다.
 */
export const getLatestStandingSeasons = cache(
  async (): Promise<Map<number, string>> => {
    const supabase = await createClient();
    const leagueIds = ALL_COMPETITIONS.map((c) => c.id);

    const { data, error } = await supabase
      .from("standings")
      .select("league_id, season")
      .in("league_id", leagueIds)
      .order("season", { ascending: false });

    if (error) throw new Error(`standings 시즌 조회 실패: ${error.message}`);

    const latest = new Map<number, string>();
    for (const row of data as Array<{ league_id: number; season: string }>) {
      if (!latest.has(row.league_id)) latest.set(row.league_id, row.season);
    }
    return latest;
  },
);

/** 전체 대회 최신 시즌 순위 조회 (5대 리그 + UCL) → Map<leagueId, TeamStanding[]> */
export const getAllLeagueStandings = cache(
  async (): Promise<Map<number, TeamStanding[]>> => {
    const latestSeasons = await getLatestStandingSeasons();
    if (latestSeasons.size === 0) return new Map();

    const supabase = await createClient();
    const leagueIds = ALL_COMPETITIONS.map((c) => c.id);
    // 대회마다 최신 시즌이 다를 수 있어(UCL 시차) 등장하는 시즌을 모두 조회한 뒤 대회별로 걸러낸다
    const seasons = Array.from(new Set(latestSeasons.values()));

    const { data, error } = await supabase
      .from("standings")
      .select("*")
      .in("league_id", leagueIds)
      .in("season", seasons)
      .order("position", { ascending: true });

    if (error)
      throw new Error(`standings 전체 대회 조회 실패: ${error.message}`);

    const map = new Map<number, TeamStanding[]>();
    for (const row of data as StandingRow[]) {
      if (latestSeasons.get(row.league_id) !== row.season) continue;
      const list = map.get(row.league_id) ?? [];
      list.push(standingRowToStanding(row));
      map.set(row.league_id, list);
    }
    return map;
  },
);

/** 여러 팀 ID의 국내 리그 최신 시즌 순위를 한 번에 조회 → Map<teamId, TeamStanding>
 *  UCL standings가 덮어쓰지 않도록 TOP5_LEAGUE_IDS로 필터 */
export const getStandingsByTeamIds = cache(
  async (teamIds: number[]): Promise<Map<number, TeamStanding>> => {
    if (teamIds.length === 0) return new Map();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("standings")
      .select("*")
      .in("team_id", teamIds)
      .in("league_id", Array.from(TOP5_LEAGUE_IDS));

    if (error) throw new Error(`standings 조회 실패: ${error.message}`);

    // 팀별로 가장 최신 시즌 행만 남긴다
    const latestByTeam = new Map<number, string>();
    const map = new Map<number, TeamStanding>();
    for (const row of data as StandingRow[]) {
      const current = latestByTeam.get(row.team_id);
      if (current && current >= row.season) continue;
      latestByTeam.set(row.team_id, row.season);
      map.set(row.team_id, standingRowToStanding(row));
    }
    return map;
  },
);
```

- [ ] **Step 2: repository 진입점 export 갱신**

`lib/repositories/index.ts`의 47-51행을 아래로 교체:

```ts
export {
  getAllLeagueStandings,
  getAllStandings,
  getLatestStandingSeasons,
  getStandingsByTeamIds,
} from "./standing-repository";
```

- [ ] **Step 3: 호출처 5곳에서 시즌 인자·import 제거**

`app/(app)/ranking/page.tsx` — 7행 import 삭제, 20행 인자 제거:

```ts
import { PageLoadingIndicator } from "@/components/page-loading-indicator";
import { getAllLeagueStandings, getAllTeams } from "@/lib/repositories";
import type { Team, TeamStanding } from "@/types";
```

```ts
const [standingsMap, teams] = await Promise.all([
  getAllLeagueStandings(),
  getAllTeams(),
]);
```

`app/(app)/matchday/page.tsx` — 5행 import 삭제, 61행 인자 제거:

```ts
import {
  formatFullDate,
  getTodayDateKey,
  isValidDateKey,
} from "@/lib/date-utils";
```

```ts
const [teamsMap, standingsMap] = await Promise.all([
  getTeamsByIds(teamIds),
  getStandingsByTeamIds(teamIds),
]);
```

`app/api/matchday/fixtures/route.ts` — 6행 import 삭제, 50행 인자 제거:

```ts
import { isValidDateKey } from "@/lib/date-utils";
```

```ts
const [teamsMap, standingsMap] = await Promise.all([
  getTeamsByIds(teamIds),
  getStandingsByTeamIds(teamIds),
]);
```

`lib/services/fixture-detail-service.ts` — 4행 import 삭제, 27행 인자 제거:

```ts
// Fixture 상세 데이터 조립 서비스 — page.tsx와 API route 공통 로직
import "server-only";

import {
  getInjuriesByTeamId,
  getStandingsByTeamIds,
  getTeamsByIds,
} from "@/lib/repositories";
```

```ts
      getStandingsByTeamIds(teamIds),
```

`app/(marketing)/_components/home-content.tsx` — 5행 import에서 `CURRENT_SEASON_LABEL` 제거, 52행 인자 제거:

```ts
import { PL_LEAGUE_ID } from "@/lib/constants/football";
```

```ts
      getAllLeagueStandings(),
```

- [ ] **Step 4: 검증**

Run: `npm run validate && npm run test`
Expected: 전부 PASS

Run: `grep -rn "CURRENT_SEASON_LABEL" --include="*.ts" --include="*.tsx" app lib`
Expected: `lib/constants/football.ts:12`(정의)와 `app/api/og/route.tsx` 3곳만 남음 — Task 10에서 제거

- [ ] **Step 5: 커밋**

```bash
git add lib/repositories lib/services/fixture-detail-service.ts "app/(app)/ranking/page.tsx" "app/(app)/matchday/page.tsx" app/api/matchday/fixtures/route.ts "app/(marketing)/_components/home-content.tsx"
git commit -m "♻️ refactor: 순위 조회를 DB 최신 시즌 파생으로 전환" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: 선수 시즌 스탯 최신 조회 + 시즌 상수 제거

**Files:**

- Modify: `lib/repositories/player-repository.ts:52-73`
- Modify: `lib/repositories/index.ts:21-27`
- Modify: `app/api/og/route.tsx:1-50`
- Modify: `lib/constants/football.ts:1-15`

**Interfaces:**

- Produces: `getLatestPlayerSeasonStats(playerId: number): Promise<PlayerSeasonStats | null>` — 해당 선수의 가장 최신 시즌 스탯
- Removes: `CURRENT_SEASON`, `CURRENT_SEASON_LABEL` (`lib/constants/football.ts`) — 이후 어떤 코드도 참조하지 않는다

- [ ] **Step 1: 최신 시즌 스탯 조회 함수 추가**

`lib/repositories/player-repository.ts`의 `getPlayerSeasonStats` 정의 바로 아래에 추가:

```ts
/** 선수의 가장 최신 시즌 스탯 조회 (시즌 라벨 문자열 내림차순 = 최신순) */
export const getLatestPlayerSeasonStats = cache(
  async (playerId: number): Promise<PlayerSeasonStats | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("player_season_stats")
      .select("*")
      .eq("player_id", playerId)
      .order("season", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error)
      throw new Error(`player_season_stats 최신 조회 실패: ${error.message}`);
    if (!data) return null;

    return playerSeasonStatsRowToStats(data as PlayerSeasonStatsRow);
  },
);
```

- [ ] **Step 2: repository 진입점 export 갱신**

`lib/repositories/index.ts`의 21-27행을 아래로 교체:

```ts
export {
  getAllPlayers,
  getLatestPlayerSeasonStats,
  getMatchStatsByPlayerId,
  getPlayerById,
  getPlayerSeasonStats,
  getPlayerSeasonStatsByIds,
} from "./player-repository";
```

- [ ] **Step 3: OG 이미지 라우트 교체**

`app/api/og/route.tsx`의 4-12행 import를 아래로 교체:

```tsx
import { ImageResponse } from "next/og";
import { type NextRequest, NextResponse } from "next/server";

import {
  getLatestPlayerSeasonStats,
  getPlayerById,
  getTeamsByIds,
} from "@/lib/repositories";
```

47-50행을 아래로 교체:

```tsx
const [stats1, stats2] = await Promise.all([
  getLatestPlayerSeasonStats(player1.id),
  getLatestPlayerSeasonStats(player2.id),
]);
```

- [ ] **Step 4: 시즌 상수 삭제**

`lib/constants/football.ts`의 1-15행을 아래로 교체 (`CURRENT_SEASON`, `CURRENT_SEASON_LABEL` 제거):

```ts
// 축구 도메인 공통 상수 — API 소스에 무관한 값만 정의
// 시즌 값은 상수로 두지 않는다: 대회마다 롤오버 시점이 달라 API 응답/DB에서 파생한다.

import type { FixtureStatus } from "@/types/fixture";

/** Premier League ID (football-data.org 기준) */
export const PL_LEAGUE_ID = 2021;

/** 맨체스터 시티 팀 ID (football-data.org 기준) */
export const MCITY_TEAM_ID = 65;
```

- [ ] **Step 5: 잔존 참조 확인**

Run: `grep -rn "CURRENT_SEASON" --include="*.ts" --include="*.tsx" app lib scripts`
Expected: 출력 없음

Run: `npm run validate && npm run test`
Expected: 전부 PASS

- [ ] **Step 6: 커밋**

```bash
git add lib/repositories lib/constants/football.ts app/api/og/route.tsx
git commit -m "♻️ refactor: CURRENT_SEASON 상수 제거하고 최신 시즌 파생 조회로 대체" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: 실제 26/27 동기화 검증

코드가 아니라 **실행 결과**를 확인하는 태스크다. football-data.org 무료 플랜은 분당 10요청이므로 디버그 동기화 1회(≈13요청)는 rate limiter가 자동 대기하며 처리한다.

**Files:**

- Modify: `docs/ROADMAP.md` (Task SR01/SR03 상태 갱신)

**Interfaces:**

- Consumes: Task 1~10의 모든 산출물

- [ ] **Step 1: 개발 서버를 워치독과 함께 기동**

Run (백그라운드, 10분 워치독 — 좀비 프로세스 방지):

```bash
cd /Users/jefflee/workspace/pitch-ac && ( npm run dev & pid=$!; ( sleep 600; kill -9 $pid 2>/dev/null ) & wd=$!; wait $pid; kill $wd 2>/dev/null )
```

Expected: `Ready in ...` 출력, http://localhost:3000 응답

- [ ] **Step 2: 전체 동기화 실행**

Run: `curl -s --max-time 300 http://localhost:3000/api/debug/football-data/sync`
Expected: JSON 응답의 모든 항목이 `"status":"success"`, `fixtures-league-2021`의 `recordsSynced > 0`

- [ ] **Step 3: DB에 26/27 시즌이 적재됐는지 확인**

Supabase MCP `mcp__supabase__execute_sql` 실행:

```sql
SELECT season, league_id, count(*) AS cnt
FROM fixtures
GROUP BY season, league_id
ORDER BY season DESC, league_id;
```

Expected: 5대 리그(2021, 2014, 2019, 2002, 2015)에 `2026/2027` 행이 생기고, UCL(2001)은 `2025/2026`으로 남아 있다 — 대회별 시차가 그대로 반영되면 성공

```sql
SELECT league_id, season, count(*) AS cnt
FROM standings
GROUP BY league_id, season
ORDER BY league_id, season DESC;
```

Expected: 각 리그에 `2026/2027`(개막 전이면 전 팀 0경기) 행이 추가되고 `2025/2026` 행도 보존됨

- [ ] **Step 4: 화면 스모크 테스트**

Run: `curl -s http://localhost:3000/ -o /dev/null -w "%{http_code}\n" && curl -s http://localhost:3000/ranking -o /dev/null -w "%{http_code}\n" && curl -s "http://localhost:3000/matchday" -o /dev/null -w "%{http_code}\n" && curl -s "http://localhost:3000/api/matchday/fixtures?date=$(date +%F)" -o /dev/null -w "%{http_code}\n"`
Expected: 모두 `200`

브라우저(또는 Playwright MCP `browser_navigate`)로 http://localhost:3000/ranking 확인:
Expected: 5대 리그 탭이 26/27 순위(전 팀 0경기 또는 개막 후 경기수)를 보여주고, UCL 탭은 25/26 최종 순위를 그대로 보여준다

- [ ] **Step 5: 개발 서버 정리**

Run: `pkill -f "next dev" || true`
Expected: 잔존 프로세스 없음 (`pgrep -f "next dev"` 출력 없음)

- [ ] **Step 6: 최종 통합 검증**

Run: `npm run validate && npm run test`
Expected: 전부 PASS

- [ ] **Step 7: ROADMAP 갱신 + 커밋**

`docs/ROADMAP.md`의 Phase SR에서 **Task SR01(시즌 자동 처리 검증)** 과 **Task SR03(26/27 전체 동기화 + 화면 검증)** 의 체크박스를 완료로 바꾸고, Phase 헤더의 `> 적용 스킬:` 태그는 유지한다.

```bash
git add docs/ROADMAP.md
git commit -m "📝 docs: ROADMAP Task SR01·SR03 완료 반영" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Self-Review

작성 후 스펙과 대조하며 점검한 결과와 수정 사항:

**1. 스펙 커버리지**

| 스펙 항목                                                  | 담당 Task                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| 동기화 계층 시즌 파라미터 제거 + 응답에서 파생             | Task 2, 4, 5, 7                                                |
| `deriveSeasonLabel` 유틸을 `lib/api/football-data/`에 신설 | Task 1                                                         |
| `getCompetitionMatches` 시그니처 변경                      | Task 2                                                         |
| UCL 시차 자동 해결                                         | Task 4·5의 "전환 전 대회" 테스트로 검증                        |
| `fixtures.season` 컬럼 + 백필 + 마이그레이션 SQL 전문      | Task 3                                                         |
| sync-fixtures가 파생 라벨 기록                             | Task 4                                                         |
| `getCurrentGameweek` → `{ gameweek, season }`              | Task 8                                                         |
| `getFixturesByGameweek` season 필터                        | Task 8                                                         |
| 화면 "현재 시즌"을 DB에서 파생                             | Task 8(매치데이 라운드), Task 9(랭킹·순위), Task 10(선수 스탯) |
| `CURRENT_SEASON`/`CURRENT_SEASON_LABEL` 제거               | Task 10                                                        |
| ScoutLab `DEFAULT_SEASON`은 25/26 유지 + 3곳 통일          | Task 6                                                         |
| 스코프 제외 항목                                           | 계획 상단 "스코프 제외"에 명시, 어떤 Task에도 미포함           |

**2. 검토 중 발견해 수정한 사항**

- **`fixtureToDbRow(fixture, season)` 시그니처 변경안을 폐기**했다. `FdMatch.season`이 이미 매퍼 입력에 들어 있으므로 `Fixture` 타입 자체에 `season`을 두면 매퍼 시그니처를 바꾸지 않아도 되고, 읽기 경로(`fixtureRowToFixture`)와 쓰기 경로가 같은 필드를 공유해 일관된다. 대신 `Fixture`가 필수 필드를 갖게 되어 깨지는 기존 테스트 픽스처 2곳(`lib/repositories/__tests__/mappers.test.ts`의 `baseRow`, `app/(app)/matchday/__tests__/_utils.test.ts`의 `makeFixture`)을 Task 4 Step 7에 명시했다.
- **Task 2가 중간 상태에서 컴파일되지 않는 문제**를 발견했다. API 함수에서 파라미터를 제거하면 4개 호출처가 인자 개수 오류(TS2554)를 낸다. Task 2에 "호출처 인자 제거" 스텝을 넣어 각 커밋이 항상 `type-check`를 통과하도록 했다(시즌 라벨 파생은 Task 4~7에서 이어서 처리).
- **ScoutLab 상수를 `app/(app)/scouting/_lib/`에 두는 안을 폐기**했다. `lib/services/sync/sync-players.ts`가 같은 값을 참조해야 하는데 `lib/ → app/` 임포트는 레이어 역전이다. `lib/constants/scoutlab.ts`를 단일 소스로 두고 화면 상수가 이를 재export하도록 바꿨다. 아울러 sync-players가 파생 시즌으로 ScoutLab 행을 쓰면 UI가 못 보는 26/27 행이 생기는 문제를 발견해, ScoutLab 쓰기만 `SCOUTLAB_ACTIVE_SEASON`에 고정하고 그 이유를 코드 주석에 남기도록 했다(전환은 SR04).
- **`getAllLeagueStandings`에서 대회별 최신 시즌이 서로 다를 때** 단일 `season` 필터로는 UCL 행이 사라진다는 점을 발견했다. 최신 시즌 Map을 먼저 구하고 `.in("season", seasons)`로 조회한 뒤 `(league_id, season)` 쌍으로 걸러내는 2단계 방식으로 수정했다.
- **`calculate-context`의 빈 DB 처리**를 보강했다. 전년 시즌이 없을 수 있으므로(26/27 첫 계산 시점) `prevSeason`이 `null`이면 비교 조회를 건너뛰도록 했다.

**3. 타입 일관성 확인**

`deriveSeasonLabel` / `deriveSeasonLabelFromMatches` / `CurrentGameweek` / `getFixturesByGameweek(gameweek, leagueId?, season?)` / `getLatestStandingSeasons` / `getStandingsByTeamIds(teamIds)` / `getAllLeagueStandings()` / `getLatestPlayerSeasonStats(playerId)` / `SCOUTLAB_ACTIVE_SEASON` — 정의 Task와 사용 Task 간 이름·인자·반환 타입이 모두 일치하는지 대조 완료. `Fixture.season`(필수 `string`)과 `CurrentGameweek.season`(`string | null`)의 차이는 의도된 것으로, 후자는 해당 리그 데이터가 아예 없을 때의 fallback을 표현한다.
