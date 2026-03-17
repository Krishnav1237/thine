"use client";

import { MAX_SCORE } from "../data/questions";

interface ResultCardProps {
  score: number;
  category: string;
  percentileCopy: string;
  strengths: string[];
  weakness: string;
  comparison?: string | null;
  name?: string;
  chips?: string[];
}

export default function ResultCard({
  score,
  category,
  percentileCopy,
  strengths,
  weakness,
  comparison,
  name,
  chips = [],
}: ResultCardProps) {
  const title = name ? `${name}'s Intelligence Report` : "Your Intelligence Report";

  return (
    <section className="report-card result-card">
      <div className="result-hero">
        <div className="result-hero-main">
          <span className="section-eyebrow">Your Intelligence Report</span>
          <h1 className="result-title">{title}</h1>
          {chips.length > 0 ? (
            <div className="chip-row result-chip-row">
              {chips.map((chip) => (
                <span key={chip} className="chip">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="result-hero-score">
          <div className="result-score-row">
            <span className="result-score-value">{score}</span>
            <span className="result-score-total">/ {MAX_SCORE}</span>
          </div>
          <div className="result-category">{category}</div>
        </div>
      </div>

      <div className="result-meta">
        <p className="result-percentile">{percentileCopy}</p>
        {comparison ? <p className="result-compare">{comparison}</p> : null}
      </div>

      <div className="result-grid">
        <div className="result-block">
          <span className="section-eyebrow">Strengths</span>
          <ul className="result-list">
            {strengths.map((strength) => (
              <li key={strength}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="result-block">
          <span className="section-eyebrow">Weakness</span>
          <p className="result-weakness">{weakness}</p>
        </div>
      </div>
    </section>
  );
}
