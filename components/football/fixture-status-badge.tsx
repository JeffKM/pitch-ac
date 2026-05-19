// 경기 상태별 배지 (NS / FT / POSTP)

import { Badge } from "@/components/ui/badge";
import type { FixtureStatus } from "@/types";

interface FixtureStatusBadgeProps {
  status: FixtureStatus;
  kickoffTime: string;
}

export function FixtureStatusBadge({
  status,
  kickoffTime,
}: FixtureStatusBadgeProps) {
  if (status === "POSTP") {
    return (
      <Badge
        variant="outline"
        className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-red bg-comic-red/10 font-[family-name:var(--font-bangers)] text-comic-red"
      >
        POSTPONED
      </Badge>
    );
  }

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
        className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-green bg-comic-green/20 font-[family-name:var(--font-bangers)] text-comic-black"
      >
        LIVE
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
