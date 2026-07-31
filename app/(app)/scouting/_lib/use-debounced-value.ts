"use client";

// 입력값 디바운스 훅 — 검색어를 queryKey에 넣기 전 지연시켜 타이핑 중 요청 폭주를 막는다

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
