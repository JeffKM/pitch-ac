// 검색 엔진 사이트맵 — 선수 프로필 동적 생성

import type { MetadataRoute } from "next";

import { getAllPlayers } from "@/lib/repositories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  // 정적 라우트
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/matchday`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/players`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 동적 라우트 — 선수 프로필
  let playerRoutes: MetadataRoute.Sitemap = [];
  try {
    const players = await getAllPlayers();
    playerRoutes = players.map((player) => ({
      url: `${baseUrl}/players/${player.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB 조회 실패 시 빈 배열 (사이트맵 생성 실패 방지)
  }

  return [...staticRoutes, ...playerRoutes];
}
