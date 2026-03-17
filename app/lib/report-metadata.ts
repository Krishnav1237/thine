import type { Metadata } from "next";

import { MAX_SCORE, normalizeScore } from "../data/questions";
import { getScoreBand } from "./analyzeUser";

export function buildReportMetadata(
  score: number,
  pathname: string,
  origin?: string
): Metadata {
  const normalizedScore = normalizeScore(score);
  const band = getScoreBand(normalizedScore);
  const title = `${band.name} — ${normalizedScore}/${MAX_SCORE} | Personal Intelligence Report`;
  const description = `I scored ${normalizedScore}/${MAX_SCORE} on Thine's Personal Intelligence diagnostic. Category: ${band.name}.`;
  const baseUrl = origin?.replace(/\/$/, "");
  const resolvedUrl = baseUrl ? `${baseUrl}${pathname}` : pathname;
  const imageUrl = baseUrl
    ? `${baseUrl}/api/og?score=${normalizedScore}`
    : `/api/og?score=${normalizedScore}`;

  return {
    title,
    description,
    alternates: {
      canonical: resolvedUrl,
    },
    openGraph: {
      title,
      description,
      url: resolvedUrl,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
