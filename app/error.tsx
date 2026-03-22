"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}): React.JSX.Element {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="page-container">
          <div className="bg-gradient" />
          <div className="bg-grid" />

          <div className="page-shell share-page-shell">
            <main className="share-page-main">
              <section className="report-card feedback-card">
                <div className="section-heading">
                  <span className="section-eyebrow">Something went wrong</span>
                  <h1 className="conversion-title">We hit an unexpected edge.</h1>
                  <p className="section-copy">
                    The page can be refreshed safely. Your local progress stays
                    intact, and you can jump back into the main flows anytime.
                  </p>
                </div>

                <div className="conversion-actions">
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </button>
                  <Link href="/" className="btn-secondary">
                    Return Home
                  </Link>
                  <Link href="/quiz" className="btn-secondary">
                    Take the Quiz
                  </Link>
                </div>
              </section>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
