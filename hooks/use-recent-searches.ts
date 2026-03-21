"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pitch-ac:recent-searches";
const MAX_ITEMS = 5;

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(searches: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

/** localStorage 기반 최근 검색어 관리 훅 */
export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  // 마운트 시 localStorage에서 초기값 로드
  useEffect(() => {
    setSearches(readStorage());
  }, []);

  // 다른 탭에서 변경 시 동기화
  useEffect(() => {
    const handler = () => setSearches(readStorage());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearches((prev) => {
      const updated = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(
        0,
        MAX_ITEMS,
      );
      writeStorage(updated);
      return updated;
    });
  }, []);

  const clearSearches = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSearches([]);
  }, []);

  return { searches, addSearch, clearSearches };
}
