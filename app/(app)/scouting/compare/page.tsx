// ScoutLab Compare — 두 선수 메트릭 비교
import { GitCompareArrows, SearchX } from "lucide-react";

import {
  getScoutlabMetrics,
  getScoutlabPlayerById,
  getScoutlabRadar,
  searchScoutlabPlayers,
} from "@/lib/repositories/scoutlab-repository";

import { MetricCompareTable } from "../_components/metric-compare-table";
import { PlayerCardHeader } from "../_components/player-card-header";
import { DynamicRadarChart } from "../_components/scoutlab-charts";
import { ScoutlabCompareSearch } from "../_components/scoutlab-compare-search";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ScoutingComparePage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const params = parseScoutlabParams(raw);

  // compareId 파싱
  const compareIdStr = Array.isArray(raw.compareId)
    ? raw.compareId[0]
    : raw.compareId;
  const compareId = compareIdStr ? parseInt(compareIdStr, 10) : null;

  // 선수 목록 + 두 선수 데이터 병렬 조회
  const [players, playerA, playerB] = await Promise.all([
    searchScoutlabPlayers({ season: params.season }),
    params.playerId ? getScoutlabPlayerById(params.playerId) : null,
    compareId && !isNaN(compareId) ? getScoutlabPlayerById(compareId) : null,
  ]);

  // 두 선수 모두 선택 시 메트릭 + 레이더 조회
  const [metricsA, metricsB, radarA, radarB] = await Promise.all([
    playerA
      ? getScoutlabMetrics(
          playerA.id,
          params.season,
          params.mode,
          params.adjustment,
        )
      : null,
    playerB
      ? getScoutlabMetrics(
          playerB.id,
          params.season,
          params.mode,
          params.adjustment,
        )
      : null,
    playerA ? getScoutlabRadar(playerA.id, params.season) : null,
    playerB ? getScoutlabRadar(playerB.id, params.season) : null,
  ]);

  // 비교 대상 미선택 시
  if (!playerA) {
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
      {/* 두 선수 헤더 나란히 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr]">
        <PlayerCardHeader player={playerA} />

        <div className="flex items-center justify-center">
          <GitCompareArrows className="size-6 text-comic-black/30" />
        </div>

        {playerB ? (
          <PlayerCardHeader player={playerB} />
        ) : (
          <div className="flex items-center justify-center rounded-[var(--comic-panel-radius)] border-dashed border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-4">
            <div className="space-y-2 text-center">
              <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/50">
                비교 선수를 선택하세요
              </p>
              <ScoutlabCompareSearch players={players} />
            </div>
          </div>
        )}
      </div>

      {/* 비교 선수 검색 (이미 선택된 경우) */}
      {playerB && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-comic-black/50">비교 대상 변경:</span>
          <ScoutlabCompareSearch players={players} />
        </div>
      )}

      {/* 레이더 차트 오버레이 */}
      {playerA && radarA && (
        <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
          <h3 className="mb-2 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
            Radar Comparison
          </h3>
          <DynamicRadarChart
            axes={radarA.axes}
            playerName={playerA.name}
            compareAxes={radarB?.axes}
            compareName={playerB?.name}
          />
          {/* 범례 */}
          <div className="mt-2 flex justify-center gap-6 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full bg-comic-skyblue" />
              {playerA.name}
            </span>
            {playerB && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-full bg-comic-pink" />
                {playerB.name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 메트릭 비교 테이블 */}
      {metricsA && metricsB && playerB && (
        <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
          <h3 className="mb-4 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
            Metric Comparison
          </h3>
          <MetricCompareTable
            metricsA={metricsA}
            metricsB={metricsB}
            playerAName={playerA.name}
            playerBName={playerB.name}
          />
        </div>
      )}
    </div>
  );
}
