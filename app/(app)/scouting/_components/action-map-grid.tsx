// ScoutLab Action Maps — 원본 이미지 3등분 crop + 피치 라인 SVG 오버레이
// 이미지: 1460×747 RGBA, 3개 피치 가로 나란히 (LEFT=carries, MIDDLE=passes, RIGHT=crosses)
// 텍스트 헤더 ("Carries (19 | 2.0 P90)")는 이미지 상단에 포함됨
// 피치 경계 (좌측 섹션 기준, 픽셀): x=54~458, y=53~678, 섹션 너비=487
import type { ScoutlabActionMap, ScoutlabActionType } from "@/types";

import { PitchSvg } from "./pitch-svg";

interface ActionMapGridProps {
  actionMaps: ScoutlabActionMap[];
}

/** 각 타입의 이미지 위치 (CSS background-position percentage) */
const SECTION_POSITION: Record<ScoutlabActionType, string> = {
  carries: "0%",
  passes: "50%",
  crosses: "100%",
};

const ACTION_TYPES: ScoutlabActionType[] = ["carries", "passes", "crosses"];

const ACTION_TYPE_LABELS: Record<ScoutlabActionType, string> = {
  carries: "Carries",
  passes: "Passes",
  crosses: "Crosses",
};

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
    <div className="space-y-3" data-testid="action-map-grid">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ACTION_TYPES.map((type) => {
          const mapData = actionMaps.find((m) => m.actionType === type);
          return (
            <div key={type} className="space-y-2">
              {/* 상단 텍스트 헤더 (스탯은 이미지 텍스트에서 추출하여 DB 저장) */}
              <h4 className="font-heading text-sm font-bold tracking-wide uppercase">
                {ACTION_TYPE_LABELS[type]}
                {mapData && mapData.totalCount > 0 && (
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    ({mapData.totalCount} | {mapData.per90} P90)
                  </span>
                )}
              </h4>
              {/* 이미지 카드 */}
              <div className="overflow-hidden rounded-lg border border-comic-black/10">
                {imageUrl ? (
                  <ActionMapImage imageUrl={imageUrl} actionType={type} />
                ) : (
                  <PitchSvg vertical />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* 하단 공유 범례 — 원본 ScoutLab 범례와 동일 */}
      <ActionMapLegend />
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
      // 상단 텍스트 헤더("Carries (19 | 2.0 P90)")는 포함
      style={{ aspectRatio: "68 / 96" }}
    >
      {/* 원본 이미지 (배경) — 텍스트 헤더 + 피치 + 액션 라인 포함 */}
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

/** 공유 범례 — 원본 ScoutLab 범례와 동일한 구성
 * Start → End | Low xT ● ● ● ● High xT | ● Progressive ● xT > 0.02
 */
function ActionMapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-comic-black/10 pt-3 text-[11px] text-muted-foreground">
      {/* Start → End 그라데이션 라인 */}
      <span className="flex items-center gap-1.5">
        <span className="text-muted-foreground/70">Start</span>
        <svg width="40" height="6" className="shrink-0">
          <defs>
            <linearGradient id="line-grad">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#e91e8c" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="3"
            x2="34"
            y2="3"
            stroke="url(#line-grad)"
            strokeWidth="2"
          />
          <circle cx="37" cy="3" r="2.5" fill="#e91e8c" />
        </svg>
        <span className="text-muted-foreground/70">End</span>
      </span>

      {/* Low xT → High xT 원 크기 */}
      <span className="flex items-center gap-1.5">
        <span className="text-muted-foreground/70">Low xT</span>
        {[3, 4.5, 6, 8].map((size) => (
          <span
            key={size}
            className="inline-block shrink-0 rounded-full bg-muted-foreground/30"
            style={{ width: size, height: size }}
          />
        ))}
        <span className="text-muted-foreground/70">High xT</span>
      </span>

      {/* Progressive (핑크) */}
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block size-2.5 rounded-full"
          style={{ backgroundColor: "#e91e8c" }}
        />
        Progressive
      </span>

      {/* xT > 0.02 (시안) */}
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block size-2.5 rounded-full"
          style={{ backgroundColor: "#22d3ee" }}
        />
        xT &gt; 0.02
      </span>
    </div>
  );
}
