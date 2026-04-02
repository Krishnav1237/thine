import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import PostHogProvider from "./components/PostHogProvider";
import WebVitalsProvider from "./components/WebVitalsProvider";
import { AuthProvider } from "./components/auth/AuthProvider";
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
}>): React.JSX.Element {
  const posthogKey = process.env.NEXTPUBLICPOSTHOG_KEY ?? "";
  const posthogHost =
    process.env.NEXTPUBLICPOSTHOG_HOST ?? "https://us.i.posthog.com";

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PostHogProvider apiKey={posthogKey} host={posthogHost}>
            <WebVitalsProvider />
            {children}
          </PostHogProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
