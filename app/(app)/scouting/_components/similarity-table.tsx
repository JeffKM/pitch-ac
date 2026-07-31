// ScoutLab Similarity — 유사 선수 테이블 (20명 2열 그리드)
import { cn } from "@/lib/utils";
import type { ScoutlabSimilarPlayer } from "@/types";

interface SimilarityTableProps {
  similarPlayers: ScoutlabSimilarPlayer[];
}

export function SimilarityTable({ similarPlayers }: SimilarityTableProps) {
  if (similarPlayers.length === 0) {
    return (
      <p
        className="py-10 text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/60"
        data-testid="similarity-empty"
      >
        유사 선수 데이터 없음
      </p>
    );
  }

  // 2열로 분할 (앞 10개 / 뒤 10개)
  const midpoint = Math.ceil(similarPlayers.length / 2);
  const leftColumn = similarPlayers.slice(0, midpoint);
  const rightColumn = similarPlayers.slice(midpoint);

  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      data-testid="similarity-table"
    >
      <SimilarityColumn players={leftColumn} />
      <SimilarityColumn players={rightColumn} />
    </div>
  );
}

function SimilarityColumn({ players }: { players: ScoutlabSimilarPlayer[] }) {
  // 시각적으로는 div/grid 레이아웃을 유지하되, 스크린리더에는 테이블 구조로 노출
  return (
    <div
      role="table"
      aria-label="유사 선수 목록 — 순위, 선수, 팀, 리그, 유사도"
      className="space-y-1"
    >
      {/* 헤더 */}
      <div
        role="row"
        className="grid grid-cols-[2rem_1fr_5rem_4rem_3.5rem] gap-1 border-b border-comic-black/10 pb-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/60"
      >
        <span role="columnheader">#</span>
        <span role="columnheader">선수</span>
        <span role="columnheader">팀</span>
        <span role="columnheader">리그</span>
        <span role="columnheader" className="text-right">
          유사도
        </span>
      </div>

      {/* 행 */}
      {players.map((p) => (
        <div
          key={p.rank}
          role="row"
          className={cn(
            "grid grid-cols-[2rem_1fr_5rem_4rem_3.5rem] items-center gap-1 rounded px-1 py-1 text-xs",
            p.rank <= 3 && "bg-comic-yellow/10",
          )}
          data-testid={`similarity-row-${p.rank}`}
        >
          <span
            role="cell"
            className="font-[family-name:var(--font-bangers)] text-comic-black/60"
          >
            {p.rank}
          </span>
          <span role="cell" className="truncate font-medium text-comic-black">
            {p.name}
          </span>
          <span role="cell" className="truncate text-comic-black/60">
            {p.team}
          </span>
          <span role="cell" className="truncate text-comic-black/60">
            {p.league}
          </span>
          <span
            role="cell"
            className="text-right font-[family-name:var(--font-permanent-marker)] text-comic-skyblue-text tabular-nums"
          >
            {(p.score * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}
