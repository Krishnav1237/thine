import Link from "next/link";

import BrandHeader from "../components/BrandHeader";
import { getSupabaseServerClient } from "../lib/supabase/server";
import type { ProfileRow } from "../lib/supabase/types";

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

function formatDateLabel(value?: string | null) {
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

async function loadDashboardState() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      userId: null,
      profile: null as ProfileRow | null,
      quizzes: [] as QuizAttemptSummary[],
      arenas: [] as ArenaAttemptSummary[],
      hasSupabase: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      profile: null as ProfileRow | null,
      quizzes: [] as QuizAttemptSummary[],
      arenas: [] as ArenaAttemptSummary[],
      hasSupabase: true,
    };
  }

  const [profileResponse, quizResponse, arenaResponse] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("quiz_attempts")
      .select("id, normalized_score, score_band, sessionmode, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("arena_attempts")
      .select("id, thinking_profile, sessionmode, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    userId: user.id,
    profile: (profileResponse.data ?? null) as ProfileRow | null,
    quizzes: ((quizResponse.data ?? []) as QuizAttemptSummary[]),
    arenas: ((arenaResponse.data ?? []) as ArenaAttemptSummary[]),
    hasSupabase: true,
  };
}

export default async function DashboardPage() {
  const { userId, profile, quizzes, arenas, hasSupabase } =
    await loadDashboardState();

  const displayName =
    profile?.display_name?.trim() ||
    profile?.username?.trim() ||
    "Your Dashboard";

  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell report-page-shell">
        <BrandHeader />

        <main className="dashboard-main">
          {userId && profile ? (
            <>
              <section className="report-card dashboard-hero-card">
                <div className="dashboard-hero-copy">
                  <span className="section-eyebrow">Dashboard</span>
                  <h1 className="conversion-title">
                    Welcome back, {displayName}.
                  </h1>
                  <p className="section-copy">
                    This is your home for score history, streak momentum, and the
                    signals you&apos;ve been compounding across Thine.
                  </p>
                </div>

                <div className="dashboard-stat-grid">
                  <div className="dashboard-stat-card">
                    <span className="dashboard-stat-label">PI Score</span>
                    <strong>{Math.round(profile.pi_score ?? 0)}</strong>
                  </div>
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
              </section>

              <section className="report-card dashboard-actions-card">
                <div className="section-heading">
                  <span className="section-eyebrow">Quick actions</span>
                  <h2 className="conversion-title">Pick your next loop.</h2>
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
              </section>

              <section className="dashboard-history-grid">
                <section className="report-card dashboard-history-card">
                  <div className="section-heading">
                    <span className="section-eyebrow">Recent quizzes</span>
                    <h2 className="conversion-title">Diagnostic attempts</h2>
                  </div>

                  {quizzes.length > 0 ? (
                    <div className="dashboard-list">
                      {quizzes.map((attempt) => (
                        <div key={attempt.id} className="dashboard-list-row">
                          <div>
                            <strong>{attempt.normalized_score}/100</strong>
                            <span>
                              {attempt.score_band ?? "Unbanded"} ·{" "}
                              {attempt.sessionmode ?? "quick"}
                            </span>
                          </div>
                          <span>{formatDateLabel(attempt.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="section-copy">
                      No synced quiz attempts yet. Take the diagnostic and we&apos;ll
                      start building your history here.
                    </p>
                  )}
                </section>

                <section className="report-card dashboard-history-card">
                  <div className="section-heading">
                    <span className="section-eyebrow">Recent arena</span>
                    <h2 className="conversion-title">Thinking profiles</h2>
                  </div>

                  {arenas.length > 0 ? (
                    <div className="dashboard-list">
                      {arenas.map((attempt) => (
                        <div key={attempt.id} className="dashboard-list-row">
                          <div>
                            <strong>
                              {attempt.thinking_profile ?? "Hot Takes Arena"}
                            </strong>
                            <span>{attempt.sessionmode ?? "daily"}</span>
                          </div>
                          <span>{formatDateLabel(attempt.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="section-copy">
                      No synced arena sessions yet. Run a set and your stance
                      history will appear here.
                    </p>
                  )}
                </section>
              </section>
            </>
          ) : (
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
                    ? "Once you sign in, this page becomes your command center for history, streaks, XP, and recent sessions."
                    : "The anonymous experience still works, but dashboard sync needs Supabase auth configured first."}
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
          )}
        </main>
      </div>
    </div>
  );
}
