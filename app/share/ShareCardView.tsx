import Link from "next/link";
import { MAX_SCORE } from "../data/questions";
import { getScoreBand, scoreBands } from "../lib/analyzeUser";
import { thineLinks } from "../lib/thine-links";

// LEGACY SHARE ROUTE - query-param based, pre-Supabase.
// Will be deprecated once all share flows use Supabase-backed /share/[id].
// Do not add new features here. New share logic goes in /app/share/[score]/page.tsx.

export default function ShareCardView({
  score,
  name,
}: {
  score: number;
  name?: string;
}): React.JSX.Element {
  const band = getScoreBand(score);
  const displayName = name?.trim();

  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell share-page-shell">
        <main className="share-page-main">
          <section className="share-mini-card">
            <div className="share-mini-orb share-mini-orb-left" />
            <div className="share-mini-orb share-mini-orb-right" />

            <div className="share-mini-header">
              <div className="share-mini-brand">
                <span className="share-mini-brand-name">Thine</span>
                <span className="share-mini-brand-meta">
                  Personal Intelligence Score
                </span>
                {displayName ? (
                  <span className="share-mini-name">For {displayName}</span>
                ) : null}
              </div>
              <span className="share-mini-badge">Shared scorecard</span>
            </div>

            <div className="share-mini-hero">
              <div className="share-mini-score-panel">
                <span className="score-label">Score</span>
                <div className="share-mini-score">
                  {score}
                  <span>/ {MAX_SCORE}</span>
                </div>
                <p className="share-mini-score-copy">
                  {displayName
                    ? `Public scorecard for ${displayName}.`
                    : "Public scorecard."}
                </p>
              </div>

              <div className="share-mini-tier-panel">
                <span className="section-eyebrow">Category</span>
                <h1 className="share-mini-tier-name">{band.name}</h1>
                <p className="share-mini-tier-tagline">{band.tagline}</p>

                <div className="share-mini-chip-row">
                  <span className="chip">
                    Band {band.min}-{band.max}
                  </span>
                  <span className="chip">Public scorecard</span>
                </div>
              </div>
            </div>

            <div className="share-mini-tier-strip" aria-label="Score bands">
              {scoreBands.map((item) => {
                const isActive = item.name === band.name;

                return (
                  <div
                    key={item.name}
                    className={`share-mini-tier-item ${isActive ? "active" : ""}`}
                  >
                    <span>{item.name}</span>
                    <strong>
                      {item.min}-{item.max}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="share-mini-signal-block">
              <span className="section-eyebrow">At a glance</span>
              <ul className="share-mini-signal-list">
                {band.highlights.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </div>

            <div className="share-mini-footer">
              <p className="share-mini-footer-copy">
                Take the diagnostic and get your own score.
              </p>

              <div className="share-mini-actions">
                <Link href="/quiz" className="btn-primary">
                  Get Your Score
                </Link>
                <Link href="/arena" className="btn-secondary">
                  Play Hot Takes Arena
                </Link>
                <a
                  href={thineLinks.share}
                  className="btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit Thine
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
