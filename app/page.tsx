import { Suspense } from "react";

import BrandHeader from "./components/BrandHeader";
import ChallengeBanner from "./components/ChallengeBanner";
import LandingCta from "./LandingCta";
import { thineLinks } from "./lib/thine-links";

const landingHighlights = [
  {
    title: "Recall the room",
    description:
      "Measure how well you retain the actual details of meetings, decisions, and promises after the moment passes.",
  },
  {
    title: "Track the relationship",
    description:
      "See whether your current system can surface the state of important people before you need to improvise.",
  },
  {
    title: "Protect the follow-through",
    description:
      "Find out how much of your professional momentum depends on memory instead of a durable operating system.",
  },
];

export default function Home() {
  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell landing-shell">
        <BrandHeader />

        <main className="landing-main">
          <Suspense fallback={null}>
            <ChallengeBanner />
          </Suspense>
          <section className="landing-content">
            <div className="landing-badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              10 Questions · 2 Minutes · Thine Diagnostic
            </div>

            <h1 className="landing-title">
              What&apos;s Your Personal Intelligence Score?
            </h1>

            <p className="landing-hook">
              A short diagnostic that makes one thing painfully clear: if your
              memory is still your operating system, you are losing valuable
              context every week. Thine is the layer that fixes that.
            </p>

            <div className="landing-actions">
              <LandingCta />
              <a
                href={thineLinks.landing}
                className="btn-secondary"
                target="_blank"
                rel="noreferrer"
              >
                See How Thine Works
              </a>
            </div>

            <p className="landing-note">
              The quiz diagnoses the gap. The result page points people toward
              how Thine closes it.
            </p>
          </section>

          <section className="landing-grid" aria-label="What the quiz measures">
            {landingHighlights.map((highlight) => (
              <article key={highlight.title} className="landing-card">
                <span className="card-kicker">Signal</span>
                <h2>{highlight.title}</h2>
                <p>{highlight.description}</p>
              </article>
            ))}
          </section>

          <section className="report-card conversion-card">
            <div className="section-heading">
              <span className="section-eyebrow">Why this tool exists</span>
              <h2 className="conversion-title">
                This quiz captures attention. Thine turns that attention into a
                system.
              </h2>
              <p className="section-copy">
                The score makes the pain visible: forgotten meetings, fuzzy
                relationship state, and follow-ups that depend on memory. Thine
                is the next step for people who want a real personal
                intelligence layer.
              </p>
            </div>

            <div className="conversion-actions">
              <LandingCta />
              <a
                href={thineLinks.landing}
                className="btn-secondary"
                target="_blank"
                rel="noreferrer"
              >
                Visit Thine
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
