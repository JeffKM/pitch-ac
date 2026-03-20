// 팀 관련 타입 정의

/** 팀 기본 정보 */
export interface Team {
  id: number;
  name: string;
  /** 3자 약칭 (예: ARS, CHE) */
  shortName: string;
  logoUrl: string;
  /** 시즌 (예: "2024-25") */
  season: string;
}

/** 리그 순위표 항목 */
export interface TeamStanding {
  teamId: number;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  /** 최근 5경기 폼 (W/D/L) */
  form: Array<"W" | "D" | "L">;
}
