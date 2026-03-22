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
    return (
      <Badge
        variant="outline"
        className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream font-[family-name:var(--font-permanent-marker)]"
      >
        {kickoffTime}
      </Badge>
    );
  }

  if (status === "LIVE") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-green bg-comic-green/20 font-[family-name:var(--font-bangers)] text-comic-black"
      >
        <LivePulse />
        {minute}&apos;
      </Badge>
    );
  }

  // FT
  return (
    <Badge
      variant="outline"
      className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow font-[family-name:var(--font-bangers)] text-comic-black"
    >
      FT
    </Badge>
  );
}
