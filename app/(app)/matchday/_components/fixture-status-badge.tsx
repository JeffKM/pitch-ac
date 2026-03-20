// 경기 상태별 배지 (NS / LIVE / FT)

import { Badge } from "@/components/ui/badge";
import type { FixtureStatus } from "@/types";

import { LivePulse } from "./live-pulse";

interface FixtureStatusBadgeProps {
  status: FixtureStatus;
  minute: number | null;
  kickoffTime: string;
}

export function FixtureStatusBadge({
  status,
  minute,
  kickoffTime,
}: FixtureStatusBadgeProps) {
  if (status === "NS") {
    return <Badge variant="secondary">{kickoffTime}</Badge>;
  }

  if (status === "LIVE") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
      >
        <LivePulse />
        {minute}&apos;
      </Badge>
    );
  }

  // FT
  return <Badge variant="outline">FT</Badge>;
}
