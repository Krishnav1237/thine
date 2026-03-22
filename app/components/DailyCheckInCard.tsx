"use client";

import { useEffect, useState } from "react";

import { getNextPackCountdown } from "../lib/daily-pack";
import { readRetention } from "../lib/retention";

interface DailyCheckInCardProps {
  name?: string;
  context?: "landing" | "results";
}

export default function DailyCheckInCard({
  name,
  context = "landing",
}: DailyCheckInCardProps): React.JSX.Element {
  const [streak] = useState(() => readRetention().currentStreak ?? 0);
  const [bestStreak] = useState(() => readRetention().bestStreak ?? 0);
  const [nextPack, setNextPack] = useState(() => getNextPackCountdown());

  useEffect(() => {
    const interval = window.setInterval(
      () => setNextPack(getNextPackCountdown()),
      60000
    );
    return () => window.clearInterval(interval);
  }, []);

  const title = name ? `Keep it going, ${name}.` : "Keep the streak alive.";
  const subcopy =
    context === "results"
      ? "Daily packs refresh at midnight. Come back for a fresh rotation."
      : "Daily packs refresh at midnight with a new rotation.";

  return (
    <section className="report-card daily-checkin-card">
      <div className="section-heading">
        <span className="section-eyebrow">Daily check-in</span>
        <h2 className="conversion-title">{title}</h2>
        <p className="section-copy">{subcopy}</p>
      </div>

      <div className="daily-checkin-grid">
        <div className="daily-checkin-stat">
          <span>Current streak</span>
          <strong>{streak} days</strong>
        </div>
        <div className="daily-checkin-stat">
          <span>Best streak</span>
          <strong>{bestStreak} days</strong>
        </div>
        <div className="daily-checkin-stat">
          <span>Next pack</span>
          <strong>In {nextPack}</strong>
        </div>
      </div>
    </section>
  );
}
