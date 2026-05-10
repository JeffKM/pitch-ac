// ScoutLab 피치 SVG 배경 — 105×68m 비율 축구 필드
interface PitchSvgProps {
  children?: React.ReactNode;
  className?: string;
}

export function PitchSvg({ children, className }: PitchSvgProps) {
  return (
    <svg
      viewBox="0 0 105 68"
      className={className}
      data-testid="pitch-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* 피치 배경 */}
      <rect
        width="105"
        height="68"
        fill="var(--color-comic-green)"
        fillOpacity={0.12}
        rx={1}
      />

      {/* 외곽선 */}
      <rect
        x="0.5"
        y="0.5"
        width="104"
        height="67"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={0.3}
        strokeWidth={0.5}
      />

      {/* 센터라인 */}
      <line
        x1="52.5"
        y1="0.5"
        x2="52.5"
        y2="67.5"
        stroke="var(--color-comic-black)"
        strokeOpacity={0.3}
        strokeWidth={0.5}
      />

      {/* 센터 서클 */}
      <circle
        cx="52.5"
        cy="34"
        r="9.15"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={0.3}
        strokeWidth={0.5}
      />

      {/* 좌측 페널티 박스 */}
      <rect
        x="0.5"
        y="13.85"
        width="16.5"
        height="40.3"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={0.3}
        strokeWidth={0.5}
      />

      {/* 좌측 골 에어리어 */}
      <rect
        x="0.5"
        y="24.85"
        width="5.5"
        height="18.3"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={0.3}
        strokeWidth={0.5}
      />

      {/* 우측 페널티 박스 */}
      <rect
        x="88"
        y="13.85"
        width="16.5"
        height="40.3"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={0.3}
        strokeWidth={0.5}
      />

      {/* 우측 골 에어리어 */}
      <rect
        x="99"
        y="24.85"
        width="5.5"
        height="18.3"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={0.3}
        strokeWidth={0.5}
      />

      {/* 오버레이 (액션 라인 등) */}
      {children}
    </svg>
  );
}
