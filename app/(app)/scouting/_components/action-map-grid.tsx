// ScoutLab Action Maps — 3개 피치 그리드 래퍼
import type { ScoutlabActionMap, ScoutlabActionType } from "@/types";

import { ActionMapOverlay } from "./action-map-overlay";
import { PitchSvg } from "./pitch-svg";

interface ActionMapGridProps {
  actionMaps: ScoutlabActionMap[];
}

const ACTION_TYPE_LABELS: Record<ScoutlabActionType, string> = {
  carries: "Carries",
  passes: "Passes",
  crosses: "Crosses",
};

const ACTION_TYPES: ScoutlabActionType[] = ["carries", "passes", "crosses"];

export function ActionMapGrid({ actionMaps }: ActionMapGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
      data-testid="action-map-grid"
    >
      {ACTION_TYPES.map((type) => {
        const mapData = actionMaps.find((m) => m.actionType === type);

        return (
          <div key={type} className="space-y-2">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <h4 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-lg)] text-comic-black">
                {ACTION_TYPE_LABELS[type]}
              </h4>
              {mapData && (
                <span className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
                  {mapData.totalCount}개 ({mapData.per90.toFixed(1)}/90)
                </span>
              )}
            </div>

            {/* 피치 + 오버레이 */}
            <div className="overflow-hidden rounded-lg border border-comic-black/10">
              <PitchSvg>
                {mapData && <ActionMapOverlay lines={mapData.lines} />}
              </PitchSvg>
            </div>

            {/* 범례 */}
            <div className="flex gap-3">
              <LegendItem color="bg-comic-pink" label="Progressive" />
              <LegendItem color="bg-comic-skyblue" label="Threatening" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/60">
      <span className={`inline-block size-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
