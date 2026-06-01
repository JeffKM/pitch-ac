// ScoutLab 피치 위 올챙이(tadpole) 형태 액션 오버레이
"use client";

import type { ScoutlabActionLine } from "@/types";

interface ActionMapOverlayProps {
  lines: ScoutlabActionLine[];
}

/** xT 값 → 원 반지름 (피치 좌표 기준) */
function xtToRadius(xt?: number): number {
  if (!xt || xt <= 0) return 0.6;
  // 0.01 → 0.6, 0.025 → 1.0, 0.05 → 1.5
  return Math.min(0.4 + xt * 22, 2.0);
}

/** 테이퍼 라인의 path 생성 (시작 굵고 끝 가늘어짐) */
function taperPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  startWidth: number,
  endWidth: number,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return "";

  // 라인에 수직인 단위 벡터
  const nx = -dy / len;
  const ny = dx / len;

  const halfStart = startWidth / 2;
  const halfEnd = endWidth / 2;

  // 사각형의 4 꼭짓점 (시작쪽 넓고, 끝쪽 좁음)
  const p1x = x1 + nx * halfStart;
  const p1y = y1 + ny * halfStart;
  const p2x = x1 - nx * halfStart;
  const p2y = y1 - ny * halfStart;
  const p3x = x2 - nx * halfEnd;
  const p3y = y2 - ny * halfEnd;
  const p4x = x2 + nx * halfEnd;
  const p4y = y2 + ny * halfEnd;

  return `M${p1x},${p1y} L${p4x},${p4y} L${p3x},${p3y} L${p2x},${p2y} Z`;
}

export function ActionMapOverlay({ lines }: ActionMapOverlayProps) {
  return (
    <g data-testid="action-map-overlay">
      {lines.map((line, i) => {
        // progressive=핑크, threatening=민트, 기본=회색
        const color = line.threatening
          ? "var(--color-comic-skyblue)"
          : line.progressive
            ? "var(--color-comic-pink)"
            : "var(--color-comic-black)";
        const opacity = line.threatening || line.progressive ? 0.7 : 0.25;
        const radius = xtToRadius(line.xt);
        const hasXt = line.xt != null && line.xt > 0;

        // 테이퍼 라인 path
        const path = taperPath(
          line.x1,
          line.y1,
          line.x2,
          line.y2,
          hasXt ? 0.6 : 0.4,
          0.1,
        );

        return (
          <g key={i} opacity={opacity}>
            {/* 테이퍼 라인 (시작 굵고 끝 가늘어짐) */}
            {path ? (
              <path d={path} fill={color} />
            ) : (
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={color}
                strokeWidth={0.4}
                strokeLinecap="round"
              />
            )}

            {/* 시작점 원 (xT 크기 반영) */}
            <circle
              cx={line.x1}
              cy={line.y1}
              r={radius}
              fill={color}
              fillOpacity={0.4}
              stroke={color}
              strokeWidth={0.15}
              strokeOpacity={0.6}
            />
          </g>
        );
      })}
    </g>
  );
}
