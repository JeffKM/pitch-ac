import Image from "next/image";
import Link from "next/link";

import { CartoonAvatar } from "@/components/cartoon/cartoon-avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";

interface PlayerCardProps {
  player: Player;
  team: Team | undefined;
  /** 카툰 에셋 등록 여부 */
  hasCartoonAsset?: boolean;
}

export function PlayerCard({
  player,
  team,
  hasCartoonAsset = false,
}: PlayerCardProps) {
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
        </CardContent>
      </Card>
    </Link>
  );
}
