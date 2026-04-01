"use client";

type ArenaCountSet = {
  agree: number;
  depends: number;
  disagree: number;
};

type MatchData = {
  displayName: string | null;
  dominantStance: string | null;
  thinkingProfile: string | null;
  agreeCount: number;
  dependsCount: number;
  disagreeCount: number;
  completedAt: string | null;
};

function toPercentages(counts: ArenaCountSet): ArenaCountSet {
  const total = counts.agree + counts.depends + counts.disagree;

  if (total <= 0) {
    return { agree: 0, depends: 0, disagree: 0 };
  }

  return {
    agree: Math.round((counts.agree / total) * 100),
    depends: Math.round((counts.depends / total) * 100),
    disagree: Math.round((counts.disagree / total) * 100),
  };
}

function formatCompletedAt(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export default function MatchCard({
  userName,
  userProfile,
  userCounts,
  match,
}: {
  userName?: string;
  userProfile: string;
  userCounts: ArenaCountSet;
  match: MatchData;
}): React.JSX.Element {
  const userPercents = toPercentages(userCounts);
  const matchPercents = toPercentages({
    agree: match.agreeCount,
    depends: match.dependsCount,
    disagree: match.disagreeCount,
  });
  const matchDate = formatCompletedAt(match.completedAt);

  return (
    <section className="match-card">
      <div className="section-heading">
        <span className="section-eyebrow">Your match</span>
        <h2 className="conversion-title">
          {match.thinkingProfile && match.thinkingProfile !== userProfile
            ? `You're ${userProfile}. They're ${match.thinkingProfile}.`
            : "A recent player with a comparable signal."}
        </h2>
        <p className="section-copy">
          Asynchronous matching keeps the comparison social without needing live
          rooms or lobbies.
        </p>
      </div>

      <div className="match-card-grid">
        <div className="match-card-panel">
          <div className="match-card-head">
            <span className="match-card-label">You</span>
            <strong>{userName?.trim() || "Anonymous"}</strong>
          </div>
          <div className="match-card-profile">{userProfile}</div>
          <div className="match-card-bars">
            <div className="match-card-row">
              <span>Agree</span>
              <div className="match-card-track" aria-hidden="true">
                <div
                  className="match-card-fill is-agree"
                  style={{ width: `${userPercents.agree}%` }}
                />
              </div>
              <strong>{userCounts.agree}</strong>
            </div>
            <div className="match-card-row">
              <span>Depends</span>
              <div className="match-card-track" aria-hidden="true">
                <div
                  className="match-card-fill is-depends"
                  style={{ width: `${userPercents.depends}%` }}
                />
              </div>
              <strong>{userCounts.depends}</strong>
            </div>
            <div className="match-card-row">
              <span>Disagree</span>
              <div className="match-card-track" aria-hidden="true">
                <div
                  className="match-card-fill is-disagree"
                  style={{ width: `${userPercents.disagree}%` }}
                />
              </div>
              <strong>{userCounts.disagree}</strong>
            </div>
          </div>
        </div>

        <div className="match-card-panel">
          <div className="match-card-head">
            <span className="match-card-label">Match</span>
            <strong>{match.displayName?.trim() || "Anonymous"}</strong>
          </div>
          <div className="match-card-profile">
            {match.thinkingProfile || "Unlabeled profile"}
          </div>
          <div className="match-card-bars">
            <div className="match-card-row">
              <span>Agree</span>
              <div className="match-card-track" aria-hidden="true">
                <div
                  className="match-card-fill is-agree"
                  style={{ width: `${matchPercents.agree}%` }}
                />
              </div>
              <strong>{match.agreeCount}</strong>
            </div>
            <div className="match-card-row">
              <span>Depends</span>
              <div className="match-card-track" aria-hidden="true">
                <div
                  className="match-card-fill is-depends"
                  style={{ width: `${matchPercents.depends}%` }}
                />
              </div>
              <strong>{match.dependsCount}</strong>
            </div>
            <div className="match-card-row">
              <span>Disagree</span>
              <div className="match-card-track" aria-hidden="true">
                <div
                  className="match-card-fill is-disagree"
                  style={{ width: `${matchPercents.disagree}%` }}
                />
              </div>
              <strong>{match.disagreeCount}</strong>
            </div>
          </div>
          <div className="match-card-meta">
            {match.dominantStance ? `Dominant stance: ${match.dominantStance}` : null}
            {matchDate ? ` · Completed ${matchDate}` : null}
          </div>
        </div>
      </div>
    </section>
  );
}
