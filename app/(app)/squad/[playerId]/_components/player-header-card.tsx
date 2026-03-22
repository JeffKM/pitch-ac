// 선수 프로필 헤더 카드 — 사진, 이름, 클럽, 포지션, 등번호, 국적, 카툰 캐릭터

import Image from "next/image";

import { CartoonAvatar } from "@/components/cartoon/cartoon-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Player, PlayerSeasonStats, Team } from "@/types";

interface PlayerHeaderCardProps {
  player: Player;
  team: Team;
  seasonStats?: PlayerSeasonStats;
  /** 카툰 에셋 등록 여부 */
  hasCartoonAsset?: boolean;
}

const POSITION_LABELS: Record<string, string> = {
  GK: "GK",
  DEF: "DEF",
  MID: "MID",
  FWD: "FWD",
};

export function PlayerHeaderCard({
  player,
  team,
  seasonStats,
  hasCartoonAsset = false,
}: PlayerHeaderCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* 선수 사진 / 카툰 아바타 */}
          {hasCartoonAsset ? (
            <CartoonAvatar
              playerId={player.id}
              mood="neutral"
              hasAsset
              variant="full"
              playerName={player.name}
              className="h-36 w-auto shrink-0"
            />
          ) : (
            <div className="relative size-28 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
              <Image
                src={player.photoUrl}
                alt={player.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          )}

          {/* 선수 정보 */}
          <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
            {/* 이름 */}
            <h1 className="text-2xl leading-tight font-bold sm:text-3xl">
              {player.name}
            </h1>

            {/* 클럽 + 국적 */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="relative size-5 shrink-0">
                  <Image
                    src={team.logoUrl}
                    alt={team.name}
                    fill
                    className="object-contain"
                    sizes="20px"
                  />
                </div>
                <span>{team.name}</span>
              </div>
              <span className="text-border">·</span>
              <span>{player.nationality}</span>
            </div>

            {/* 배지 */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">#{player.number}</Badge>
              <Badge variant="outline">
                {POSITION_LABELS[player.position] ?? player.position}
              </Badge>
            </div>

            {/* 평균 평점 (시즌 스탯이 있는 경우) */}
            {seasonStats && (
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums">
                  {seasonStats.averageRating.toFixed(1)}
                </span>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium">평균 평점</p>
                  {seasonStats.averageRatingContext.rank > 0 && (
                    <p className="text-xs text-muted-foreground">
                      리그 {seasonStats.averageRatingContext.rank}위 · 상위{" "}
                      {100 - seasonStats.averageRatingContext.percentile + 1}%
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
