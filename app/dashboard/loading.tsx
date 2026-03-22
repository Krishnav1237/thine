import BrandHeader from "../components/BrandHeader";
import Skeleton from "../components/shared/Skeleton";

export default function Loading(): React.JSX.Element {
  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell report-page-shell">
        <BrandHeader />

        <main className="dashboard-main">
          <section className="report-card dashboard-hero-card">
            <div className="dashboard-hero-copy">
              <Skeleton className="skeleton-kicker" />
              <Skeleton className="skeleton-title" />
              <Skeleton className="skeleton-copy" />
            </div>

            <div className="dashboard-stat-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="dashboard-stat-card">
                  <Skeleton className="skeleton-kicker skeleton-compact" />
                  <Skeleton className="skeleton-metric" />
                </div>
              ))}
            </div>
          </section>

          <section className="report-card dashboard-actions-card">
            <div className="dashboard-actions-row">
              <Skeleton className="skeleton-button" />
              <Skeleton className="skeleton-button" />
              <Skeleton className="skeleton-button" />
            </div>
          </section>

          <section className="dashboard-history-grid">
            {Array.from({ length: 2 }).map((_, index) => (
              <section key={index} className="report-card dashboard-history-card">
                <div className="section-heading">
                  <Skeleton className="skeleton-kicker" />
                  <Skeleton className="skeleton-subtitle" />
                </div>
                <div className="skeleton-list">
                  {Array.from({ length: 4 }).map((__, row) => (
                    <Skeleton key={row} className="skeleton-row" />
                  ))}
                </div>
              </section>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
