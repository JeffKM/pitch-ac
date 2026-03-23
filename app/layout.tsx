import "./globals.css";

import type { Metadata } from "next";
import { Bangers, Fredoka, Geist, Permanent_Marker } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "pitch-ac | Man City Fan Site",
    template: "%s | pitch-ac",
  },
  description: "A cartoon fan site where Manchester City players come alive",
  keywords: [
    "Manchester City",
    "Man City",
    "cartoon",
    "fan site",
    "Premier League",
    "football",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "pitch-ac",
    title: "pitch-ac | Man City Fan Site",
    description: "A cartoon fan site where Manchester City players come alive",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "pitch-ac Man City cartoon fan site",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "pitch-ac | Man City Fan Site",
    description: "A cartoon fan site where Manchester City players come alive",
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
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
