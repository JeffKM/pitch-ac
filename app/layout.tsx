import "./globals.css";

import type { Metadata } from "next";
import { Bangers, Fredoka, Geist, Permanent_Marker } from "next/font/google";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "pitch-ac | 5-League Football Data Hub",
    template: "%s | pitch-ac",
  },
  description:
    "유럽 5대 리그 축구 데이터 허브 — 경기 일정, 순위, 선수 스카우팅 분석을 한눈에",
  keywords: [
    "Premier League",
    "La Liga",
    "Serie A",
    "Bundesliga",
    "Ligue 1",
    "football data",
    "축구 데이터",
    "선수 분석",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: defaultUrl,
    siteName: "pitch-ac",
    title: "pitch-ac | 5-League Football Data Hub",
    description:
      "유럽 5대 리그 축구 데이터 허브 — 경기 일정, 순위, 선수 스카우팅 분석을 한눈에",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "pitch-ac 5-League Football Data Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "pitch-ac | 5-League Football Data Hub",
    description:
      "유럽 5대 리그 축구 데이터 허브 — 경기 일정, 순위, 선수 스카우팅 분석을 한눈에",
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

const bangers = Bangers({
  variable: "--font-bangers",
  weight: "400",
  display: "swap",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  weight: "400",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${fredoka.variable} ${bangers.variable} ${permanentMarker.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="oklch(0.58 0.22 25)" showSpinner={false} />
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
