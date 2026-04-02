import Link from "next/link";

export const runtime = "edge";

import AuthPromptCard from "../components/auth/AuthPromptCard";
import BrandHeader from "../components/BrandHeader";
import { getSupabaseAdminClient, getSupabaseServerClient } from "../lib/supabase/server";
import type { ProfileRow, RankTier } from "../lib/supabase/types";

type TabKey = "today" | "week" | "all";

type LeaderboardRow = {
  rank: number;
  id: string;
  displayName: string;
  piScore: number;
  currentStreak: number;
  totalXP: number;
  rankTier: RankTier;
  periodXP?: number;
};

const TAB_LABELS: Record<TabKey, string> = {
  today: "Today",
  week: "This Week",
  all: "All Time",
};

function clampTier(value?: string | null): RankTier {
  if (
    value === "silver" ||
    value === "gold" ||
    value === "platinum" ||
    value === "diamond"
  ) {
    return value;
  }

  return "bronze";
}

function displayNameForProfile(profile: ProfileRow) {
  return (
    profile.display_name?.trim() ||
    profile.username?.trim() ||
    "Anonymous thinker"
  );
}

async function loadAllProfiles() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      profiles: [] as ProfileRow[],
      hasSupabase: false,
    };
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("pi_score", { ascending: false })
    .limit(300);

  return {
    profiles: (data ?? []) as ProfileRow[],
    hasSupabase: true,
  };
}

async function loadCurrentUserId() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

async function loadTimeboxedEntries(
  tab: Exclude<TabKey, "all">,
  profiles: ProfileRow[]
) {
  const admin = getSupabaseAdminClient();

  if (!admin) {
    return null;
  }

  const since = new Date();
  if (tab === "today") {
    since.setHours(0, 0, 0, 0);
  } else {
    since.setDate(since.getDate() - 7);
  }

  const sinceIso = since.toISOString();
  const [quizResponse, arenaResponse] = await Promise.all([
    admin
      .from("quiz_attempts")
      .select("user_id, xp_earned")
      .gte("created_at", sinceIso),
    admin
      .from("arena_attempts")
      .select("user_id, xp_earned")
      .gte("created_at", sinceIso),
  ]);

  const totals = new Map<string, number>();
  const quizAttempts = (quizResponse.data ?? []) as Array<{
    user_id: string | null;
    xp_earned: number | null;
  }>;
  const arenaAttempts = (arenaResponse.data ?? []) as Array<{
    user_id: string | null;
    xp_earned: number | null;
  }>;

  quizAttempts.forEach((attempt) => {
    if (!attempt.user_id) {
      return;
    }
    totals.set(
      attempt.user_id,
      (totals.get(attempt.user_id) ?? 0) + (attempt.xp_earned ?? 0)
    );
  });

  arenaAttempts.forEach((attempt) => {
    if (!attempt.user_id) {
      return;
    }
    totals.set(
      attempt.user_id,
      (totals.get(attempt.user_id) ?? 0) + (attempt.xp_earned ?? 0)
    );
  });

  if (!totals.size) {
    return [];
  }

  return profiles
    .map((profile) => ({
      id: profile.id,
      displayName: displayNameForProfile(profile),
      piScore: Math.round(profile.pi_score ?? 0),
      currentStreak: profile.current_streak ?? 0,
      totalXP: profile.total_xp ?? 0,
      rankTier: clampTier(profile.ranktier),
      periodXP: totals.get(profile.id) ?? 0,
    }))
    .filter((entry) => entry.periodXP > 0)
    .sort((a, b) => {
      if (b.periodXP !== a.periodXP) {
        return b.periodXP - a.periodXP;
      }
      return b.piScore - a.piScore;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

async function loadLeaderboardEntries(tab: TabKey) {
  const { profiles, hasSupabase } = await loadAllProfiles();
  const currentUserId = await loadCurrentUserId();

  const baseEntries: LeaderboardRow[] = profiles.map((profile, index) => ({
    rank: index + 1,
    id: profile.id,
    displayName: displayNameForProfile(profile),
    piScore: Math.round(profile.pi_score ?? 0),
    currentStreak: profile.current_streak ?? 0,
    totalXP: profile.total_xp ?? 0,
    rankTier: clampTier(profile.ranktier),
  }));

  const rankedEntries =
    tab === "all"
      ? baseEntries
      : ((await loadTimeboxedEntries(tab, profiles)) ?? baseEntries);

  const topEntries = rankedEntries.slice(0, 100);
  const currentUserEntry = currentUserId
    ? rankedEntries.find((entry) => entry.id === currentUserId) ?? null
    : null;

  return {
    entries: topEntries,
    currentUserEntry,
    currentUserId,
    hasSupabase,
    usedFallback: tab !== "all" && rankedEntries === baseEntries,
  };
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const tab: TabKey =
    rawTab === "today" || rawTab === "week" || rawTab === "all"
      ? rawTab
      : "all";
  const { entries, currentUserEntry, currentUserId, hasSupabase, usedFallback } =
    await loadLeaderboardEntries(tab);

  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell report-page-shell">
        <BrandHeader />

        <main className="leaderboard-main">
          <section className="report-card leaderboard-card">
            <div className="section-heading">
              <span className="section-eyebrow">Leaderboard</span>
              <h1 className="conversion-title">See who is compounding context.</h1>
              <p className="section-copy">
                Rank by personal intelligence score, streak, and XP momentum.
              </p>
            </div>

            <div className="leaderboard-tabs" role="tablist" aria-label="Leaderboard tabs">
              {(Object.keys(TAB_LABELS) as TabKey[]).map((tabKey) => (
                <Link
                  key={tabKey}
                  href={`/leaderboard?tab=${tabKey}`}
                  className={`leaderboard-tab ${tabKey === tab ? "is-active" : ""}`}
                >
                  {TAB_LABELS[tabKey]}
                </Link>
              ))}
            </div>

            {!hasSupabase ? (
              <div className="leaderboard-empty">
                Supabase is not configured yet, so the public leaderboard is waiting
                on live accounts.
              </div>
            ) : null}

            {usedFallback ? (
              <p className="leaderboard-note">
                Weekly and daily tabs fall back to all-time ranking until server-side
                attempt queries are available.
              </p>
            ) : null}

            <div className="leaderboard-table">
              <div className="leaderboard-row leaderboard-row-head">
                <span>#</span>
                <span>Name</span>
                <span>PI Score</span>
                <span>Streak</span>
                <span>XP</span>
                <span>Tier</span>
              </div>

              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`leaderboard-row ${
                    entry.id === currentUserId ? "is-current-user" : ""
                  }`}
                >
                  <span data-label="Rank">#{entry.rank}</span>
                  <span data-label="Name">{entry.displayName}</span>
                  <span data-label="PI Score">{entry.piScore}</span>
                  <span data-label="Streak">{entry.currentStreak} 🔥</span>
                  <span data-label="XP">
                    {tab === "all" ? entry.totalXP : entry.periodXP ?? 0}
                  </span>
                  <span data-label="Tier">
                    <span className={`rank-pill is-${entry.rankTier}`}>
                      {entry.rankTier}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {currentUserEntry && currentUserEntry.rank > 100 ? (
              <div className="leaderboard-footer-row">
                <span>Your rank</span>
                <strong>
                  #{currentUserEntry.rank} · {currentUserEntry.displayName}
                </strong>
              </div>
            ) : null}
          </section>

          <AuthPromptCard sourcePage="leaderboard" xpEarned={0} />
        </main>
      </div>
    </div>
  );
}
