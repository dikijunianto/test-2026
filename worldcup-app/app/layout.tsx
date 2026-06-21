// app/layout.tsx
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://worldcup-simulator.vercel.app"),
  title: {
    default: "World Cup Simulator 2026",
    template: "%s | World Cup Simulator 2026",
  },
  description:
    "Simulate FIFA World Cup 2026 matches, standings, and knockout brackets. Share your predictions with friends.",
  keywords: [
    "world cup",
    "fifa",
    "2026",
    "simulator",
    "standings",
    "bracket",
    "predictions",
    "football",
    "soccer",
  ],
  authors: [{ name: "World Cup Simulator" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://worldcup-simulator.vercel.app",
    siteName: "World Cup Simulator 2026",
    title: "World Cup Simulator 2026",
    description:
      "Simulate FIFA World Cup 2026 matches, standings, and knockout brackets.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "World Cup Simulator 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup Simulator 2026",
    description:
      "Simulate FIFA World Cup 2026 matches, standings, and knockout brackets.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
