import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// CSP (Content Security Policy) — Report-Only 모드로 위반 모니터링
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://cdn.sportmonks.com https://*.supabase.co;
  font-src 'self';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
`
  .replace(/\n/g, " ")
  .trim();

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sportmonks.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/cartoon-assets/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // 모든 라우트에 보안 헤더 적용
        source: "/(.*)",
        headers: [
          // 클릭재킹 방지
          { key: "X-Frame-Options", value: "DENY" },
          // MIME 타입 스니핑 방지
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer 정책
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // 불필요한 브라우저 기능 비활성화
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // XSS 필터 (레거시 브라우저용)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // CSP Report-Only — 위반 로그만 기록, 차단하지 않음
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // DSN 없으면 Sentry 비활성화 (로컬 개발 시)
  silent: !process.env.CI,
  // 소스맵 업로드 (CI에서만)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
