import { redirect } from "next/navigation";

import { parseScoreParam } from "../../data/questions";

export default async function LegacyShareScorePage({
  params,
}: {
  params: Promise<{ score: string }>;
}) {
  const resolvedParams = await params;
  const score = parseScoreParam(resolvedParams.score);

  redirect(`/share?score=${score}`);
}
