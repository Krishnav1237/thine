import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { siteUrl } from "./lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "What's Your Personal Intelligence Score? | Thine",
  description:
    "10 questions. 2 minutes. Discover how much of your professional life you're actually capturing — and what you're losing.",
  openGraph: {
    title: "What's Your Personal Intelligence Score?",
    description:
      "10 questions. 2 minutes. Discover how much of your professional life your current system actually preserves.",
    type: "website",
    siteName: "Thine",
    url: "/",
    images: [
      {
        url: "/api/og?score=18",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What's Your Personal Intelligence Score?",
    description:
      "10 questions. 2 minutes. Discover how much of your professional life your current system actually preserves.",
    images: ["/api/og?score=18"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
