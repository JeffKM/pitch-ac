"use client";

// 뉴스 피드 — 무한 스크롤

import { useCallback, useEffect, useRef } from "react";

import { useTransferNews } from "@/lib/hooks/use-transfer-news";

import { EmptyNews } from "./empty-news";
import { NewsCard } from "./news-card";
import { NewsSkeleton } from "./news-skeleton";

export function NewsFeed() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useTransferNews();

  const observerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [handleObserver]);

  if (isLoading) return <NewsSkeleton />;

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  if (items.length === 0) return <EmptyNews />;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}

      {/* 무한 스크롤 트리거 */}
      <div ref={observerRef} className="h-1" />

      {isFetchingNextPage && <NewsSkeleton />}
    </div>
  );
}
