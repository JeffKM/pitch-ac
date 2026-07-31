// 뉴스 조회 Repository

import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";

import { dbRowToTransferNewsItem } from "@/lib/api/fmkorea";
import { createPublicClient } from "@/lib/supabase/public";
import type { TransferNewsItem } from "@/types";

/** 최신 뉴스 N건 조회 (홈 화면용) */
export const getLatestNews = cache(
  async (limit: number = 3): Promise<TransferNewsItem[]> => {
    "use cache";
    cacheLife("minutes");
    cacheTag("news");

    const supabase = createPublicClient();

    const { data: rows, error } = await supabase
      .from("transfer_news")
      .select(
        "id, title, author, source_type, source_urls, view_count, like_count, comment_count, published_at",
      )
      .eq("hidden", false)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[news-repository] getLatestNews 실패:", error.message);
      return [];
    }

    return (rows ?? []).map(dbRowToTransferNewsItem);
  },
);
