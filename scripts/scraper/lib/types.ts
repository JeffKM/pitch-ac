// 스크래퍼 내부 타입 정의

/** CLI 옵션 */
export interface ScraperOptions {
  season: string;
  league: string;
  team?: string;
  player?: string;
  headless: boolean;
  dryRun: boolean;
  delay: number;
  /** 특정 mode만 스크래핑 (미지정 시 per90+total 모두) */
  mode?: "per90" | "total";
  /** 특정 adjustment만 스크래핑 (미지정 시 padj+raw 모두) */
  adjustment?: "padj" | "raw";
  /** 포지션 비교 그룹 스크래핑 스킵 (기본 AM/W만 저장) */
  skipPositions: boolean;
}

/** 파싱된 선수 정보 */
export interface ParsedPlayerInfo {
  name: string;
  position: string;
  season: string;
  nationality: string;
  club: string;
  age: number;
  height: number | null;
  minutes: number;
}

/** 파싱된 메트릭 항목 */
export interface ParsedMetric {
  name: string;
  percentile: number;
  value?: number;
  category: string;
}

/** 파싱된 유사 선수 */
export interface ParsedSimilarPlayer {
  rank: number;
  name: string;
  info: string; // "18, AM/W, Barcelona"
}

/** 스크래핑 결과 통계 */
export interface ScrapeStats {
  totalPlayers: number;
  successCount: number;
  failCount: number;
  failedPlayers: string[];
  startTime: number;
}
