import type { Metadata } from "next";
import { redirect } from "next/navigation";

import BrandHeader from "../components/BrandHeader";
import { parseScoreParam } from "../data/questions";
import { buildReportMetadata } from "../lib/report-metadata";
import { getRequestSiteUrl } from "../lib/site";
import ResultsClient from "./ResultsClient";

type ResultsSearchParams = Promise<{
  score?: string | string[];
}>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: ResultsSearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const score = parseScoreParam(params.score);
  const origin = await getRequestSiteUrl();

  return {
    ...buildReportMetadata(score, `/results?score=${score}`, origin),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: ResultsSearchParams;
}) {
  const params = await searchParams;

  if (!params.score) {
    redirect("/quiz");
  }

  const score = parseScoreParam(params.score);

  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell report-page-shell">
        <BrandHeader />
        <ResultsClient score={score} />
      </div>
    </div>
  );
}
