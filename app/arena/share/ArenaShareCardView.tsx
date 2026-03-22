import Link from "next/link";

import { thineLinks } from "../../lib/thine-links";

// LEGACY SHARE ROUTE - query-param based, pre-Supabase.
// Will be deprecated once all share flows use Supabase-backed /share/[id].
// Do not add new features here. New share logic goes in /app/share/[score]/page.tsx.

type ArenaShareCardViewProps = {
  profile: string;
  name?: string;
  role?: string;
  agree: number;
  disagree: number;
  depends: number;
  dominant?: string;
  mode?: string;
  takes?: number;
};

export default function ArenaShareCardView({
  profile,
  name,
  role,
  agree,
  disagree,
  depends,
  dominant,
  mode,
  takes,
}: ArenaShareCardViewProps): React.JSX.Element {
  const displayName = name?.trim();
  const displayRole = role?.trim();
  const headline = profile || "Hot Takes Profile";
  const modeLabel = mode ? `${mode} set` : "Daily set";
  const takesLabel = typeof takes === "number" ? `${takes} takes` : "7 takes";

  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell share-page-shell">
        <main className="share-page-main">
          <section className="share-mini-card arena-share-mini-card">
            <div className="share-mini-orb share-mini-orb-left" />
            <div className="share-mini-orb share-mini-orb-right" />

            <div className="share-mini-header">
              <div className="share-mini-brand">
                <span className="share-mini-brand-name">Thine</span>
                <span className="share-mini-brand-meta">Hot Takes Arena</span>
                {displayName ? (
                  <span className="share-mini-name">For {displayName}</span>
                ) : null}
                {displayRole ? (
                  <span className="share-mini-role">{displayRole}</span>
                ) : null}
              </div>
              <span className="share-mini-badge">Shared profile</span>
            </div>

            <div className="share-mini-hero">
              <div className="share-mini-score-panel arena-share-profile-panel">
                <span className="section-eyebrow">Thinking profile</span>
                <h1 className="arena-share-mini-title">{headline}</h1>
                <p className="arena-share-mini-copy">
                  Your stance mix across today&apos;s takes.
                </p>
              </div>

              <div className="share-mini-tier-panel arena-share-mix-panel">
                <span className="section-eyebrow">Stance mix</span>
                <div className="arena-share-mix-grid">
                  <div className="arena-share-mix-item">
                    <span>Agree</span>
                    <strong>{agree}%</strong>
                  </div>
                  <div className="arena-share-mix-item">
                    <span>Disagree</span>
                    <strong>{disagree}%</strong>
                  </div>
                  <div className="arena-share-mix-item">
                    <span>Depends</span>
                    <strong>{depends}%</strong>
                  </div>
                </div>
                <div className="share-mini-chip-row arena-share-chip-row">
                  {dominant ? (
                    <span className="chip">Dominant: {dominant}</span>
                  ) : null}
                  <span className="chip">
                    {modeLabel} · {takesLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="share-mini-footer">
              <p className="share-mini-footer-copy">
                Play Hot Takes Arena and see how your profile stacks up.
              </p>

              <div className="share-mini-actions">
                <Link href="/arena" className="btn-primary">
                  Play Hot Takes Arena
                </Link>
                <Link href="/quiz" className="btn-secondary">
                  Take the Diagnostic
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
