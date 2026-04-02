import { unstable_cache } from "next/cache";
import Link from "next/link";

import AuthPromptCard from "../components/auth/AuthPromptCard";
import BrandHeader from "../components/BrandHeader";
import {
  getSupabaseAdminClient,
  getSupabasePublicClient,
  getSupabaseServerClient,
} from "../lib/supabase/server";
import type { ProfileRow, RankTier } from "../lib/supabase/types";

type TabKey = "today" | "week" | "all";

type LeaderboardProfile = Pick<
  ProfileRow,
  "id" | "display_name" | "username" | "pi_score" | "current_streak" | "total_xp" | "ranktier"
>;

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

const PROFILE_COLUMNS =
  "id, display_name, username, pi_score, current_streak, total_xp, ranktier";

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

function displayNameForProfile(profile: LeaderboardProfile): string {
  return (
    profile.display_name?.trim() ||
    profile.username?.trim() ||
    "Anonymous thinker"
  );
}

function mapProfileToEntry(
  profile: LeaderboardProfile,
  rank: number,
  periodXP?: number
): LeaderboardRow {
  return {
    rank,
    id: profile.id,
    displayName: displayNameForProfile(profile),
    piScore: Math.round(profile.pi_score ?? 0),
    currentStreak: profile.current_streak ?? 0,
    totalXP: profile.total_xp ?? 0,
    rankTier: clampTier(profile.ranktier),
    periodXP,
  };
}

const loadAllProfilesCached = unstable_cache(
  async (): Promise<{ profiles: LeaderboardProfile[]; hasSupabase: boolean }> => {
    const supabase = getSupabasePublicClient();

    if (!supabase) {
      return {
        profiles: [],
        hasSupabase: false,
      };
    }

    const { data } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .order("pi_score", { ascending: false })
      .limit(140);

    return {
      profiles: (data ?? []) as LeaderboardProfile[],
      hasSupabase: true,
    };
  },
  ["leaderboard:all-time:profiles"],
  { revalidate: 120 }
);

const loadWeekEntriesCached = unstable_cache(
  async (): Promise<LeaderboardRow[] | null> => {
    const admin = getSupabaseAdminClient();
    const supabase = getSupabasePublicClient();

    if (!admin || !supabase) {
      return null;
    }

    const since = new Date();
    since.setDate(since.getDate() - 7);
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

    [...quizAttempts, ...arenaAttempts].forEach((attempt) => {
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

    const ids = Array.from(totals.keys());
    const { data: profiles } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .in("id", ids);

    return ((profiles ?? []) as LeaderboardProfile[])
      .map((profile) => ({
        profile,
        periodXP: totals.get(profile.id) ?? 0,
      }))
      .filter((entry) => entry.periodXP > 0)
      .sort((left, right) => {
        if (right.periodXP !== left.periodXP) {
          return right.periodXP - left.periodXP;
        }

        return (right.profile.pi_score ?? 0) - (left.profile.pi_score ?? 0);
      })
      .map((entry, index) =>
        mapProfileToEntry(entry.profile, index + 1, entry.periodXP)
      );
  },
  ["leaderboard:week"],
  { revalidate: 60 }
);

const loadTodayEntriesCached = unstable_cache(
  async (): Promise<LeaderboardRow[] | null> => {
    const admin = getSupabaseAdminClient();
    const supabase = getSupabasePublicClient();

    if (!admin || !supabase) {
      return null;
    }

    const since = new Date();
    since.setHours(0, 0, 0, 0);
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

    [...quizAttempts, ...arenaAttempts].forEach((attempt) => {
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

    const ids = Array.from(totals.keys());
    const { data: profiles } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .in("id", ids);

    return ((profiles ?? []) as LeaderboardProfile[])
      .map((profile) => ({
        profile,
        periodXP: totals.get(profile.id) ?? 0,
      }))
      .filter((entry) => entry.periodXP > 0)
      .sort((left, right) => {
        if (right.periodXP !== left.periodXP) {
          return right.periodXP - left.periodXP;
        }

        return (right.profile.pi_score ?? 0) - (left.profile.pi_score ?? 0);
      })
      .map((entry, index) =>
        mapProfileToEntry(entry.profile, index + 1, entry.periodXP)
      );
  },
  ["leaderboard:today"],
  { revalidate: 60 }
);

async function loadViewerState(): Promise<{
  currentUserId: string | null;
  currentProfile: LeaderboardProfile | null;
}> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      currentUserId: null,
      currentProfile: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      currentUserId: null,
      currentProfile: null,
    };
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  return {
    currentUserId: user.id,
    currentProfile: (currentProfile ?? null) as LeaderboardProfile | null,
  };
}

async function loadCurrentUserAllTimeRank(
  currentProfile: LeaderboardProfile | null
): Promise<number | null> {
  if (!currentProfile) {
    return null;
  }

  const supabase = getSupabasePublicClient();

  if (!supabase) {
    return null;
  }

  const { count } = await supabase
    .from("profiles")
    .select("id", { head: true, count: "exact" })
    .gt("pi_score", currentProfile.pi_score ?? 0);

  return typeof count === "number" ? count + 1 : null;
}

async function loadLeaderboardEntries(tab: TabKey): Promise<{
  entries: LeaderboardRow[];
  currentUserEntry: LeaderboardRow | null;
  currentUserId: string | null;
  hasSupabase: boolean;
  usedFallback: boolean;
}> {
  const viewerStatePromise = loadViewerState();

  if (tab === "all") {
    const [{ profiles, hasSupabase }, viewer] = await Promise.all([
      loadAllProfilesCached(),
      viewerStatePromise,
    ]);

    const rankedEntries = profiles.map((profile, index) =>
      mapProfileToEntry(profile, index + 1)
    );
    const topEntries = rankedEntries.slice(0, 100);
    let currentUserEntry = viewer.currentUserId
      ? rankedEntries.find((entry) => entry.id === viewer.currentUserId) ?? null
      : null;

    if (!currentUserEntry && viewer.currentProfile) {
      const rank = await loadCurrentUserAllTimeRank(viewer.currentProfile);
      if (rank) {
        currentUserEntry = mapProfileToEntry(viewer.currentProfile, rank);
      }
    }

    return {
      entries: topEntries,
      currentUserEntry,
      currentUserId: viewer.currentUserId,
      hasSupabase,
      usedFallback: false,
    };
  }

  const [cachedEntries, viewer] = await Promise.all([
    tab === "today" ? loadTodayEntriesCached() : loadWeekEntriesCached(),
    viewerStatePromise,
  ]);

  if (!cachedEntries) {
    const [{ profiles, hasSupabase }] = await Promise.all([loadAllProfilesCached()]);
    const fallbackEntries = profiles.map((profile, index) =>
      mapProfileToEntry(profile, index + 1)
    );

    return {
      entries: fallbackEntries.slice(0, 100),
      currentUserEntry: viewer.currentUserId
        ? fallbackEntries.find((entry) => entry.id === viewer.currentUserId) ?? null
        : null,
      currentUserId: viewer.currentUserId,
      hasSupabase,
      usedFallback: true,
    };
  }

  return {
    entries: cachedEntries.slice(0, 100),
    currentUserEntry: viewer.currentUserId
      ? cachedEntries.find((entry) => entry.id === viewer.currentUserId) ?? null
      : null,
    currentUserId: viewer.currentUserId,
    hasSupabase: true,
    usedFallback: false,
  };
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const rawTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const tab: TabKey =
    rawTab === "today" || rawTab === "week" || rawTab === "all"
      ? rawTab
      : "all";
  const { entries, currentUserEntry, currentUserId, hasSupabase, usedFallback } =
    await loadLeaderboardEntries(tab);
  const featuredEntries = entries.slice(0, 3);
  const boardLead = featuredEntries[0] ?? null;

  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell report-page-shell">
        <BrandHeader />

        <main className="leaderboard-main">
          <section className="report-card leaderboard-hero-card">
            <div className="leaderboard-hero-copy">
              <span className="section-eyebrow">Leaderboard</span>
              <h1 className="conversion-title">See who is compounding context.</h1>
              <p className="section-copy">
                PI score is each person&apos;s latest synced diagnostic score out of
                100. Streak and XP show who is sustaining that quality over time.
              </p>
            </div>

            <div className="leaderboard-hero-stats">
              <div className="leaderboard-hero-stat">
                <span className="dashboard-stat-label">Live board</span>
                <strong>{TAB_LABELS[tab]}</strong>
              </div>
              <div className="leaderboard-hero-stat">
                <span className="dashboard-stat-label">Top profile</span>
                <strong>
                  {boardLead
                    ? `${boardLead.displayName} · ${boardLead.piScore}/100`
                    : "Waiting for the first score"}
                </strong>
              </div>
              <div className="leaderboard-hero-stat">
                <span className="dashboard-stat-label">Your standing</span>
                <strong>
                  {currentUserEntry
                    ? `#${currentUserEntry.rank} · ${currentUserEntry.displayName}`
                    : "Sign in to track your rank"}
                </strong>
              </div>
            </div>
          </section>

          <section className="report-card leaderboard-card">
            <div className="leaderboard-card-head">
              <div className="section-heading">
                <span className="section-eyebrow">Ranking table</span>
                <h2 className="conversion-title">All ranked profiles in one view.</h2>
                <p className="section-copy">
                  Compare long-term score quality or short-term momentum without
                  waiting on noisy, heavy dashboards.
                </p>
              </div>

              <div
                className="leaderboard-tabs"
                role="tablist"
                aria-label="Leaderboard tabs"
              >
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
                attempt aggregation is available.
              </p>
            ) : null}

            {featuredEntries.length > 0 ? (
              <section className="leaderboard-featured-grid">
                {featuredEntries.map((entry) => (
                  <article
                    key={entry.id}
                    className={`leaderboard-featured-card ${
                      entry.id === currentUserId ? "is-current-user" : ""
                    }`}
                  >
                    <div className="leaderboard-featured-head">
                      <span className="section-eyebrow">#{entry.rank}</span>
                      <span className={`rank-pill is-${entry.rankTier}`}>{entry.rankTier}</span>
                    </div>
                    <h3 className="leaderboard-featured-name">{entry.displayName}</h3>
                    <div className="leaderboard-featured-stats">
                      <div>
                        <span>PI score</span>
                        <strong>{entry.piScore}</strong>
                      </div>
                      <div>
                        <span>Streak</span>
                        <strong>{entry.currentStreak} 🔥</strong>
                      </div>
                      <div>
                        <span>{tab === "all" ? "XP" : "Period XP"}</span>
                        <strong>{tab === "all" ? entry.totalXP : entry.periodXP ?? 0}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
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
                    <span className={`rank-pill is-${entry.rankTier}`}>{entry.rankTier}</span>
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
