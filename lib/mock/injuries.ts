// 팀별 부상/결장 선수 더미 데이터

import type { InjuredPlayer } from "@/types";

export const mockInjuries: InjuredPlayer[] = [
  // Arsenal(42)
  {
    playerId: 201,
    playerName: "Ben White",
    teamId: 42,
    reason: "햄스트링 부상",
    expectedReturn: "2025-03-28",
  },
  {
    playerId: 205,
    playerName: "Granit Xhaka",
    teamId: 42,
    reason: "발목 염좌",
    expectedReturn: null,
  },

  // Chelsea(49)
  {
    playerId: 302,
    playerName: "Thiago Silva",
    teamId: 49,
    reason: "무릎 부상",
    expectedReturn: "2025-04-10",
  },

  // Liverpool(40)
  {
    playerId: 402,
    playerName: "Joel Matip",
    teamId: 40,
    reason: "ACL 부상",
    expectedReturn: null,
  },
  {
    playerId: 410,
    playerName: "Ibrahima Konate",
    teamId: 40,
    reason: "대퇴근 부상",
    expectedReturn: "2025-03-30",
  },

  // Man City(50)
  {
    playerId: 107,
    playerName: "Kevin De Bruyne",
    teamId: 50,
    reason: "근육 피로",
    expectedReturn: "2025-03-22",
  },

  // Man United(33)
  {
    playerId: 605,
    playerName: "Luke Shaw",
    teamId: 33,
    reason: "근육 부상",
    expectedReturn: null,
  },
  {
    playerId: 609,
    playerName: "Marcus Rashford",
    teamId: 33,
    reason: "발 부상",
    expectedReturn: "2025-03-25",
  },

  // Tottenham(47)
  {
    playerId: 709,
    playerName: "Richarlison",
    teamId: 47,
    reason: "무릎 수술",
    expectedReturn: null,
  },
];

/** 팀 ID로 부상 선수 목록 조회 */
export function getInjuriesByTeamId(teamId: number): InjuredPlayer[] {
  return mockInjuries.filter((p) => p.teamId === teamId);
}
