// ScoutLab 선수 카드 헤더 — 이름, 팀, 포지션, 국적, 나이, 출전시간
import { Clock, Flag, MapPin, Shield, User } from "lucide-react";

import type { ScoutlabPlayer } from "@/types";

interface PlayerCardHeaderProps {
  player: ScoutlabPlayer;
}

export function PlayerCardHeader({ player }: PlayerCardHeaderProps) {
  return (
    <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-4">
      <div className="flex items-start gap-4">
        {/* 선수 아바타 플레이스홀더 */}
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-comic-cream">
          <User className="size-8 text-comic-black/30" />
        </div>

        <div className="min-w-0 flex-1">
          {/* 이름 */}
          <h2 className="truncate font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xl)] leading-[var(--comic-leading-tight)] tracking-[var(--comic-tracking-tight)] text-comic-black">
            {player.name}
          </h2>

          {/* 메타 정보 */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <MetaItem icon={Shield} label={player.team} />
            <MetaItem icon={MapPin} label={player.position} />
            {player.nationality && (
              <MetaItem icon={Flag} label={player.nationality} />
            )}
            {player.age !== null && (
              <MetaItem icon={User} label={`${player.age}세`} />
            )}
            <MetaItem
              icon={Clock}
              label={`${player.minutesPlayed.toLocaleString()}분`}
            />
          </div>

          {/* 리그 + 시즌 배지 */}
          <div className="mt-2 flex gap-2">
            <span className="rounded-full bg-comic-skyblue/10 px-2 py-0.5 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-skyblue">
              {player.league}
            </span>
            <span className="rounded-full bg-comic-cream px-2 py-0.5 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
              {player.season}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 메타 정보 아이템 */
function MetaItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/60">
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
