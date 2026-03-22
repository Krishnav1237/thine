import type { Metadata } from "next";

import { parseScoreParam } from "../data/questions";
import { buildReportMetadata } from "../lib/report-metadata";
import { getRequestSiteUrl } from "../lib/site";
import ShareCardView from "./ShareCardView";

// LEGACY SHARE ROUTE - query-param based, pre-Supabase.
// Will be deprecated once all share flows use Supabase-backed /share/[id].
// Do not add new features here. New share logic goes in /app/share/[score]/page.tsx.

type ShareSearchParams = Promise<{
  score?: string | string[];
  name?: string | string[];
}>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: ShareSearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const score = parseScoreParam(params.score);
  const origin = await getRequestSiteUrl();

  return buildReportMetadata(score, `/share?score=${score}`, origin);
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: ShareSearchParams;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const score = parseScoreParam(params.score);
  const rawName = Array.isArray(params.name) ? params.name[0] : params.name;
  const name =
    typeof rawName === "string" ? rawName.trim().slice(0, 32) : undefined;

  return <ShareCardView score={score} name={name} />;
}
