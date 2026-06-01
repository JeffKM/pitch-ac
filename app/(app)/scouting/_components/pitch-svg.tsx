// ScoutLab 피치 SVG 배경 — 105×68m 비율 축구 필드
// vertical: 세로 방향 (공격 골대 상단, 수비 골대 하단) — matrix transform으로 90° 회전
// overlay: 배경 없이 검은 피치 라인만 표시 (이미지 위에 겹쳐 쓸 때)
interface PitchSvgProps {
  children?: React.ReactNode;
  className?: string;
  vertical?: boolean;
  /** 투명 배경 + 진한 검은 라인 (이미지 오버레이용) */
  overlay?: boolean;
}

export function PitchSvg({
  children,
  className,
  vertical,
  overlay,
}: PitchSvgProps) {
  const vb = vertical ? "0 0 68 105" : "0 0 105 68";
  const strokeOpacity = overlay ? 0.5 : 0.3;
  const strokeWidth = overlay ? 0.6 : 0.5;

  const content = (
    <>
      {/* 피치 배경 (overlay 모드에서는 숨김) */}
      {!overlay && (
        <rect
          width="105"
          height="68"
          fill="var(--color-comic-green)"
          fillOpacity={0.12}
          rx={1}
        />
      )}

      {/* 외곽선 */}
      <rect
        x="0.5"
        y="0.5"
        width="104"
        height="67"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      />

      {/* 센터라인 */}
      <line
        x1="52.5"
        y1="0.5"
        x2="52.5"
        y2="67.5"
        stroke="var(--color-comic-black)"
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      />

      {/* 센터 서클 */}
      <circle
        cx="52.5"
        cy="34"
        r="9.15"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      />

      {/* 좌측 페널티 박스 */}
      <rect
        x="0.5"
        y="13.85"
        width="16.5"
        height="40.3"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      />

      {/* 좌측 골 에어리어 */}
      <rect
        x="0.5"
        y="24.85"
        width="5.5"
        height="18.3"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      />

      {/* 우측 페널티 박스 */}
      <rect
        x="88"
        y="13.85"
        width="16.5"
        height="40.3"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      />

      {/* 우측 골 에어리어 */}
      <rect
        x="99"
        y="24.85"
        width="5.5"
        height="18.3"
        fill="none"
        stroke="var(--color-comic-black)"
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      />

      {/* 오버레이 (액션 라인 등) */}
      {children}
    </>
  );

  return (
    <svg
      viewBox={vb}
      className={className}
      data-testid="pitch-svg"
      // overlay: 이미지 위에 겹칠 때 컨테이너에 맞게 스트레칭 (정확한 위치 정렬)
      preserveAspectRatio={overlay ? "none" : "xMidYMid meet"}
    >
      {vertical ? (
        <g transform="matrix(0, -1, 1, 0, 0, 105)">{content}</g>
      ) : (
        content
      )}
    </svg>
  );
}
