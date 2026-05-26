export type SourceType = "tweet" | "article" | "video" | "summary";

export interface TransferNewsItem {
  id: number;
  title: string;
  author: string;
  sourceType: SourceType;
  sourceUrls: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string; // ISO 8601
}

export interface TransferNewsListResponse {
  items: TransferNewsItem[];
  nextCursor: number | null;
}
