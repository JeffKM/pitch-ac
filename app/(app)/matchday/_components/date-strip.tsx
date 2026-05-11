"use client";

// 날짜 스트립 — 오늘 ±7일 수평 스크롤 네비게이션

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { addDays, formatStripDate, getTodayDateKey } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const RANGE = 7; // 오늘 ±7일

interface DateStripProps {
  selectedDate: string;
}

export function DateStrip({ selectedDate }: DateStripProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const today = getTodayDateKey();

  // 날짜 목록 생성 (오늘 ±7일 = 15일)
  const dates = Array.from({ length: RANGE * 2 + 1 }, (_, i) =>
    addDays(today, i - RANGE),
  );

  // 선택 날짜 가운데 스크롤
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = selectedRef.current;
      const offset =
        el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [selectedDate]);

  const handleDateClick = useCallback(
    (date: string) => {
      router.push(`/matchday?date=${date}`, { scroll: false });
    },
    [router],
  );

  const scroll = useCallback((direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => scroll("left")}
        className="flex size-8 shrink-0 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white transition-colors hover:bg-comic-cream"
        aria-label="이전 날짜"
      >
        <ChevronLeft className="size-4 text-comic-black" />
      </button>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex flex-1 gap-1 overflow-x-auto"
      >
        {dates.map((date) => {
          const { day, weekday } = formatStripDate(date);
          const isToday = date === today;
          const isSelected = date === selectedDate;

          return (
            <button
              key={date}
              ref={isSelected ? selectedRef : null}
              onClick={() => handleDateClick(date)}
              className={cn(
                "flex shrink-0 flex-col items-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] px-3 py-1.5 transition-colors",
                isSelected
                  ? "border-comic-black bg-comic-yellow text-comic-black"
                  : "border-transparent text-comic-black/60 hover:bg-comic-cream hover:text-comic-black",
              )}
            >
              <span className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-sm)] tracking-[var(--comic-tracking-normal)]">
                {day}
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  isToday && !isSelected && "font-bold text-comic-red",
                )}
              >
                {isToday ? "오늘" : weekday}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => scroll("right")}
        className="flex size-8 shrink-0 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white transition-colors hover:bg-comic-cream"
        aria-label="다음 날짜"
      >
        <ChevronRight className="size-4 text-comic-black" />
      </button>
    </div>
  );
}
