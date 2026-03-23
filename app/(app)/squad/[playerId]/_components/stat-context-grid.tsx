// 맥락 스탯 카드 그리드 — 7개 핵심 수치

import type { PlayerSeasonStats } from "@/types";

import { StatContextCard } from "./stat-context-card";

interface StatContextGridProps {
  seasonStats: PlayerSeasonStats;
}

const STAT_DEFINITIONS = [
  {
    key: "goals" as const,
    label: "Goals",
    contextKey: "goalsContext" as const,
    glossaryId: "goal",
  },
  {
    key: "assists" as const,
    label: "Assists",
    contextKey: "assistsContext" as const,
  },
  {
    key: "xg" as const,
    label: "xG",
    contextKey: "xgContext" as const,
    glossaryId: "xg",
    format: (v: number) => v.toFixed(1),
  },
  {
    key: "xa" as const,
    label: "xA",
    contextKey: "xaContext" as const,
    glossaryId: "xa",
    format: (v: number) => v.toFixed(1),
  },
  {
    key: "keyPasses" as const,
    label: "Key Passes",
    contextKey: "keyPassesContext" as const,
    glossaryId: "key-pass",
  },
  {
    key: "dribbles" as const,
    label: "Dribbles",
    contextKey: "dribblesContext" as const,
    glossaryId: "dribble",
  },
  {
    key: "averageRating" as const,
    label: "Avg. Rating",
    contextKey: "averageRatingContext" as const,
    glossaryId: "average-rating",
    format: (v: number) => v.toFixed(1),
  },
] as const;

export function StatContextGrid({ seasonStats }: StatContextGridProps) {
  return (
    <div>
      <h2 className="mb-3 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-base)] tracking-[var(--comic-tracking-wide)] text-comic-black">
        Season Stats ({seasonStats.season})
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {STAT_DEFINITIONS.map((def) => (
          <StatContextCard
            key={def.key}
            label={def.label}
            value={seasonStats[def.key]}
            format={"format" in def ? def.format : undefined}
            context={seasonStats[def.contextKey]}
            glossaryId={"glossaryId" in def ? def.glossaryId : undefined}
          />
        ))}
      </div>
    </div>
  );
}
