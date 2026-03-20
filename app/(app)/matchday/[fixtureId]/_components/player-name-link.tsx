// 선수 프로필 링크 래퍼

import Link from "next/link";

import { cn } from "@/lib/utils";

interface PlayerNameLinkProps {
  playerId: number;
  playerName: string;
  className?: string;
}

export function PlayerNameLink({
  playerId,
  playerName,
  className,
}: PlayerNameLinkProps) {
  return (
    <Link
      href={`/players/${playerId}`}
      className={cn("hover:text-primary hover:underline", className)}
    >
      {playerName}
    </Link>
  );
}
