// ScoutLab 피치 위 액션 라인 오버레이
import type { ScoutlabActionLine } from "@/types";

interface ActionMapOverlayProps {
  lines: ScoutlabActionLine[];
}

export function ActionMapOverlay({ lines }: ActionMapOverlayProps) {
  return (
    <g data-testid="action-map-overlay">
      {lines.map((line, i) => {
        // progressive=핑크, threatening=사이안, 기본=회색
        const color = line.threatening
          ? "var(--color-comic-skyblue)"
          : line.progressive
            ? "var(--color-comic-pink)"
            : "var(--color-comic-black)";
        const opacity = line.threatening || line.progressive ? 0.7 : 0.25;

        return (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={color}
            strokeWidth={0.4}
            strokeOpacity={opacity}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}
