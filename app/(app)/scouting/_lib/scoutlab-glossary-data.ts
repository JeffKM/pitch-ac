// ScoutLab 용어 정의 상수 — 11개 카테고리별 메트릭 설명
import type { ScoutlabCategory } from "@/types";

export interface GlossaryTerm {
  /** 메트릭 키 (snake_case) */
  key: string;
  /** 표시명 */
  label: string;
  /** 설명 */
  description: string;
}

export interface GlossaryCategory {
  category: ScoutlabCategory;
  label: string;
  terms: GlossaryTerm[];
}

export const SCOUTLAB_GLOSSARY: GlossaryCategory[] = [
  {
    category: "final_product",
    label: "Final Product",
    terms: [
      {
        key: "goals",
        label: "Goals",
        description: "득점 수. 자책골(OG)은 제외.",
      },
      {
        key: "npg",
        label: "Non-Penalty Goals",
        description: "페널티킥을 제외한 득점 수.",
      },
      {
        key: "assists",
        label: "Assists",
        description: "골로 이어진 최종 패스를 제공한 횟수.",
      },
      {
        key: "xg",
        label: "xG",
        description:
          "Expected Goals. 슈팅 위치·각도·상황 등을 고려한 기대 득점 수.",
      },
      {
        key: "npxg",
        label: "npxG",
        description: "Non-Penalty Expected Goals. PK를 제외한 기대 득점.",
      },
      {
        key: "xa",
        label: "xA",
        description: "Expected Assists. 패스 상황 기반 기대 어시스트 수.",
      },
      {
        key: "xag",
        label: "xAG",
        description: "Expected Assisted Goals. 어시스트에서 기대되는 득점 수.",
      },
    ],
  },
  {
    category: "shooting",
    label: "Shooting",
    terms: [
      { key: "shots", label: "Shots", description: "전체 슈팅 시도 횟수." },
      {
        key: "shots_on_target",
        label: "Shots on Target",
        description: "골대 안으로 향한 슈팅 수.",
      },
      {
        key: "xg_per_shot",
        label: "xG per Shot",
        description: "슈팅 1회당 기대 골 (슈팅 질 지표).",
      },
      {
        key: "goals_minus_xg",
        label: "Goals − xG",
        description: "실제 득점과 기대 득점의 차이. 양수면 기대 이상 피니싱.",
      },
    ],
  },
  {
    category: "creation",
    label: "Creation",
    terms: [
      {
        key: "sca",
        label: "SCA",
        description: "Shot-Creating Actions. 슈팅으로 이어지는 2개 이전 동작.",
      },
      {
        key: "gca",
        label: "GCA",
        description: "Goal-Creating Actions. 득점으로 이어지는 2개 이전 동작.",
      },
      {
        key: "key_passes",
        label: "Key Passes",
        description: "슈팅으로 이어진 패스 횟수.",
      },
      {
        key: "through_balls",
        label: "Through Balls",
        description: "수비 라인 뒤로 연결하는 쓰루 패스 수.",
      },
    ],
  },
  {
    category: "passing",
    label: "Passing",
    terms: [
      {
        key: "passes_completed",
        label: "Passes Completed",
        description: "성공한 패스 수.",
      },
      {
        key: "pass_completion_pct",
        label: "Pass Completion %",
        description: "패스 성공률 (%).",
      },
      {
        key: "progressive_passes",
        label: "Progressive Passes",
        description: "상대 골문 쪽으로 10야드 이상 전진하는 패스.",
      },
      {
        key: "passes_into_final_third",
        label: "Passes into Final Third",
        description: "파이널 써드로 연결하는 패스 수.",
      },
      {
        key: "passes_into_ppa",
        label: "Passes into PPA",
        description: "페널티 에어리어 안으로 연결된 패스.",
      },
      { key: "crosses", label: "Crosses", description: "크로스 시도 횟수." },
    ],
  },
  {
    category: "ball_carrying",
    label: "Ball Carrying",
    terms: [
      {
        key: "progressive_carries",
        label: "Progressive Carries",
        description: "상대 골문 쪽으로 10야드 이상 전진하는 드리블.",
      },
      {
        key: "carries_into_final_third",
        label: "Carries into Final Third",
        description: "파이널 써드까지 볼을 운반한 횟수.",
      },
      {
        key: "carries_into_ppa",
        label: "Carries into PPA",
        description: "페널티 에어리어까지 볼을 운반한 횟수.",
      },
      {
        key: "take_ons_attempted",
        label: "Take-ons Attempted",
        description: "1v1 돌파 시도 횟수.",
      },
      {
        key: "take_ons_succeeded",
        label: "Take-ons Succeeded",
        description: "1v1 돌파 성공 횟수.",
      },
    ],
  },
  {
    category: "defending",
    label: "Defending",
    terms: [
      { key: "tackles", label: "Tackles", description: "태클 시도 횟수." },
      {
        key: "tackles_won",
        label: "Tackles Won",
        description: "볼 탈취에 성공한 태클 수.",
      },
      {
        key: "interceptions",
        label: "Interceptions",
        description: "상대 패스를 차단한 인터셉트 횟수.",
      },
      {
        key: "blocks",
        label: "Blocks",
        description: "슈팅·패스 등을 몸으로 막은 횟수.",
      },
      {
        key: "clearances",
        label: "Clearances",
        description: "위험 지역에서 볼을 걷어낸 횟수.",
      },
    ],
  },
  {
    category: "set_pieces",
    label: "Set Pieces",
    terms: [
      {
        key: "corner_kicks",
        label: "Corner Kicks",
        description: "코너킥 횟수.",
      },
      {
        key: "free_kicks",
        label: "Free Kicks",
        description: "프리킥 시도 횟수.",
      },
      {
        key: "penalty_kicks_made",
        label: "Penalty Kicks Made",
        description: "페널티킥 성공 횟수.",
      },
      {
        key: "penalty_kicks_attempted",
        label: "Penalty Kicks Attempted",
        description: "페널티킥 시도 횟수.",
      },
    ],
  },
  {
    category: "aerial",
    label: "Aerial",
    terms: [
      {
        key: "aerials_won",
        label: "Aerials Won",
        description: "공중볼 경합 성공 횟수.",
      },
      {
        key: "aerials_lost",
        label: "Aerials Lost",
        description: "공중볼 경합 실패 횟수.",
      },
      {
        key: "aerial_win_pct",
        label: "Aerial Win %",
        description: "공중볼 경합 승률 (%).",
      },
    ],
  },
  {
    category: "possession",
    label: "Possession",
    terms: [
      { key: "touches", label: "Touches", description: "볼 터치 총 횟수." },
      {
        key: "touches_in_att_third",
        label: "Touches in Attacking Third",
        description: "공격 써드에서의 볼 터치 수.",
      },
      {
        key: "touches_in_att_pen_area",
        label: "Touches in Penalty Area",
        description: "상대 페널티 에어리어 내 볼 터치 수.",
      },
      {
        key: "ball_recoveries",
        label: "Ball Recoveries",
        description: "루즈볼을 되찾은 횟수.",
      },
      {
        key: "dispossessed",
        label: "Dispossessed",
        description: "상대에게 볼을 빼앗긴 횟수.",
      },
    ],
  },
  {
    category: "vaep_overview",
    label: "VAEP Overview",
    terms: [
      {
        key: "vaep",
        label: "VAEP",
        description:
          "Valuing Actions by Estimating Probabilities. 각 행동의 득점 기여도를 확률로 추정한 값.",
      },
      {
        key: "offensive_vaep",
        label: "Offensive VAEP",
        description: "공격 행동의 득점 기여 확률 합산.",
      },
      {
        key: "defensive_vaep",
        label: "Defensive VAEP",
        description: "수비 행동의 실점 방지 기여 확률 합산.",
      },
      {
        key: "obv",
        label: "OBV",
        description: "On-Ball Value. 볼을 가진 상태에서의 행동 가치.",
      },
    ],
  },
  {
    category: "misc",
    label: "Misc",
    terms: [
      {
        key: "yellow_cards",
        label: "Yellow Cards",
        description: "경고 카드 수.",
      },
      { key: "red_cards", label: "Red Cards", description: "퇴장 카드 수." },
      {
        key: "fouls_committed",
        label: "Fouls Committed",
        description: "파울 범한 횟수.",
      },
      {
        key: "fouls_drawn",
        label: "Fouls Drawn",
        description: "상대 파울을 유도한 횟수.",
      },
      {
        key: "offsides",
        label: "Offsides",
        description: "오프사이드에 걸린 횟수.",
      },
    ],
  },
];
