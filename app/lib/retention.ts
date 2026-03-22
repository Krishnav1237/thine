import { getLocalDateKey } from "./daily-pack";

export type ActivityType = "quiz" | "arena";

export interface RetentionState {
  lastQuizDate?: string;
  lastArenaDate?: string;
  lastActiveDate?: string;
  currentStreak: number;
  bestStreak: number;
}

const RETENTION_KEY = "thine-retention";

const defaultState: RetentionState = {
  currentStreak: 0,
  bestStreak: 0,
};

function parseState(raw: string | null): RetentionState {
  if (!raw) {
    return { ...defaultState };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<RetentionState>;
    return {
      lastQuizDate:
        typeof parsed.lastQuizDate === "string" ? parsed.lastQuizDate : undefined,
      lastArenaDate:
        typeof parsed.lastArenaDate === "string" ? parsed.lastArenaDate : undefined,
      lastActiveDate:
        typeof parsed.lastActiveDate === "string" ? parsed.lastActiveDate : undefined,
      currentStreak:
        typeof parsed.currentStreak === "number" && parsed.currentStreak >= 0
          ? parsed.currentStreak
          : 0,
      bestStreak:
        typeof parsed.bestStreak === "number" && parsed.bestStreak >= 0
          ? parsed.bestStreak
          : 0,
    };
  } catch {
    return { ...defaultState };
  }
}

function diffDays(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  const diff = to.getTime() - from.getTime();
  return Math.round(diff / 86400000);
}

export function readRetention(): RetentionState {
  if (typeof window === "undefined") {
    return { ...defaultState };
  }

  return parseState(window.localStorage.getItem(RETENTION_KEY));
}

export function recordDailyActivity(type: ActivityType): RetentionState {
  if (typeof window === "undefined") {
    return { ...defaultState };
  }

  const todayKey = getLocalDateKey();
  const current = readRetention();
  let nextStreak = current.currentStreak || 0;

  if (!current.lastActiveDate) {
    nextStreak = 1;
  } else if (current.lastActiveDate === todayKey) {
    nextStreak = Math.max(1, nextStreak);
  } else {
    const gap = diffDays(current.lastActiveDate, todayKey);
    nextStreak = gap === 1 ? nextStreak + 1 : 1;
  }

  const nextState: RetentionState = {
    ...current,
    currentStreak: nextStreak,
    bestStreak: Math.max(current.bestStreak || 0, nextStreak),
    lastActiveDate: todayKey,
    lastQuizDate: type === "quiz" ? todayKey : current.lastQuizDate,
    lastArenaDate: type === "arena" ? todayKey : current.lastArenaDate,
  };

  window.localStorage.setItem(RETENTION_KEY, JSON.stringify(nextState));
  return nextState;
}
