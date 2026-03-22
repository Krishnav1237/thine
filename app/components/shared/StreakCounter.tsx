"use client";

export default function StreakCounter({
  currentStreak,
  longestStreak,
  showLongest = false,
  compact = false,
}: {
  currentStreak: number;
  longestStreak: number;
  showLongest?: boolean;
  compact?: boolean;
}): React.JSX.Element {
  const safeCurrent = Math.max(0, currentStreak);
  const flameScale = Math.min(1.35, 1 + safeCurrent / 40);

  return (
    <div className={`streak-counter ${compact ? "compact" : ""}`}>
      <span className="streak-counter-copy">
        {safeCurrent > 0 ? `Day ${safeCurrent}` : "0 days"}
      </span>
      <span
        className="streak-counter-flame"
        style={{ transform: `scale(${flameScale})` }}
      >
        🔥
      </span>
      {showLongest ? (
        <span className="streak-counter-meta">Best {Math.max(0, longestStreak)}</span>
      ) : null}
    </div>
  );
}
