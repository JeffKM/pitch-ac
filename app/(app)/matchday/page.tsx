// 매치데이 대시보드 — 날짜 기반 5대 리그 경기 뷰

import type { Metadata } from "next";
import { Suspense } from "react";

import {
  formatFullDate,
  getTodayDateKey,
  isValidDateKey,
} from "@/lib/date-utils";
import {
  getFixturesByDate,
  getStandingsByTeamIds,
  getTeamsByIds,
} from "@/lib/repositories";

import { DateStrip } from "./_components/date-strip";
import { EmptyMatchday } from "./_components/empty-matchday";
import { FixtureCardSkeleton } from "./_components/fixture-card-skeleton";
import { MatchdayContent } from "./_components/matchday-content";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { date: dateParam } = await searchParams;
  const date =
    dateParam && isValidDateKey(dateParam) ? dateParam : getTodayDateKey();
  const dateLabel = formatFullDate(date);

  return {
    title: `${dateLabel} Matchday`,
    description: `${dateLabel} 5대 리그 경기 일정 및 결과`,
    openGraph: {
      title: `${dateLabel} Matchday | pitch-ac`,
      description: `${dateLabel} 5대 리그 경기 일정 및 결과`,
    },
  };
}

export default function MatchdayPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-8">
      {/* 시각적 타이틀 없는 페이지 — 헤딩 구조용 sr-only h1 */}
      <h1 className="sr-only">Matchday</h1>

      {/* 날짜 스트립 — searchParams만 필요하므로 경기 조회와 별도 경계로 분리 */}
      <Suspense fallback={<DateStripSkeleton />}>
        <MatchdayDateStrip searchParams={searchParams} />
      </Suspense>

      {/* 경기 목록 — DB 조회 의존 영역 */}
      <Suspense fallback={<FixtureListSkeleton />}>
        <MatchdayFixtures searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** searchParams의 date를 검증해 선택 날짜를 결정 (없으면 오늘 KST) */
async function resolveDate(searchParams: PageProps["searchParams"]) {
  const { date: dateParam } = await searchParams;
  return dateParam && isValidDateKey(dateParam) ? dateParam : getTodayDateKey();
}

/** 날짜 스트립 — 선택 날짜만 의존 */
async function MatchdayDateStrip({ searchParams }: PageProps) {
  const date = await resolveDate(searchParams);
  return <DateStrip selectedDate={date} />;
}

/** 경기 목록 — 픽스처/팀/순위 조회 의존 */
async function MatchdayFixtures({ searchParams }: PageProps) {
  const date = await resolveDate(searchParams);
  const fixtures = await getFixturesByDate(date);

  if (fixtures.length === 0) {
    return <EmptyMatchday date={date} />;
  }

  // 팀/순위 배치 조회 (중복 제거)
  const teamIds = [
    ...new Set(
      fixtures.flatMap((f) => [f.homeTeamId, f.awayTeamId]).filter(Boolean),
    ),
  ];

  const [teamsMap, standingsMap] = await Promise.all([
    getTeamsByIds(teamIds),
    getStandingsByTeamIds(teamIds),
  ]);

  const initialData = {
    fixtures,
    teams: Object.fromEntries(teamsMap),
    standings: Object.fromEntries(standingsMap),
    date,
    hasLive: fixtures.some((f) => f.status === "LIVE"),
  };

  return <MatchdayContent initialData={initialData} />;
}

/** 날짜 스트립 fallback */
function DateStripSkeleton() {
  return (
    <div className="flex items-center gap-1">
      <div className="size-8 shrink-0 animate-pulse rounded-md bg-comic-cream" />
      <div className="flex flex-1 gap-1 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-14 shrink-0 animate-pulse rounded-md bg-comic-cream"
          />
        ))}
      </div>
      <div className="size-8 shrink-0 animate-pulse rounded-md bg-comic-cream" />
    </div>
  );
}

/** 경기 목록 fallback — 리그 그룹 2개 × 카드 3장 */
function FixtureListSkeleton() {
  return (
    <div className="space-y-8">
      {[0, 1].map((groupIdx) => (
        <div key={groupIdx} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 animate-pulse rounded bg-comic-cream" />
            <div className="h-3 w-12 animate-pulse rounded bg-comic-cream" />
          </div>
          {[0, 1, 2].map((cardIdx) => (
            <FixtureCardSkeleton key={cardIdx} />
          ))}
        </div>
      ))}
    </div>
  );
}
