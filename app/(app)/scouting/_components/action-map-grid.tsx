// ScoutLab Action Maps — 원본 이미지 3등분 crop + 피치 라인 SVG 오버레이
// 이미지: 1460×747 RGBA, 3개 피치 가로 나란히 (LEFT=carries, MIDDLE=passes, RIGHT=crosses)
// 피치 경계 (좌측 섹션 기준, 픽셀): x=54~458, y=53~678, 섹션 너비=487
import type { ScoutlabActionMap, ScoutlabActionType } from "@/types";

import { PitchSvg } from "./pitch-svg";

interface ActionMapGridProps {
  actionMaps: ScoutlabActionMap[];
}

const ACTION_TYPE_LABELS: Record<ScoutlabActionType, string> = {
  carries: "Carries",
  passes: "Passes",
  crosses: "Crosses",
};

/** 각 타입의 이미지 위치 (CSS background-position percentage) */
const SECTION_POSITION: Record<ScoutlabActionType, string> = {
  carries: "0%",
  passes: "50%",
  crosses: "100%",
};

const ACTION_TYPES: ScoutlabActionType[] = ["carries", "passes", "crosses"];

/**
 * 피치 오버레이 위치 상수 (이미지 픽셀 분석 기반)
 *
 * 원본 이미지: 1460×747, 섹션 너비 = 487px
 * 피치 터치라인: x=54~458 (left~right), y=53~678 (top~bottom)
 *
 * 컨테이너 aspect-ratio: 68/96
 * → 컨테이너 높이 = W × 96/68 = 1.412W
 * → 표시 스케일 = W/487
 */
const PITCH_OVERLAY = {
  left: "11.09%", // 54/487
  top: "7.71%", // (53/487) / (96/68)
  width: "82.96%", // (458-54)/487
  height: "90.87%", // ((678-53)/487) / (96/68)
} as const;

export function ActionMapGrid({ actionMaps }: ActionMapGridProps) {
  const imageUrl = actionMaps.find((m) => m.imageUrl)?.imageUrl ?? null;

  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
      data-testid="action-map-grid"
    >
      {ACTION_TYPES.map((type) => {
        const mapData = actionMaps.find((m) => m.actionType === type);

        return (
          <div key={type} className="space-y-2">
            {/* 헤더: "Carries (165 | 6.9 P90)" 형식 */}
            <h4 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-lg)] text-comic-black">
              {ACTION_TYPE_LABELS[type]}
              {mapData && mapData.totalCount > 0 && (
                <span className="ml-1.5 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/50">
                  ({mapData.totalCount} | {mapData.per90.toFixed(1)} P90)
                </span>
              )}
            </h4>

            {/* 피치: 원본 이미지 + 검은 피치 라인 SVG 오버레이 */}
            <div className="overflow-hidden rounded-lg border border-comic-black/10">
              {imageUrl ? (
                <ActionMapImage imageUrl={imageUrl} actionType={type} />
              ) : (
                <PitchSvg vertical />
              )}
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

/** 원본 이미지 crop + 정렬된 피치 라인 SVG 오버레이 */
function ActionMapImage({
  imageUrl,
  actionType,
}: {
  imageUrl: string;
  actionType: ScoutlabActionType;
}) {
  return (
    <div
      className="relative overflow-hidden"
      // 68/96: 하단 범례(y≈700+) 완전 제거, 피치 하단(y=678)까지만 표시
      style={{ aspectRatio: "68 / 96" }}
    >
      {/* 원본 이미지 (배경) */}
      <div
        className="absolute inset-0 bg-top bg-no-repeat"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "300% auto",
          backgroundPosition: `${SECTION_POSITION[actionType]} top`,
        }}
      />
      {/* 검은 피치 라인 오버레이 — 원본 이미지 피치 좌표에 정확히 정렬 */}
      <div className="absolute" style={PITCH_OVERLAY}>
        <PitchSvg vertical overlay className="size-full" />
      </div>
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
