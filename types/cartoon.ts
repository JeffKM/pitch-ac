// 카툰 에셋 시스템 타입 정의

/** 카툰 캐릭터 감정 상태 */
export type CartoonMood =
  | "neutral"
  | "happy"
  | "celebrating"
  | "angry"
  | "sad"
  | "shocked"
  | "tired"
  | "injured"
  | "focused"
  | "laughing"
  | "crying"
  | "thinking";

/** 감정 전환을 유발하는 경기 이벤트 트리거 */
export type CartoonTrigger =
  | "goal_scored"
  | "goal_conceded"
  | "assist"
  | "red_card"
  | "yellow_card"
  | "substitution_in"
  | "substitution_out"
  | "match_win"
  | "match_loss"
  | "high_rating"
  | "low_rating"
  | "halftime"
  | "prematch";

/** 카툰 에셋 (선수 + 감정 → 이미지 URL 매핑) */
export interface CartoonAsset {
  playerId: number;
  mood: CartoonMood;
  imageUrl: string;
  thumbUrl: string;
}

/** 말풍선 대사 (선수 + 트리거 → 텍스트) */
export interface SpeechBubble {
  playerId: number;
  trigger: CartoonTrigger;
  text: string;
}

/** 감정 결정 결과 */
export interface MoodResult {
  mood: CartoonMood;
  trigger: CartoonTrigger | null;
  speechText: string | null;
}
