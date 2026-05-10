// ScoutLab Similarity — 유사 선수 20명 테이블
import { SearchX } from "lucide-react";

import {
  getScoutlabPlayerById,
  getScoutlabSimilarity,
} from "@/lib/repositories/scoutlab-repository";

import { PlayerCardHeader } from "../_components/player-card-header";
import { SimilarityTable } from "../_components/similarity-table";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SimilarityPage({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  const [selectedPlayer, similarity] = await Promise.all([
    params.playerId ? getScoutlabPlayerById(params.playerId) : null,
    params.playerId
      ? getScoutlabSimilarity(params.playerId, params.season)
      : null,
  ]);

  if (!selectedPlayer) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <SearchX className="mx-auto size-10 text-comic-black/20" />
          <p className="mt-3 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/50">
            Player Card 탭에서 선수를 선택하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PlayerCardHeader player={selectedPlayer} />

      <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
        <h3 className="mb-4 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
          Similar Players
        </h3>
        <SimilarityTable similarPlayers={similarity?.similarPlayers ?? []} />
      </div>
    </div>
  );
}
