"use client";

import { getTier, tiers } from "../data/questions";

interface TierScaleProps {
  currentScore: number;
  heading?: string;
  description?: string;
}

export default function TierScale({
  currentScore,
  heading = "How the tiers stack up",
  description = "Each band reflects how much of your professional context your current system preserves.",
}: TierScaleProps) {
  const activeTier = getTier(currentScore).name;

  return (
    <section className="tier-scale-card" aria-label={heading}>
      <div className="section-heading">
        <span className="section-eyebrow">{heading}</span>
        <p className="section-copy">{description}</p>
      </div>

      <div className="tier-scale-list">
        {tiers.map((tier) => {
          const isActive = tier.name === activeTier;

          return (
            <article
              key={tier.name}
              className={`tier-scale-row ${isActive ? "active" : ""}`}
              aria-current={isActive ? "true" : undefined}
            >
              <div className="tier-scale-main">
                <div className="tier-scale-name">{tier.name}</div>
                <p className="tier-scale-description">{tier.focus}</p>
              </div>

              <div className="tier-scale-range">
                {tier.min}-{tier.max}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
