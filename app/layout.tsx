import "./globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "pitch-ac | PL 데이터 플랫폼",
    template: "%s | pitch-ac",
  },
  description: "프리미어리그 선수·경기 데이터를 맥락과 함께 시각적으로",
  keywords: [
    "프리미어리그",
    "PL",
    "축구",
    "선수 스탯",
    "경기 데이터",
    "xG",
    "xA",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: defaultUrl,
    siteName: "pitch-ac",
    title: "pitch-ac | PL 데이터 플랫폼",
    description: "프리미어리그 선수·경기 데이터를 맥락과 함께 시각적으로",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "pitch-ac",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "pitch-ac | PL 데이터 플랫폼",
    description: "프리미어리그 선수·경기 데이터를 맥락과 함께 시각적으로",
    images: ["/twitter-image.png"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
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
      <body className={`${geistSans.className} antialiased`}>
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
