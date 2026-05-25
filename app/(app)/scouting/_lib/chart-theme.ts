// ScoutLab recharts 차트 공통 코믹 테마 상수
// 3개 차트(Radar, Scatter, Progression)가 공유하는 스타일 객체

/** 코믹 폰트 fontFamily 문자열 */
export const COMIC_FONTS = {
  /** Bangers — 카테고리명, 제목 등 임팩트 텍스트 */
  heading: "var(--font-bangers), cursive",
  /** Permanent Marker — 본문, 툴팁 텍스트 */
  body: "var(--font-permanent-marker), cursive",
  /** Fredoka — 숫자, 축 값 등 가독성 필요 텍스트 */
  ui: "var(--font-fredoka), sans-serif",
} as const;

/** 코믹 색상 CSS 변수 참조 문자열 */
export const COMIC_COLORS = {
  skyblue: "var(--color-comic-skyblue)",
  green: "var(--color-comic-green)",
  yellow: "var(--color-comic-yellow)",
  red: "var(--color-comic-red)",
  pink: "var(--color-comic-pink)",
  black: "var(--color-comic-black)",
  cream: "var(--color-comic-cream)",
  white: "var(--color-comic-white)",
} as const;

/** recharts tick에 spread할 공통 스타일 */
export const COMIC_TICK_STYLE = {
  fontSize: 11,
  fill: COMIC_COLORS.black,
  fontFamily: COMIC_FONTS.ui,
} as const;

/** recharts axis label에 spread할 공통 스타일 */
export const COMIC_AXIS_LABEL_STYLE = {
  fontSize: 12,
  fill: COMIC_COLORS.black,
  fontFamily: COMIC_FONTS.body,
} as const;

/** CartesianGrid에 spread할 공통 props */
export const COMIC_GRID_PROPS = {
  strokeDasharray: "4 4",
  stroke: COMIC_COLORS.black,
  strokeOpacity: 0.12,
} as const;

/** 코믹 보더 두께/반경 숫자 상수 */
export const COMIC_BORDER = {
  width: 3,
  thin: 2,
  radius: 4,
} as const;
