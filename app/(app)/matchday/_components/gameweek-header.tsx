// 게임위크 네비게이션 헤더 (이전/다음 화살표 포함)

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const MIN_GW = 1;
const MAX_GW = 38;

interface GameweekHeaderProps {
  gameweek: number;
  dateRange: string;
}

export function GameweekHeader({ gameweek, dateRange }: GameweekHeaderProps) {
  const hasPrev = gameweek > MIN_GW;
  const hasNext = gameweek < MAX_GW;

  return (
    <div className="flex items-center justify-between">
      {hasPrev ? (
        <Button variant="ghost" size="icon" aria-label="이전 게임위크" asChild>
          <Link href={`/matchday?gw=${gameweek - 1}`}>
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
      ) : (
        <Button variant="ghost" size="icon" disabled aria-label="이전 게임위크">
          <ChevronLeft className="size-5" />
        </Button>
      )}

      <div className="text-center">
        <h1 className="text-2xl font-bold">Gameweek {gameweek}</h1>
        <p className="text-sm text-muted-foreground">{dateRange}</p>
      </div>

      {hasNext ? (
        <Button variant="ghost" size="icon" aria-label="다음 게임위크" asChild>
          <Link href={`/matchday?gw=${gameweek + 1}`}>
            <ChevronRight className="size-5" />
          </Link>
        </Button>
      ) : (
        <Button variant="ghost" size="icon" disabled aria-label="다음 게임위크">
          <ChevronRight className="size-5" />
        </Button>
      )}
    </div>
  );
}
