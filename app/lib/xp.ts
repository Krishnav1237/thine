import type { RankTier } from "./supabase/types";

export type ActivityType = "quiz" | "arena";
export type QuizSessionMode = "quick" | "deep";
export type ArenaSessionMode = "daily" | "avid";

export interface XPBreakdown {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  breakdown: string[];
}

export interface RankTierProgress {
  tier: RankTier;
  nextTier: RankTier | null;
  xpToNext: number;
  progress: number;
}

const TIER_ORDER: RankTier[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
];

const TIER_THRESHOLDS: Record<RankTier, { min: number; max: number | null }> = {
  bronze: { min: 0, max: 999 },
  silver: { min: 1000, max: 4999 },
  gold: { min: 5000, max: 14999 },
  platinum: { min: 15000, max: 49999 },
  diamond: { min: 50000, max: null },
};

export function calculateXP({
  activityType,
  score,
  sessionMode,
  isFirstToday,
  currentStreak,
}: {
  activityType: ActivityType;
  score?: number;
  sessionMode?: QuizSessionMode | ArenaSessionMode;
  isFirstToday: boolean;
  currentStreak: number;
}): XPBreakdown {
  const safeScore = Math.max(0, Math.min(100, Math.round(score ?? 0)));
  let baseXP = 0;

  if (activityType === "quiz") {
    if (sessionMode === "deep") {
      baseXP = 75 + Math.round(safeScore * 0.75);
    } else {
      baseXP = 50 + Math.round(safeScore * 0.5);
    }
  } else if (sessionMode === "avid") {
    baseXP = 60;
  } else {
    baseXP = 40;
  }

  let bonusXP = 0;
  const breakdown = [`Base ${baseXP} XP`];

  if (isFirstToday) {
    bonusXP += 50;
    breakdown.push("First activity +50 XP");
  }

  if (currentStreak === 7) {
    bonusXP += 100;
    breakdown.push("7-day streak +100 XP");
  }

  if (currentStreak === 30) {
    bonusXP += 500;
    breakdown.push("30-day streak +500 XP");
  }

  if (currentStreak === 100) {
    bonusXP += 2000;
    breakdown.push("100-day streak +2000 XP");
  }

  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
    breakdown,
  };
}

export function getRankTier(totalXP: number): RankTierProgress {
  const safeXP = Math.max(0, Math.round(totalXP));
  const tier =
    TIER_ORDER.find((candidate) => {
      const threshold = TIER_THRESHOLDS[candidate];
      return (
        safeXP >= threshold.min &&
        (threshold.max === null || safeXP <= threshold.max)
      );
    }) ?? "bronze";

  const tierIndex = TIER_ORDER.indexOf(tier);
  const nextTier = TIER_ORDER[tierIndex + 1] ?? null;
  const tierRange = TIER_THRESHOLDS[tier];
  const nextTierRange = nextTier ? TIER_THRESHOLDS[nextTier] : null;
  const xpToNext = nextTierRange ? Math.max(0, nextTierRange.min - safeXP) : 0;
  const denominator =
    tierRange.max === null ? 1 : Math.max(1, tierRange.max - tierRange.min + 1);
  const progress =
    tierRange.max === null
      ? 100
      : Math.min(
          100,
          Math.round(((safeXP - tierRange.min) / denominator) * 100)
        );

  return {
    tier,
    nextTier,
    xpToNext,
    progress,
  };
}
