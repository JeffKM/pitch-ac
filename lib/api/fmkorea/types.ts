// 에펨코리아 크롤링 Raw DTO

// 리스트 페이지에서 파싱한 게시글 정보
export interface FmkRawPost {
  id: number;
  title: string;
  author: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string; // ISO 8601
}

// 본문 페이지에서 추출한 외부 링크
export interface FmkRawArticle {
  postId: number;
  externalUrls: string[];
}
