"use client";

import type { RankTier } from "../../lib/supabase/types";
import { getRankTier } from "../../lib/xp";

const RANK_COLORS: Record<RankTier, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
  diamond: "#B9F2FF",
};

export default function RankBadge({
  tier,
  totalXP,
  showProgress = false,
}: {
  tier: RankTier;
  totalXP?: number;
  showProgress?: boolean;
}): React.JSX.Element {
  const rank = typeof totalXP === "number" ? getRankTier(totalXP) : null;

  return (
    <div className="rank-badge-wrap">
      <span
        className="rank-badge"
        style={{
          borderColor: `${RANK_COLORS[tier]}66`,
          color: RANK_COLORS[tier],
        }}
      >
        {tier}
      </span>
      {showProgress && rank ? (
        <span className="rank-badge-progress">
          {rank.nextTier ? `${rank.xpToNext} XP to ${rank.nextTier}` : "Top tier"}
        </span>
      ) : null}
    </div>
  );
}
