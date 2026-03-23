"use client";

import { useState } from "react";

import { PlayerSearchCombobox } from "@/components/player-search-combobox";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";

import { PlayerCardGrid } from "./player-card-grid";
import { PlayerSearchEmpty } from "./player-search-empty";

interface PlayerSearchPageProps {
  allPlayers: Player[];
  teams: Team[];
}

/** 이름/팀/포지션/국적 기반 클라이언트 필터 */
function filterPlayers(
  players: Player[],
  teams: Team[],
  query: string,
): Player[] {
  const q = query.toLowerCase();
  return players.filter((player) => {
    const team = teams.find((t) => t.id === player.teamId);
    return (
      player.name.toLowerCase().includes(q) ||
      player.nationality.toLowerCase().includes(q) ||
      player.position.toLowerCase().includes(q) ||
      team?.name.toLowerCase().includes(q) ||
      team?.shortName.toLowerCase().includes(q)
    );
  });
}

export function PlayerSearchPage({ allPlayers, teams }: PlayerSearchPageProps) {
  const [displayedPlayers, setDisplayedPlayers] =
    useState<Player[]>(allPlayers);
  const [activeQuery, setActiveQuery] = useState("");
  const { searches, addSearch } = useRecentSearches();

  /** 자동완성에서 선수 선택 */
  const handleSelect = (player: Player) => {
    setDisplayedPlayers([player]);
    setActiveQuery(player.name);
    addSearch(player.name);
  };

  /** Enter 키 전체 검색 */
  const handleSearch = (query: string) => {
    const results = filterPlayers(allPlayers, teams, query);
    setDisplayedPlayers(results);
    setActiveQuery(query);
    addSearch(query);
  };

  /** 최근 검색어 클릭 */
  const handleRecentClick = (term: string) => {
    const results = filterPlayers(allPlayers, teams, term);
    setDisplayedPlayers(results);
    setActiveQuery(term);
  };

  const isEmpty = displayedPlayers.length === 0;

  return (
    <div className="space-y-6">
      <PlayerSearchCombobox
        players={allPlayers}
        teams={teams}
        onSelect={handleSelect}
        onSearch={handleSearch}
        recentSearches={searches}
        onRecentClick={handleRecentClick}
      />

      {isEmpty ? (
        <PlayerSearchEmpty query={activeQuery} />
      ) : (
        <PlayerCardGrid players={displayedPlayers} teams={teams} />
      )}
    </div>
  );
}
