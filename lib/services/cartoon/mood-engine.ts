// 감정 상태 결정 엔진 — 경기 이벤트/상태 → CartoonMood
import "server-only";

import type { FixtureEvent, FixtureStatus } from "@/types";
import type { CartoonMood, CartoonTrigger, MoodResult } from "@/types/cartoon";

/** 기본 말풍선 텍스트 (트리거별) */
const DEFAULT_SPEECH: Record<CartoonTrigger, string> = {
  goal_scored: "골! 시티 DNA! ⚽",
  goal_conceded: "집중하자!",
  assist: "패스는 내가 했지 😎",
  red_card: "이건 아닌데...",
  yellow_card: "조심해야겠다",
  substitution_in: "내가 왔다! 💪",
  substitution_out: "수고했어",
  match_win: "오늘도 승리! 🏆",
  match_loss: "다음에 반드시...",
  high_rating: "오늘 컨디션 최고!",
  low_rating: "다음엔 더 잘하자",
  halftime: "후반전 시작이다",
  prematch: "준비 완료!",
};

/** 트리거 → 감정 매핑 */
const TRIGGER_MOOD_MAP: Record<CartoonTrigger, CartoonMood> = {
  goal_scored: "celebrating",
  goal_conceded: "sad",
  assist: "happy",
  red_card: "shocked",
  yellow_card: "angry",
  substitution_in: "focused",
  substitution_out: "tired",
  match_win: "laughing",
  match_loss: "crying",
  high_rating: "happy",
  low_rating: "thinking",
  halftime: "thinking",
  prematch: "focused",
};

/**
 * 선수의 현재 감정 상태를 결정한다.
 *
 * 우선순위:
 * 1. 직접 이벤트 (골/카드/교체) — 최근 이벤트 우선
 * 2. 팀 상황 (승리/패배)
 * 3. 기본 (focused/neutral)
 */
export function resolvePlayerMood(params: {
  playerId: number;
  events: FixtureEvent[];
  status: FixtureStatus;
  homeScore: number | null;
  awayScore: number | null;
  isHomeTeam: boolean;
}): MoodResult {
  const { playerId, events, status, homeScore, awayScore, isHomeTeam } = params;

  // 1. 직접 이벤트 확인 (최근 이벤트 우선)
  const playerEvents = events
    .filter((e) => e.playerId === playerId)
    .sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0));

  if (playerEvents.length > 0) {
    const latestEvent = playerEvents[0];
    const trigger = eventToTrigger(latestEvent);
    if (trigger) {
      return {
        mood: TRIGGER_MOOD_MAP[trigger],
        trigger,
        speechText: DEFAULT_SPEECH[trigger],
      };
    }
  }

  // 2. 경기 종료 후 결과 기반
  if (status === "FT" && homeScore !== null && awayScore !== null) {
    const teamScore = isHomeTeam ? homeScore : awayScore;
    const opponentScore = isHomeTeam ? awayScore : homeScore;

    if (teamScore > opponentScore) {
      return {
        mood: "laughing",
        trigger: "match_win",
        speechText: DEFAULT_SPEECH.match_win,
      };
    }
    if (teamScore < opponentScore) {
      return {
        mood: "crying",
        trigger: "match_loss",
        speechText: DEFAULT_SPEECH.match_loss,
      };
    }
    // 무승부
    return {
      mood: "thinking",
      trigger: null,
      speechText: "아쉬운 무승부...",
    };
  }

  // 3. 라이브 경기 중 팀 상황
  if (status === "LIVE" && homeScore !== null && awayScore !== null) {
    const teamScore = isHomeTeam ? homeScore : awayScore;
    const opponentScore = isHomeTeam ? awayScore : homeScore;

    // 실점 직후 (3초 뒤 focused 복귀는 클라이언트에서 처리)
    const recentConceded = events.find(
      (e) =>
        e.type === "goal" &&
        e.teamId !== (isHomeTeam ? params.playerId : undefined),
    );
    if (recentConceded) {
      // 최근 2분 이내 실점이면 shocked
      // (클라이언트에서 시간 기반 전환 처리)
    }

    if (teamScore > opponentScore) {
      return { mood: "happy", trigger: null, speechText: null };
    }
    if (teamScore < opponentScore) {
      return { mood: "focused", trigger: null, speechText: "역전하자!" };
    }
  }

  // 4. 경기 전 기본 상태
  if (status === "NS") {
    return {
      mood: "focused",
      trigger: "prematch",
      speechText: DEFAULT_SPEECH.prematch,
    };
  }

  // 5. 폴백
  return { mood: "neutral", trigger: null, speechText: null };
}

/** FixtureEvent → CartoonTrigger 변환 */
function eventToTrigger(event: FixtureEvent): CartoonTrigger | null {
  switch (event.type) {
    case "goal":
      return "goal_scored";
    case "substitution":
      return "substitution_out";
    case "yellow_card":
      return "yellow_card";
    case "red_card":
      return "red_card";
    default:
      return null;
  }
}
