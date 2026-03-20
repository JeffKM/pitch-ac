// 라인업 피치 위 선수 도트 — 등번호 + 성(last name)

import type { LineupPlayer } from "@/types";

interface LineupPlayerDotProps {
  player: LineupPlayer;
}

function getLastName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1];
}

export function LineupPlayerDot({ player }: LineupPlayerDotProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* 등번호 원형 */}
      <div className="flex size-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white shadow">
        {player.number}
      </div>
      {/* 선수 성 */}
      <span className="max-w-[56px] truncate text-center text-[10px] font-medium text-white drop-shadow">
        {getLastName(player.playerName)}
      </span>
    </div>
  );
}
