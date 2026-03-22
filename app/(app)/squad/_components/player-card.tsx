import Image from "next/image";
import Link from "next/link";

import { CartoonAvatar } from "@/components/cartoon/cartoon-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PlayerSeasonStats } from "@/types/player";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";

interface PlayerCardProps {
  player: Player;
  team: Team | undefined;
  seasonStats: PlayerSeasonStats | undefined;
  /** 카툰 에셋 등록 여부 */
  hasCartoonAsset?: boolean;
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

export function PlayerCard({
  player,
  team,
  seasonStats,
  hasCartoonAsset = false,
}: PlayerCardProps) {
  const primaryStat = getPrimaryStat(player.position, seasonStats);

  return (
    <Link href={`/squad/${player.id}`} className="block">
      <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white transition-colors hover:bg-comic-cream">
        <CardContent className="flex flex-col items-center gap-3 p-4">
          {hasCartoonAsset ? (
            <CartoonAvatar
              playerId={player.id}
              mood="neutral"
              hasAsset
              variant="thumb"
              playerName={player.name}
              className="size-20"
            />
          ) : (
            <Image
              src={player.photoUrl}
              alt={player.name}
              width={80}
              height={80}
              className="size-20 rounded-full object-cover"
              sizes="80px"
            />
          )}
          <div className="w-full text-center">
            <p className="truncate font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
              {player.name}
            </p>
            <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/60">
              {team?.shortName ?? player.teamId} · {player.position}
            </p>
          </div>
          {primaryStat && (
            <Badge
              variant="outline"
              className="shrink-0 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow font-[family-name:var(--font-bangers)] text-comic-black"
            >
              {primaryStat.label} {primaryStat.value}
              {primaryStat.rank > 0 && ` · 리그 ${primaryStat.rank}위`}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
