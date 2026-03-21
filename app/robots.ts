// 크롤러 접근 제어 — 공개 페이지 허용, API/인증 라우트 차단

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/matchday", "/players", "/compare"],
        disallow: ["/api/", "/auth/", "/more"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
