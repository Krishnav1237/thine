import Skeleton from "../../components/shared/Skeleton";

export default function Loading(): React.JSX.Element {
  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell share-page-shell">
        <main className="share-page-main">
          <section className="share-mini-card">
            <div className="share-mini-header">
              <div className="share-mini-brand">
                <Skeleton className="skeleton-kicker" />
                <Skeleton className="skeleton-copy skeleton-copy-short" />
              </div>
              <Skeleton className="skeleton-pill" />
            </div>

            <div className="share-mini-hero">
              <div className="share-mini-score-panel">
                <Skeleton className="skeleton-score" />
                <Skeleton className="skeleton-copy" />
              </div>

              <div className="share-mini-tier-panel">
                <Skeleton className="skeleton-kicker" />
                <Skeleton className="skeleton-title skeleton-title-small" />
                <Skeleton className="skeleton-copy" />
              </div>
            </div>

            <div className="skeleton-list">
              <Skeleton className="skeleton-row" />
              <Skeleton className="skeleton-row" />
              <Skeleton className="skeleton-row" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
