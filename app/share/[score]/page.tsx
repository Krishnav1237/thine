import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import ArenaShareCardView from "../../arena/share/ArenaShareCardView";
import { parseScoreParam } from "../../data/questions";
import { ARENA_STANCE_LABELS } from "../../lib/arena-share";
import { getSupabaseAdminClient, getSupabaseServerClient } from "../../lib/supabase/server";
import { getRequestSiteUrl } from "../../lib/site";
import type { SharedResultRow } from "../../lib/supabase/types";
import ShareCardView from "../ShareCardView";

function isLegacyNumericSlug(value: string) {
  return /^\d+$/.test(value);
}

function cleanText(value: unknown, max = 48) {
  return typeof value === "string" ? value.trim().slice(0, max) : undefined;
}

async function loadSharedResult(resultId: string) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("shared_results")
    .select("*")
    .eq("id", resultId)
    .maybeSingle();
  const shared = (data ?? null) as SharedResultRow | null;

  const admin = getSupabaseAdminClient();
  if (shared && admin) {
    void admin
      .from("shared_results")
      .update({ views: (shared.views ?? 0) + 1 })
      .eq("id", resultId);
  }

  return shared;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ score: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;

  if (isLegacyNumericSlug(resolvedParams.score)) {
    const score = parseScoreParam(resolvedParams.score);
    const origin = await getRequestSiteUrl();

    return {
      title: `Score ${score} on Thine`,
      description: "Personal Intelligence Assessment - Can you beat this?",
      openGraph: {
        title: `Score ${score} on Thine`,
        description: "Personal Intelligence Assessment - Can you beat this?",
        url: `/share/${resolvedParams.score}`,
        images: [`${origin}/api/og?type=quiz&score=${score}`],
      },
      twitter: {
        card: "summary_large_image",
        title: `Score ${score} on Thine`,
        description: "Personal Intelligence Assessment - Can you beat this?",
        images: [`${origin}/api/og?type=quiz&score=${score}`],
      },
    };
  }

  const shared = await loadSharedResult(resolvedParams.score);
  const origin = await getRequestSiteUrl();

  if (!shared) {
    return {};
  }

  if (shared.resulttype === "arena") {
    const profile = cleanText(shared.thinking_profile) ?? "Hot Takes Arena";
    const name = cleanText(shared.display_name);

    return {
      title: name ? `${name} got ${profile} on Thine` : `${profile} on Thine`,
      description: "Hot Takes Arena - What's your thinking style?",
      openGraph: {
        title: name ? `${name} got ${profile} on Thine` : `${profile} on Thine`,
        description: "Hot Takes Arena - What's your thinking style?",
        url: `/share/${resolvedParams.score}`,
        images: [
          `${origin}/api/og?type=arena&profile=${encodeURIComponent(profile)}${
            name ? `&name=${encodeURIComponent(name)}` : ""
          }`,
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: name ? `${name} got ${profile} on Thine` : `${profile} on Thine`,
        description: "Hot Takes Arena - What's your thinking style?",
        images: [
          `${origin}/api/og?type=arena&profile=${encodeURIComponent(profile)}${
            name ? `&name=${encodeURIComponent(name)}` : ""
          }`,
        ],
      },
    };
  }

  const score = Math.round(shared.score ?? 0);
  const name = cleanText(shared.display_name);

  return {
    title: name ? `${name} scored ${score} on Thine` : `Score ${score} on Thine`,
    description: "Personal Intelligence Assessment - Can you beat this?",
    openGraph: {
      title: name ? `${name} scored ${score} on Thine` : `Score ${score} on Thine`,
      description: "Personal Intelligence Assessment - Can you beat this?",
      url: `/share/${resolvedParams.score}`,
      images: [
        `${origin}/api/og?type=quiz&score=${score}${
          name ? `&name=${encodeURIComponent(name)}` : ""
        }`,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: name ? `${name} scored ${score} on Thine` : `Score ${score} on Thine`,
      description: "Personal Intelligence Assessment - Can you beat this?",
      images: [
        `${origin}/api/og?type=quiz&score=${score}${
          name ? `&name=${encodeURIComponent(name)}` : ""
        }`,
      ],
    },
  };
}

export default async function ShareResultPage({
  params,
}: {
  params: Promise<{ score: string }>;
}) {
  const resolvedParams = await params;

  if (isLegacyNumericSlug(resolvedParams.score)) {
    const score = parseScoreParam(resolvedParams.score);
    redirect(`/share?score=${score}`);
  }

  const shared = await loadSharedResult(resolvedParams.score);

  if (!shared) {
    notFound();
  }

  if (shared.resulttype === "arena") {
    const stance =
      shared.stance_data && typeof shared.stance_data === "object"
        ? (shared.stance_data as Record<string, unknown>)
        : null;

    const dominant =
      cleanText(stance?.dominant) ??
      ARENA_STANCE_LABELS.depends;

    return (
      <ArenaShareCardView
        profile={cleanText(shared.thinking_profile) ?? "Hot Takes Arena"}
        name={cleanText(shared.display_name)}
        role={cleanText(stance?.role, 64)}
        agree={Math.round(Number(stance?.agree ?? 0))}
        disagree={Math.round(Number(stance?.disagree ?? 0))}
        depends={Math.round(Number(stance?.depends ?? 0))}
        dominant={dominant}
        mode={cleanText(stance?.mode)}
        takes={Number.isFinite(Number(stance?.takes)) ? Number(stance?.takes) : undefined}
      />
    );
  }

  return (
    <ShareCardView
      score={Math.round(shared.score ?? 0)}
      name={cleanText(shared.display_name)}
    />
  );
}
