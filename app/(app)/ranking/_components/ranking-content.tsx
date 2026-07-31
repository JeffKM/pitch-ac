"use client";

import { useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ALL_COMPETITIONS,
  type CompetitionSlug,
  toShortSeasonLabel,
} from "@/lib/constants/football";
import type { Team, TeamStanding } from "@/types";

import { StandingsTable } from "./standings-table";

type RankingContentProps = {
  standingsRecord: Record<number, TeamStanding[]>;
  teamRecord: Record<number, Team>;
  /** 대회별 최신 시즌 라벨 ("2026/2027") — 데이터 없으면 키 부재 */
  seasonRecord: Record<number, string>;
};

/** 시즌 배지 — 탭마다 어느 시즌 순위표인지 표시 (UCL 롤오버 시차 대응) */
function SeasonBadge({ season }: { season: string }) {
  return (
    <span className="inline-flex items-center rounded-full border-[var(--comic-border-width)] border-comic-black bg-comic-yellow px-3 py-0.5 font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-sm)] tracking-[var(--comic-tracking-normal)] text-comic-black">
      {toShortSeasonLabel(season)} Season
    </span>
  );
}

/** 유효한 slug인지 확인 */
const VALID_SLUGS = new Set<string>(ALL_COMPETITIONS.map((c) => c.slug));

export function RankingContent({
  standingsRecord,
  teamRecord,
  seasonRecord,
}: RankingContentProps) {
  const searchParams = useSearchParams();
  const leagueParam = searchParams.get("league");
  const defaultTab: CompetitionSlug =
    leagueParam && VALID_SLUGS.has(leagueParam)
      ? (leagueParam as CompetitionSlug)
      : "epl";

  return (
    <Tabs defaultValue={defaultTab} key={defaultTab}>
      <TabsList className="w-full justify-start rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream">
        {ALL_COMPETITIONS.map((league) => (
          <TabsTrigger
            key={league.slug}
            value={league.slug}
            className="font-[family-name:var(--font-bangers)] tracking-[var(--comic-tracking-normal)] data-[state=active]:bg-comic-yellow data-[state=active]:text-comic-black"
          >
            {league.shortName}
          </TabsTrigger>
        ))}
      </TabsList>

      {ALL_COMPETITIONS.map((league) => {
        const standings = standingsRecord[league.id] ?? [];
        const season = seasonRecord[league.id];
        // 개막 전: 순위표 행은 있지만 전 팀 0경기 → 의미 없는 0값 표 대신 안내
        const isPreSeason =
          standings.length > 0 && standings.every((s) => s.played === 0);

        return (
          <TabsContent key={league.slug} value={league.slug} className="mt-4">
            {season && (
              <div className="mb-3 flex justify-end">
                <SeasonBadge season={season} />
              </div>
            )}
            {standings.length > 0 && !isPreSeason ? (
              <StandingsTable
                standings={standings}
                teamRecord={teamRecord}
                leagueId={league.id}
              />
            ) : isPreSeason ? (
              <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream">
                <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
                    {league.shortName} — Kicks Off Soon!
                  </p>
                  <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/60">
                    {standings.length} teams ready — standings appear after the
                    opening round
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream">
                <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
                    {league.shortName} — No Data
                  </p>
                  <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/60">
                    Standings will be available after sync
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
