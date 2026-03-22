import "./globals.css";

import type { Metadata } from "next";
import { Fredoka, Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "pitch-ac | 맨시티 카툰 팬사이트",
    template: "%s | pitch-ac",
  },
  description: "맨체스터 시티 선수들이 카툰 캐릭터로 살아 움직이는 팬사이트",
  keywords: [
    "맨체스터 시티",
    "맨시티",
    "Manchester City",
    "카툰",
    "팬사이트",
    "프리미어리그",
    "축구",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: defaultUrl,
    siteName: "pitch-ac",
    title: "pitch-ac | 맨시티 카툰 팬사이트",
    description: "맨체스터 시티 선수들이 카툰 캐릭터로 살아 움직이는 팬사이트",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "pitch-ac 맨시티 카툰 팬사이트",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "pitch-ac | 맨시티 카툰 팬사이트",
    description: "맨체스터 시티 선수들이 카툰 캐릭터로 살아 움직이는 팬사이트",
    images: ["/twitter-image.png"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${fredoka.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
