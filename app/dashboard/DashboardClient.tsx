"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Skeleton from "../components/shared/Skeleton";
import { useAuth } from "../hooks/useAuth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase/client";

type QuizAttemptSummary = {
  id: string;
  normalized_score: number;
  score_band: string | null;
  sessionmode: "quick" | "deep" | null;
  created_at: string | null;
};

type ArenaAttemptSummary = {
  id: string;
  thinking_profile: string | null;
  sessionmode: "daily" | "avid" | null;
  created_at: string | null;
};

type DashboardCache = {
  quizzes: QuizAttemptSummary[];
  arenas: ArenaAttemptSummary[];
  cachedAt: string;
};

type DashboardActivity = {
  id: string;
  type: "quiz" | "arena";
  title: string;
  detail: string;
  createdAt: string | null;
};

type RemoteState = "idle" | "loading" | "ready" | "fallback";

const DASHBOARD_CACHE_PREFIX = "thine-dashboard-cache:";
const DASHBOARD_FALLBACK_DELAY_MS = 900;

function formatDateLabel(value?: string | null): string {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function readDashboardCache(userId: string): DashboardCache | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(`${DASHBOARD_CACHE_PREFIX}${userId}`);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DashboardCache;
  } catch {
    return null;
  }
}

function writeDashboardCache(userId: string, cache: DashboardCache): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${DASHBOARD_CACHE_PREFIX}${userId}`, JSON.stringify(cache));
}

function buildActivityFeed(
  quizzes: QuizAttemptSummary[],
  arenas: ArenaAttemptSummary[]
): DashboardActivity[] {
  return [
    ...quizzes.map((attempt) => ({
      id: attempt.id,
      type: "quiz" as const,
      title: `${attempt.normalized_score}/100 · ${attempt.score_band ?? "Unbanded"}`,
      detail: `${attempt.sessionmode ?? "quick"} diagnostic`,
      createdAt: attempt.created_at,
    })),
    ...arenas.map((attempt) => ({
      id: attempt.id,
      type: "arena" as const,
      title: attempt.thinking_profile ?? "Hot Takes Arena",
      detail: `${attempt.sessionmode ?? "daily"} arena set`,
      createdAt: attempt.created_at,
    })),
  ]
    .sort((left, right) => {
      return (
        new Date(right.createdAt ?? 0).getTime() -
        new Date(left.createdAt ?? 0).getTime()
      );
    })
    .slice(0, 6);
}

export default function DashboardClient(): React.JSX.Element {
  const { user, profile, loading, isLoggedIn } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizAttemptSummary[]>([]);
  const [arenas, setArenas] = useState<ArenaAttemptSummary[]>([]);
  const [remoteState, setRemoteState] = useState<RemoteState>("idle");

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const cached = readDashboardCache(user.id);

    if (!supabase) {
      const timer = window.setTimeout(() => {
        setQuizzes(cached?.quizzes ?? []);
        setArenas(cached?.arenas ?? []);
        setRemoteState(cached ? "fallback" : "ready");
      }, 0);

      return () => {
        window.clearTimeout(timer);
      };
    }

    let active = true;

    const fallbackTimer = window.setTimeout(() => {
      if (!active || !cached) {
        return;
      }

      setQuizzes(cached.quizzes);
      setArenas(cached.arenas);
      setRemoteState("fallback");
    }, DASHBOARD_FALLBACK_DELAY_MS);

    void Promise.all([
      supabase
        .from("quiz_attempts")
        .select("id, normalized_score, score_band, sessionmode, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("arena_attempts")
        .select("id, thinking_profile, sessionmode, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4),
    ])
      .then(([quizResponse, arenaResponse]) => {
        if (!active) {
          return;
        }

        const nextQuizzes = (quizResponse.data ?? []) as QuizAttemptSummary[];
        const nextArenas = (arenaResponse.data ?? []) as ArenaAttemptSummary[];

        setQuizzes(nextQuizzes);
        setArenas(nextArenas);
        writeDashboardCache(user.id, {
          quizzes: nextQuizzes,
          arenas: nextArenas,
          cachedAt: new Date().toISOString(),
        });
        setRemoteState("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        if (cached) {
          setQuizzes(cached.quizzes);
          setArenas(cached.arenas);
          setRemoteState("fallback");
          return;
        }

        setRemoteState("ready");
      })
      .finally(() => {
        window.clearTimeout(fallbackTimer);
      });

    return () => {
      active = false;
      window.clearTimeout(fallbackTimer);
    };
  }, [user?.id]);

  const displayName =
    profile?.display_name?.trim() ||
    profile?.username?.trim() ||
    user?.email?.split("@")[0] ||
    "Your Dashboard";
  const visibleQuizzes = useMemo(
    () => (user?.id ? quizzes : []),
    [quizzes, user?.id]
  );
  const visibleArenas = useMemo(
    () => (user?.id ? arenas : []),
    [arenas, user?.id]
  );
  const latestQuiz = visibleQuizzes[0] ?? null;
  const latestArena = visibleArenas[0] ?? null;
  const piScore = Math.round(profile?.pi_score ?? latestQuiz?.normalized_score ?? 0);
  const hasSupabase = isSupabaseConfigured();
  const shouldShowSignedInState = isLoggedIn && profile;
  const resolvedRemoteState =
    user?.id && remoteState === "idle" ? "loading" : user?.id ? remoteState : "idle";
  const activityFeed = useMemo(
    () => buildActivityFeed(visibleQuizzes, visibleArenas),
    [visibleArenas, visibleQuizzes]
  );
  const latestQuizLabel = latestQuiz
    ? `${latestQuiz.normalized_score}/100 · ${latestQuiz.score_band ?? "Unbanded"}`
    : resolvedRemoteState === "loading"
      ? "Syncing your latest diagnostic…"
      : "No synced attempts yet";
  const latestArenaLabel = latestArena
    ? latestArena.thinking_profile ?? "Hot Takes Arena"
    : resolvedRemoteState === "loading"
      ? "Syncing your latest arena…"
      : "No arena runs saved yet";
  const activityNote =
    resolvedRemoteState === "fallback"
      ? "Showing recent cached activity while live sync catches up."
      : resolvedRemoteState === "loading"
        ? "Syncing recent activity…"
        : "Recent activity stays in sync with your account.";

  if (loading) {
    return (
      <main className="dashboard-main">
        <section className="report-card dashboard-hero-card">
          <div className="dashboard-hero-copy">
            <Skeleton className="skeleton-kicker" />
            <Skeleton className="skeleton-title" />
            <Skeleton className="skeleton-copy" />
            <div className="dashboard-hero-highlights">
              <Skeleton className="skeleton-row" />
              <Skeleton className="skeleton-row" />
            </div>
            <div className="dashboard-actions-row">
              <Skeleton className="skeleton-button" />
              <Skeleton className="skeleton-button" />
              <Skeleton className="skeleton-button" />
            </div>
          </div>

          <div className="dashboard-summary-rail">
            <div className="dashboard-score-panel">
              <Skeleton className="skeleton-kicker skeleton-compact" />
              <Skeleton className="skeleton-metric" />
              <Skeleton className="skeleton-copy" />
            </div>
            <div className="dashboard-stat-grid">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="dashboard-stat-card">
                  <Skeleton className="skeleton-kicker skeleton-compact" />
                  <Skeleton className="skeleton-metric" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="report-card dashboard-activity-card">
          <div className="section-heading">
            <Skeleton className="skeleton-kicker" />
            <Skeleton className="skeleton-subtitle" />
          </div>
          <div className="skeleton-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="skeleton-row" />
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (!shouldShowSignedInState) {
    return (
      <main className="dashboard-main">
        <section className="report-card dashboard-empty-card">
          <div className="section-heading">
            <span className="section-eyebrow">Dashboard</span>
            <h1 className="conversion-title">
              {hasSupabase
                ? "Log in to unlock your dashboard."
                : "Connect Supabase to unlock dashboards."}
            </h1>
            <p className="section-copy">
              {hasSupabase
                ? "Once you sign in, this becomes your clean home for PI score, streak, rank, and recent activity across Thine."
                : "Anonymous mode still works, but dashboard sync needs Supabase auth configured first."}
            </p>
          </div>

          <div className="dashboard-actions-row">
            <Link href="/quiz" className="btn-primary">
              Take the Diagnostic
            </Link>
            <Link href="/arena" className="btn-secondary">
              Play Arena
            </Link>
            <Link href="/leaderboard" className="btn-secondary">
              View Leaderboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-main">
      <section className="report-card dashboard-hero-card">
        <div className="dashboard-hero-copy">
          <span className="section-eyebrow">Dashboard</span>
          <h1 className="conversion-title">Welcome back, {displayName}.</h1>
          <p className="section-copy">
            Your latest diagnostic, momentum, and synced history in one place.
          </p>

          <div className="dashboard-hero-highlights">
            <div className="dashboard-inline-stat">
              <span>Latest diagnostic</span>
              <strong>{latestQuizLabel}</strong>
            </div>
            <div className="dashboard-inline-stat">
              <span>Latest arena</span>
              <strong>{latestArenaLabel}</strong>
            </div>
          </div>

          <div className="dashboard-actions-row">
            <Link href="/quiz" className="btn-primary">
              Take the Diagnostic
            </Link>
            <Link href="/arena" className="btn-secondary">
              Play Hot Takes Arena
            </Link>
            <Link href="/leaderboard" className="btn-secondary">
              View Leaderboard
            </Link>
          </div>
        </div>

        <div className="dashboard-summary-rail">
          <div className="dashboard-score-panel">
            <span className="section-eyebrow">PI score</span>
            <div className="dashboard-score-value">{piScore}</div>
            <p className="dashboard-score-copy">
              Your latest synced diagnostic score out of 100. It updates after a completed quiz is saved to your account.
            </p>
          </div>

          <div className="dashboard-stat-grid">
            <div className="dashboard-stat-card">
              <span className="dashboard-stat-label">Current streak</span>
              <strong>{profile.current_streak ?? 0} days</strong>
            </div>
            <div className="dashboard-stat-card">
              <span className="dashboard-stat-label">Total XP</span>
              <strong>{profile.total_xp ?? 0}</strong>
            </div>
            <div className="dashboard-stat-card">
              <span className="dashboard-stat-label">Rank tier</span>
              <strong className={`dashboard-tier is-${profile.ranktier ?? "bronze"}`}>
                {profile.ranktier ?? "bronze"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="report-card dashboard-activity-card">
        <div className="section-heading dashboard-activity-head">
          <div>
            <span className="section-eyebrow">Recent activity</span>
            <h2 className="conversion-title">Latest synced loops.</h2>
          </div>
          <p className="dashboard-activity-note">{activityNote}</p>
        </div>

        {resolvedRemoteState === "loading" && activityFeed.length === 0 ? (
          <div className="skeleton-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="skeleton-row" />
            ))}
          </div>
        ) : activityFeed.length > 0 ? (
          <div className="dashboard-activity-list">
            {activityFeed.map((item) => (
              <div key={`${item.type}:${item.id}`} className="dashboard-activity-row">
                <span className={`dashboard-activity-pill is-${item.type}`}>
                  {item.type === "quiz" ? "Diagnostic" : "Arena"}
                </span>
                <div className="dashboard-activity-main">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <span className="dashboard-activity-date">
                  {formatDateLabel(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="section-copy">
            No synced activity yet. Complete a diagnostic or arena session and this feed will populate automatically.
          </p>
        )}
      </section>
    </main>
  );
}
