// 선수 더미 데이터 — 포지션별 12명

import type { Player } from "@/types";

export const mockPlayers: Player[] = [
  // GK (2명)
  {
    id: 101,
    name: "Aaron Ramsdale",
    photoUrl: "https://media.api-sports.io/football/players/2935.png",
    teamId: 42, // Arsenal
    position: "GK",
    number: 32,
    nationality: "England",
  },
  {
    id: 102,
    name: "Alisson Becker",
    photoUrl: "https://media.api-sports.io/football/players/762.png",
    teamId: 40, // Liverpool
    position: "GK",
    number: 1,
    nationality: "Brazil",
  },
  // DEF (3명)
  {
    id: 103,
    name: "William Saliba",
    photoUrl: "https://media.api-sports.io/football/players/47189.png",
    teamId: 42, // Arsenal
    position: "DEF",
    number: 12,
    nationality: "France",
  },
  {
    id: 104,
    name: "Virgil van Dijk",
    photoUrl: "https://media.api-sports.io/football/players/306.png",
    teamId: 40, // Liverpool
    position: "DEF",
    number: 4,
    nationality: "Netherlands",
  },
  {
    id: 105,
    name: "Reece James",
    photoUrl: "https://media.api-sports.io/football/players/19220.png",
    teamId: 49, // Chelsea
    position: "DEF",
    number: 24,
    nationality: "England",
  },
  // MID (4명)
  {
    id: 106,
    name: "Martin Odegaard",
    photoUrl: "https://media.api-sports.io/football/players/19220.png",
    teamId: 42, // Arsenal
    position: "MID",
    number: 8,
    nationality: "Norway",
  },
  {
    id: 107,
    name: "Kevin De Bruyne",
    photoUrl: "https://media.api-sports.io/football/players/627.png",
    teamId: 50, // Man City
    position: "MID",
    number: 17,
    nationality: "Belgium",
  },
  {
    id: 108,
    name: "Bruno Fernandes",
    photoUrl: "https://media.api-sports.io/football/players/521.png",
    teamId: 33, // Man United
    position: "MID",
    number: 8,
    nationality: "Portugal",
  },
  {
    id: 109,
    name: "James Maddison",
    photoUrl: "https://media.api-sports.io/football/players/19765.png",
    teamId: 47, // Tottenham
    position: "MID",
    number: 10,
    nationality: "England",
  },
  // FWD (3명)
  {
    id: 110,
    name: "Mohamed Salah",
    photoUrl: "https://media.api-sports.io/football/players/742.png",
    teamId: 40, // Liverpool
    position: "FWD",
    number: 11,
    nationality: "Egypt",
  },
  {
    id: 111,
    name: "Erling Haaland",
    photoUrl: "https://media.api-sports.io/football/players/1100.png",
    teamId: 50, // Man City
    position: "FWD",
    number: 9,
    nationality: "Norway",
  },
  {
    id: 112,
    name: "Bukayo Saka",
    photoUrl: "https://media.api-sports.io/football/players/47232.png",
    teamId: 42, // Arsenal
    position: "FWD",
    number: 7,
    nationality: "England",
  },
];

/** ID로 선수 조회 */
export function getPlayerById(id: number): Player | undefined {
  return mockPlayers.find((player) => player.id === id);
}

/** 이름/팀/포지션으로 선수 검색 */
export function searchPlayers(query: string): Player[] {
  const q = query.toLowerCase();
  return mockPlayers.filter(
    (player) =>
      player.name.toLowerCase().includes(q) ||
      player.nationality.toLowerCase().includes(q),
  );
}

/** 팀 ID로 선수 목록 조회 */
export function getPlayersByTeamId(teamId: number): Player[] {
  return mockPlayers.filter((player) => player.teamId === teamId);
}

/** 포지션으로 선수 목록 조회 */
export function getPlayersByPosition(position: Player["position"]): Player[] {
  return mockPlayers.filter((player) => player.position === position);
}
