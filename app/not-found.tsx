import Link from "next/link";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell share-page-shell">
        <main className="share-page-main">
          <section className="report-card feedback-card">
            <div className="section-heading">
              <span className="section-eyebrow">Page not found</span>
              <h1 className="conversion-title">This trail goes cold here.</h1>
              <p className="section-copy">
                The page you were looking for is missing or the shared link has
                expired. Let&apos;s get you back to an active loop.
              </p>
            </div>

            <div className="conversion-actions">
              <Link href="/" className="btn-primary">
                Return Home
              </Link>
              <Link href="/quiz" className="btn-secondary">
                Take the Quiz
              </Link>
              <Link href="/arena" className="btn-secondary">
                Play Arena
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
