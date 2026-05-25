// 메트릭명 포매팅 유틸리티
import { SCOUTLAB_GLOSSARY_MAP } from "./scoutlab-glossary-data";

/** snake_case → Title Case 변환 (예: "xg_per_shot" → "xG Per Shot") */
export function formatMetricName(snakeCase: string): string {
  // 특수 축구 용어 매핑
  const SPECIAL_TERMS: Record<string, string> = {
    xg: "xG",
    xa: "xA",
    npxg: "npxG",
    xag: "xAG",
    vaep: "VAEP",
    padj: "PAdj.",
    p90: "P90",
    pct: "%",
    gca: "GCA",
    sca: "SCA",
    obv: "OBV",
    psxg: "PSxG",
    ppa: "PPA",
  };

  return snakeCase
    .split("_")
    .map((word) => {
      const lower = word.toLowerCase();
      if (SPECIAL_TERMS[lower]) return SPECIAL_TERMS[lower];
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/** 메트릭 키에 해당하는 한국어 짧은 부연 반환 */
export function getMetricBrief(snakeCase: string): string | null {
  return SCOUTLAB_GLOSSARY_MAP[snakeCase]?.brief ?? null;
}

/** 영문명 + 한국어 부연 병기 (예: "xG (기대 득점)") */
export function formatMetricLabel(snakeCase: string): string {
  const name = formatMetricName(snakeCase);
  const brief = getMetricBrief(snakeCase);
  return brief ? `${name} (${brief})` : name;
}

/** 숫자를 소수점 2자리까지 포매팅 (trailing zero 제거) */
export function formatMetricValue(value: number): string {
  if (Number.isInteger(value)) return value.toString();
  return parseFloat(value.toFixed(2)).toString();
}
