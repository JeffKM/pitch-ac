// 에펨코리아 크롤링 관련 상수

export const FMKOREA_BASE_URL = "https://www.fmkorea.com";
export const FMKOREA_BOARD = "football_news"; // 축구 소식통
export const FMKOREA_SNS_CATEGORY = 181831933; // 정보/SNS (추후 확장용)

// 소스 유형 판별용 도메인 화이트리스트
export const TWEET_DOMAINS = ["x.com", "twitter.com"] as const;
export const ARTICLE_DOMAINS = [
  "espn.com",
  "theathletic.com",
  "bbc.co.uk",
  "skysports.com",
  "marca.com",
  "goal.com",
  "transfermarkt.com",
  "theguardian.com",
  "telegraph.co.uk",
  "mirror.co.uk",
  "dailymail.co.uk",
  "90min.com",
  "football-italia.net",
  "as.com",
  "sport.es",
  "mundodeportivo.com",
  "lequipe.fr",
  "gazzetta.it",
] as const;
export const VIDEO_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "instagram.com",
  "tiktok.com",
] as const;

// 금칙어 (1차 필터링)
export const BANNED_KEYWORDS = [
  "19금",
  "후방",
  "ㅂㅇ",
  "움짤",
  "레전드 움짤",
] as const;

// 팀별 카테고리 ID (추후 확장용)
export const TEAM_CATEGORIES = {
  manchesterCity: 853076194,
  manchesterUnited: 3417026549,
  arsenal: 732894504,
  liverpool: 259678968,
  chelsea: 463201349,
  tottenham: 1798914341,
  premierLeague: 33854722,
} as const;
