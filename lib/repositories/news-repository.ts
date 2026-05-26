// 뉴스 조회 Repository

import { dbRowToTransferNewsItem } from "@/lib/api/fmkorea";
import { createClient } from "@/lib/supabase/server";
import type { TransferNewsItem } from "@/types";

/** 최신 뉴스 N건 조회 (홈 화면용) */
export async function getLatestNews(
  limit: number = 3,
): Promise<TransferNewsItem[]> {
  const supabase = await createClient();

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
}
