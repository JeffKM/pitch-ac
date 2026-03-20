// 축구 용어 타입 정의

/** 축구 전문 용어 */
export interface GlossaryTerm {
  id: string;
  /** 용어 (영어, 예: xG) */
  term: string;
  /** 정의 설명 */
  definition: string;
  /** 비유/유추 설명 (이해를 돕기 위한) */
  analogy: string;
  /** 구체적인 예시 */
  example: string;
}
