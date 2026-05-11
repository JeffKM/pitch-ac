// 매치데이 대시보드 — 날짜 기반 5대 리그 경기 뷰

import type { Metadata } from "next";

import { CURRENT_SEASON_LABEL } from "@/lib/constants/football";
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

export default async function MatchdayPage({ searchParams }: PageProps) {
  const { date: dateParam } = await searchParams;

  // date 파라미터 검증, 없거나 유효하지 않으면 오늘 KST
  const date =
    dateParam && isValidDateKey(dateParam) ? dateParam : getTodayDateKey();

  const fixtures = await getFixturesByDate(date);

  // 팀/순위 배치 조회 (중복 제거)
  const teamIds = [
    ...new Set(
      fixtures.flatMap((f) => [f.homeTeamId, f.awayTeamId]).filter(Boolean),
    ),
  ];

  const [teamsMap, standingsMap] = await Promise.all([
    getTeamsByIds(teamIds),
    getStandingsByTeamIds(teamIds, CURRENT_SEASON_LABEL),
  ]);

  const initialData = {
    fixtures,
    teams: Object.fromEntries(teamsMap),
    standings: Object.fromEntries(standingsMap),
    date,
    hasLive: fixtures.some((f) => f.status === "LIVE"),
  };

  return (
    <div className="space-y-8">
      <DateStrip selectedDate={date} />

      {fixtures.length === 0 ? (
        <EmptyMatchday date={date} />
      ) : (
        <MatchdayContent initialData={initialData} />
      )}
    </div>
  );
}
