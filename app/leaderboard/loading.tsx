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
          <section className="report-card leaderboard-card">
            <div className="section-heading">
              <Skeleton className="skeleton-kicker" />
              <Skeleton className="skeleton-title" />
              <Skeleton className="skeleton-copy" />
            </div>

            <div className="skeleton-tab-row">
              <Skeleton className="skeleton-pill" />
              <Skeleton className="skeleton-pill" />
              <Skeleton className="skeleton-pill" />
            </div>

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
