// ScoutLab Similarity — 유사 선수 20명 테이블
import { SearchX } from "lucide-react";
import { Suspense } from "react";

import {
  getDefaultScoutlabPlayer,
  getScoutlabPlayerById,
  getScoutlabSimilarity,
} from "@/lib/repositories/scoutlab-repository";

import { PlayerCardHeader } from "../_components/player-card-header";
import { ScoutlabFilterSection } from "../_components/scoutlab-filter-section";
import {
  PlayerCardHeaderSkeleton,
  ScoutlabFilterSectionSkeleton,
  ScoutlabPanelSkeleton,
} from "../_components/scoutlab-skeletons";
import { SimilarityTable } from "../_components/similarity-table";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function SimilarityPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-4">
      <h1 className="sr-only">ScoutLab Similarity</h1>
      <Suspense fallback={<ScoutlabFilterSectionSkeleton />}>
        <ScoutlabFilterSection searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<SimilaritySkeleton />}>
        <SimilarityContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** 선수 카드 + 유사 선수 테이블 — searchParams 의존 데이터 영역 */
async function SimilarityContent({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  const selectedPlayer = params.playerId
    ? await getScoutlabPlayerById(params.playerId)
    : await getDefaultScoutlabPlayer(params.season);

  if (!selectedPlayer) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <SearchX className="mx-auto size-10 text-comic-black/20" />
          <p className="mt-3 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/60">
            Player Card 탭에서 선수를 선택하세요.
          </p>
        </div>
      </div>
    );
  }

  const similarity = await getScoutlabSimilarity(
    selectedPlayer.id,
    params.season,
  );

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

/** Similarity 본문 fallback */
function SimilaritySkeleton() {
  return (
    <div className="space-y-4">
      <PlayerCardHeaderSkeleton />
      <ScoutlabPanelSkeleton bodyClassName="h-96" />
    </div>
  );
}
