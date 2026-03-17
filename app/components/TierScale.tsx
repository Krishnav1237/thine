"use client";

import { getScoreBand, scoreBands } from "../lib/analyzeUser";

interface TierScaleProps {
  currentScore: number;
  heading?: string;
  description?: string;
}

export default function TierScale({
  currentScore,
  heading = "How the bands stack up",
  description = "Each band reflects how much of your professional context your current system preserves.",
}: TierScaleProps) {
  const activeBand = getScoreBand(currentScore).name;

  return (
    <section className="tier-scale-card" aria-label={heading}>
      <div className="section-heading">
        <span className="section-eyebrow">{heading}</span>
        <p className="section-copy">{description}</p>
      </div>

      <div className="tier-scale-list">
        {scoreBands.map((band) => {
          const isActive = band.name === activeBand;

          return (
            <article
              key={band.name}
              className={`tier-scale-row ${isActive ? "active" : ""}`}
              aria-current={isActive ? "true" : undefined}
            >
              <div className="tier-scale-main">
                <div className="tier-scale-name">{band.name}</div>
                <p className="tier-scale-description">{band.focus}</p>
              </div>

              <div className="tier-scale-range">
                {band.min}-{band.max}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
