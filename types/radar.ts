// 레이더 차트 타입 정의

/** 레이더 차트 6개 축 */
export type RadarDimension =
  | "pace"
  | "shooting"
  | "passing"
  | "dribbling"
  | "defending"
  | "physical";

/** 레이더 차트 단일 데이터 포인트 */
export interface RadarDataPoint {
  dimension: RadarDimension;
  /** 0~100 정규화 값 */
  value: number;
  /** 사용자에게 표시되는 레이블 (한국어) */
  label: string;
}

/** 레이더 차트 전체 데이터 */
export interface RadarData {
  /** 선수 자신의 데이터 */
  player: RadarDataPoint[];
  /** 같은 포지션 평균 */
  positionAverage: RadarDataPoint[];
  /** 상위 3개 강점 dimension */
  strengths: RadarDimension[];
  /** 하위 3개 약점 dimension */
  weaknesses: RadarDimension[];
}
