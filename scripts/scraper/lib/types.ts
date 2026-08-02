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
  /** 메트릭+similarity만 수집 (action maps 탭 이동·Vision OCR 스킵) — action-maps-only의 반대 개념 */
  metricsOnly: boolean;
  /** Action Maps 탭 DOM 구조 덤프 (탐색용) */
  dumpDom: boolean;
  /** Vision API로 액션 라인 좌표 추출 활성화 */
  extractLines: boolean;
}

/** 파싱된 선수 정보 */
export interface ParsedPlayerInfo {
  name: string;
  position: string;
  /** 카드 헤더에서 읽어 요청 시즌과 일치함이 검증된 값 (저장 값의 출처는 CLI --season) */
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
  /** 기대 위협 값 (원 크기 비례) */
  xt?: number;
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
  /**
   * 부가 수집(similarity / action maps) 실패 목록.
   * 메트릭 조합 루프가 성공/실패를 집계하는 전체 모드에서, 부가 수집 실패가
   * 조용히 묻히지 않도록 별도 기록한다 (`--similarity-only`/`--action-maps-only`
   * 모드에서는 이 실패가 곧 선수 실패이므로 failedPlayers에 들어간다).
   */
  auxFailures: string[];
  startTime: number;
}
