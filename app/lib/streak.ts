import { getLocalDateKey } from "./daily-pack";

export function updateStreak(
  lastActiveDate: string | null | undefined,
  currentStreak: number,
  longestStreak: number
): {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  isNewDay: boolean;
  streakMilestone: number | null;
} {
  const today = getLocalDateKey();

  if (lastActiveDate === today) {
    return {
      currentStreak,
      longestStreak,
      lastActiveDate: today,
      isNewDay: false,
      streakMilestone: null as number | null,
    };
  }

  const previous = lastActiveDate ? new Date(`${lastActiveDate}T00:00:00`) : null;
  const current = new Date(`${today}T00:00:00`);
  const diffDays = previous
    ? Math.round((current.getTime() - previous.getTime()) / 86400000)
    : null;

  const nextCurrentStreak = diffDays === 1 ? currentStreak + 1 : 1;
  const nextLongestStreak = Math.max(longestStreak, nextCurrentStreak);
  const streakMilestone =
    nextCurrentStreak === 7 ||
    nextCurrentStreak === 30 ||
    nextCurrentStreak === 100
      ? nextCurrentStreak
      : null;

  return {
    currentStreak: nextCurrentStreak,
    longestStreak: nextLongestStreak,
    lastActiveDate: today,
    isNewDay: true,
    streakMilestone,
  };
}
