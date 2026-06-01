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
  /** 특정 포지션만 스크래핑 (e.g., ["CB", "FB", "MF", "FW"]) */
  positions?: string[];
  /** 선수 본인 포지션으로만 비교 그룹 스크래핑 (CB→CB, FW→FW) */
  matchPosition: boolean;
  /** similarity만 수집 (메트릭 스크래핑 스킵) */
  similarityOnly: boolean;
  /** action maps만 수집 */
  actionMapsOnly: boolean;
  /** Action Maps 탭 DOM 구조 덤프 (탐색용) */
  dumpDom: boolean;
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
  score?: number; // 0~1 소수 (Similarity Score 탭에서 수집 시)
}

/** 파싱된 액션 라인 (carries/passes/crosses 좌표) */
export interface ParsedActionLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progressive: boolean;
  threatening: boolean;
}

/** 파싱된 액션 맵 (1개 섹션) */
export interface ParsedActionMap {
  actionType: "carries" | "passes" | "crosses";
  lines: ParsedActionLine[];
  totalCount: number;
  per90: number;
  /** 서버사이드 렌더링 PNG 이미지 URL (ScoutLab 원본) */
  imageUrl?: string;
}

/** 스크래핑 결과 통계 */
export interface ScrapeStats {
  totalPlayers: number;
  successCount: number;
  failCount: number;
  failedPlayers: string[];
  startTime: number;
}
