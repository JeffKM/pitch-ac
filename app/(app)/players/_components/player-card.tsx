import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PlayerSeasonStats } from "@/types/player";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";

interface PlayerCardProps {
  player: Player;
  team: Team | undefined;
  seasonStats: PlayerSeasonStats | undefined;
}

/** 포지션별 대표 스탯 선택 */
function getPrimaryStat(
  position: Player["position"],
  stats: PlayerSeasonStats | undefined,
): { label: string; value: number | string; rank: number } | null {
  if (!stats) return null;
  switch (position) {
    case "FWD":
      return {
        label: "골",
        value: stats.goals,
        rank: stats.goalsContext.rank,
      };
    case "MID":
      return {
        label: "어시스트",
        value: stats.assists,
        rank: stats.assistsContext.rank,
      };
    case "DEF":
    case "GK":
      return {
        label: "평점",
        value: stats.averageRating.toFixed(1),
        rank: stats.averageRatingContext.rank,
      };
  }
}

export function PlayerCard({ player, team, seasonStats }: PlayerCardProps) {
  const primaryStat = getPrimaryStat(player.position, seasonStats);

  return (
    <Link href={`/players/${player.id}`} className="block">
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex flex-col items-center gap-3 p-4">
          <Image
            src={player.photoUrl}
            alt={player.name}
            width={80}
            height={80}
            className="size-20 rounded-full object-cover"
            unoptimized
          />
          <div className="w-full text-center">
            <p className="truncate font-semibold">{player.name}</p>
            <p className="text-sm text-muted-foreground">
              {team?.shortName ?? player.teamId} · {player.position}
            </p>
          </div>
          {primaryStat && (
            <Badge variant="secondary" className="shrink-0">
              {primaryStat.label} {primaryStat.value} · 리그 {primaryStat.rank}
              위
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
