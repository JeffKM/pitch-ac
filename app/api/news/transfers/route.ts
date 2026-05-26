// GET /api/news/transfers — 이적뉴스 피드 (cursor 기반 페이지네이션)

import { NextRequest, NextResponse } from "next/server";

import { dbRowToTransferNewsItem } from "@/lib/api/fmkorea";
import { createClient } from "@/lib/supabase/server";
import type {
  ApiErrorResponse,
  ApiResponse,
  TransferNewsListResponse,
} from "@/types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const cursorParam = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");

  const limit = Math.min(
    Math.max(
      parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
      1,
    ),
    MAX_LIMIT,
  );

  try {
    const supabase = await createClient();

    let query = supabase
      .from("transfer_news")
      .select(
        "id, title, author, source_type, source_urls, view_count, like_count, comment_count, published_at",
      )
      .eq("hidden", false)
      .order("published_at", { ascending: false })
      .limit(limit + 1); // +1로 다음 페이지 존재 여부 확인

    if (cursorParam) {
      const cursor = parseInt(cursorParam, 10);
      if (!isNaN(cursor)) {
        query = query.lt("id", cursor);
      }
    }

    const { data: rows, error } = await query;

    if (error) {
      const res: ApiErrorResponse = {
        data: null,
        error: { code: "DB_ERROR", message: error.message },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(res, { status: 500 });
    }

    const hasMore = (rows?.length ?? 0) > limit;
    const items = (rows ?? []).slice(0, limit).map(dbRowToTransferNewsItem);
    const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;

    const res: ApiResponse<TransferNewsListResponse> = {
      data: { items, nextCursor },
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(res, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    const res: ApiErrorResponse = {
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: err instanceof Error ? err.message : "알 수 없는 오류",
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(res, { status: 500 });
  }
}
