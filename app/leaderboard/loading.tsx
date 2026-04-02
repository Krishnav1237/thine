import BrandHeader from "../components/BrandHeader";
import Skeleton from "../components/shared/Skeleton";

export default function Loading(): React.JSX.Element {
  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell report-page-shell">
        <BrandHeader />

        <main className="leaderboard-main">
          <section className="report-card leaderboard-hero-card">
            <div className="leaderboard-hero-copy">
              <Skeleton className="skeleton-kicker" />
              <Skeleton className="skeleton-title" />
              <Skeleton className="skeleton-copy" />
            </div>
            <div className="leaderboard-hero-stats">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="skeleton-row" />
              ))}
            </div>
          </section>

          <section className="leaderboard-featured-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <section key={index} className="report-card leaderboard-featured-card">
                <Skeleton className="skeleton-kicker" />
                <Skeleton className="skeleton-subtitle" />
                <div className="skeleton-list">
                  {Array.from({ length: 3 }).map((__, row) => (
                    <Skeleton key={row} className="skeleton-row" />
                  ))}
                </div>
              </section>
            ))}
          </section>

          <section className="report-card leaderboard-card">
            <div className="leaderboard-card-head">
              <div className="section-heading">
                <Skeleton className="skeleton-kicker" />
                <Skeleton className="skeleton-subtitle" />
                <Skeleton className="skeleton-copy" />
              </div>

              <div className="skeleton-tab-row">
                <Skeleton className="skeleton-pill" />
                <Skeleton className="skeleton-pill" />
                <Skeleton className="skeleton-pill" />
              </div>
            </div>

            <section className="leaderboard-featured-grid">
              {Array.from({ length: 3 }).map((_, index) => (
                <section key={index} className="leaderboard-featured-card">
                  <Skeleton className="skeleton-kicker" />
                  <Skeleton className="skeleton-subtitle" />
                  <div className="skeleton-list">
                    {Array.from({ length: 3 }).map((__, row) => (
                      <Skeleton key={row} className="skeleton-row" />
                    ))}
                  </div>
                </section>
              ))}
            </section>

            <div className="leaderboard-skeleton-list">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="leaderboard-skeleton-row">
                  <Skeleton className="skeleton-cell skeleton-rank" />
                  <Skeleton className="skeleton-cell skeleton-name" />
                  <Skeleton className="skeleton-cell" />
                  <Skeleton className="skeleton-cell" />
                  <Skeleton className="skeleton-cell" />
                  <Skeleton className="skeleton-cell" />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
