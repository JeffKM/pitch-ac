// Raw 크롤링 데이터 → TransferNewsItem 변환

import type { SourceType, TransferNewsItem } from "@/types";

import type { FmkRawPost } from "./types";

// DB row → TransferNewsItem (API 응답용)
export function dbRowToTransferNewsItem(row: {
  id: number;
  title: string;
  author: string;
  source_type: string;
  source_urls: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string;
}): TransferNewsItem {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    sourceType: row.source_type as SourceType,
    sourceUrls: row.source_urls,
    viewCount: row.view_count,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    publishedAt: row.published_at,
  };
}

// Raw post → DB insert용 객체
export function rawPostToDbRow(
  post: FmkRawPost,
  sourceType: SourceType,
  sourceUrls: string[],
) {
  return {
    id: post.id,
    title: post.title,
    author: post.author,
    source_type: sourceType,
    source_urls: sourceUrls,
    view_count: post.viewCount,
    like_count: post.likeCount,
    comment_count: post.commentCount,
    published_at: post.publishedAt,
    body_crawled: true,
  };
}

// 기존 글 메타데이터 업데이트용
export function rawPostToMetaUpdate(post: FmkRawPost) {
  return {
    view_count: post.viewCount,
    like_count: post.likeCount,
    comment_count: post.commentCount,
  };
}
