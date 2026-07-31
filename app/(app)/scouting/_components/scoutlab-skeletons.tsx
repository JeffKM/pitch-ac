// ScoutLab Suspense fallback 스켈레톤 모음
// 필터 변경 시 각 영역이 독립적으로 스트리밍되도록 영역별 크기에 맞춘 스켈레톤 제공

import { cn } from "@/lib/utils";

/** 필터 바(시즌/리그/팀) + 선수 검색 한 줄 */
export function ScoutlabFilterSectionSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-9 w-[100px] animate-pulse rounded-md bg-comic-cream" />
        <div className="h-9 w-[160px] animate-pulse rounded-md bg-comic-cream" />
        <div className="h-9 w-[160px] animate-pulse rounded-md bg-comic-cream" />
      </div>
      <div className="h-9 w-[220px] animate-pulse rounded-md bg-comic-cream" />
    </div>
  );
}

/** 포지션 필터 + 모드 토글 한 줄 */
export function ScoutlabControlRowSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="h-8 w-[280px] animate-pulse rounded-md bg-comic-cream" />
      <div className="h-8 w-[180px] animate-pulse rounded-md bg-comic-cream" />
    </div>
  );
}

/** 선수 카드 헤더 (아바타 + 이름/메타) */
export function PlayerCardHeaderSkeleton() {
  return (
    <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-4">
      <div className="flex items-start gap-4">
        <div className="size-16 shrink-0 animate-pulse rounded-full bg-comic-cream" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-comic-cream" />
          <div className="h-4 w-28 animate-pulse rounded bg-comic-cream" />
          <div className="h-4 w-56 animate-pulse rounded bg-comic-cream" />
        </div>
      </div>
    </div>
  );
}

/** 제목 + 본문을 가진 패널 (레이더/차트/테이블 공통) */
export function ScoutlabPanelSkeleton({
  bodyClassName,
}: {
  /** 본문 영역 높이 유틸리티 클래스 (예: "h-80") */
  bodyClassName: string;
}) {
  return (
    <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
      <div className="mb-4 h-6 w-40 animate-pulse rounded bg-comic-cream" />
      <div
        className={cn(
          "w-full animate-pulse rounded bg-comic-cream",
          bodyClassName,
        )}
      />
    </div>
  );
}

/** 메트릭 행 리스트 (라벨 + 바 + 값) */
export function MetricRowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-4 w-36 animate-pulse rounded bg-comic-cream" />
          <div className="h-3 flex-1 animate-pulse rounded-full bg-comic-cream" />
          <div className="h-4 w-10 animate-pulse rounded bg-comic-cream" />
        </div>
      ))}
    </div>
  );
}
