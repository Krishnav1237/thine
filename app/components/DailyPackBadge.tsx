"use client";

import { useEffect, useState } from "react";

import { getNextPackCountdown } from "../lib/daily-pack";

export default function DailyPackBadge(): React.JSX.Element {
  const [countdown, setCountdown] = useState("--h --m");

  useEffect(() => {
    const tick = () => setCountdown(getNextPackCountdown());
    tick();
    const interval = window.setInterval(tick, 60000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="daily-pack-badge">
      <span className="daily-pack-pill">Daily Pack</span>
      <span className="daily-pack-countdown">Resets in {countdown}</span>
    </div>
  );
}
