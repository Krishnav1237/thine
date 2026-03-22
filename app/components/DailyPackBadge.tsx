"use client";

import { useEffect, useState } from "react";

import { getNextPackCountdown } from "../lib/daily-pack";

export default function DailyPackBadge(): React.JSX.Element {
  const [countdown, setCountdown] = useState(() => getNextPackCountdown());

  useEffect(() => {
    const tick = () => setCountdown(getNextPackCountdown());
    const interval = window.setInterval(tick, 60000);
    tick();

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="daily-pack-badge">
      <span className="daily-pack-pill">Daily Pack</span>
      <span className="daily-pack-countdown">Resets in {countdown}</span>
    </div>
  );
}
