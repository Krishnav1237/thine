import Link from "next/link";

import { MAX_SCORE, getTier } from "../data/questions";
import { thineLinks } from "../lib/thine-links";

export default function ShareCardView({ score }: { score: number }) {
  const tier = getTier(score);

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
                <p className="share-mini-score-copy">Public scorecard.</p>
              </div>

              <div className="share-mini-tier-panel">
                <span className="section-eyebrow">Tier</span>
                <h1 className="share-mini-tier-name">{tier.name}</h1>
                <p className="share-mini-tier-tagline">{tier.tagline}</p>

                <div className="share-mini-chip-row">
                  <span className="chip">Band {tier.min}-{tier.max}</span>
                  <span className="chip">10-question diagnostic</span>
                </div>
              </div>
            </div>

            <div className="share-mini-tier-strip" aria-label="Tier scale">
              <div className={`share-mini-tier-item ${score <= 10 ? "active" : ""}`}>
                <span>Flying Blind</span>
                <strong>0-10</strong>
              </div>
              <div
                className={`share-mini-tier-item ${
                  score >= 11 && score <= 20 ? "active" : ""
                }`}
              >
                <span>Surviving on Talent</span>
                <strong>11-20</strong>
              </div>
              <div className={`share-mini-tier-item ${score >= 21 ? "active" : ""}`}>
                <span>Operating Elite</span>
                <strong>21-30</strong>
              </div>
            </div>

            <div className="share-mini-signal-block">
              <span className="section-eyebrow">At a glance</span>
              <ul className="share-mini-signal-list">
                {tier.signals.slice(0, 2).map((signal) => (
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
