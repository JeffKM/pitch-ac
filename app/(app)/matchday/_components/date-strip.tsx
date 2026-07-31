"use client";

// 날짜 스트립 — 오늘 ±7일 수평 스크롤 네비게이션

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

  // 스트립이 실제로 넘칠 때만 좌우 화살표를 활성화한다.
  // (넘치지 않는 폭에서 화살표가 눌려도 아무 일이 없는 문제 해결)
  const [isOverflowing, setIsOverflowing] = useState(false);

  // 날짜 목록 생성 (오늘 ±7일 = 15일)
  const dates = Array.from({ length: RANGE * 2 + 1 }, (_, i) =>
    addDays(today, i - RANGE),
  );

  // 오버플로 감지 — 마운트 시 1회 + 컨테이너/내용 크기 변화 시마다 재계산
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const measure = () => {
      // 소수점 반올림 오차를 감안해 1px 여유를 둔다
      setIsOverflowing(container.scrollWidth - container.clientWidth > 1);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    for (const child of Array.from(container.children)) {
      observer.observe(child);
    }

    return () => observer.disconnect();
  }, []);

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
        type="button"
        onClick={() => scroll("left")}
        disabled={!isOverflowing}
        className="flex size-8 shrink-0 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white transition-colors hover:bg-comic-cream disabled:pointer-events-none disabled:opacity-40"
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
              type="button"
              ref={isSelected ? selectedRef : null}
              onClick={() => handleDateClick(date)}
              aria-current={isSelected ? "date" : undefined}
              className={cn(
                "flex shrink-0 flex-col items-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] px-3 py-1.5 transition-colors",
                isSelected
                  ? "border-comic-black bg-comic-yellow text-comic-yellow-fg"
                  : "border-transparent text-comic-black/60 hover:bg-comic-cream hover:text-comic-black",
              )}
            >
              <span className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-sm)] tracking-[var(--comic-tracking-normal)]">
                {day}
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  isToday && !isSelected && "font-bold text-comic-red-text",
                )}
              >
                {isToday ? "오늘" : weekday}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        disabled={!isOverflowing}
        className="flex size-8 shrink-0 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white transition-colors hover:bg-comic-cream disabled:pointer-events-none disabled:opacity-40"
        aria-label="다음 날짜"
      >
        <ChevronRight className="size-4 text-comic-black" />
      </button>
    </div>
  );
}
