"use client";

import type { User } from "@supabase/supabase-js";

import { getLocalDateKey } from "../daily-pack";
import { readRetention } from "../retention";
import { updateStreak } from "../streak";
import {
  calculateXP,
  getRankTier,
  type ArenaSessionMode,
  type QuizSessionMode,
} from "../xp";
import { getSupabaseBrowserClient } from "./client";
import type {
  ArenaAttemptInsert,
  ProfileRow,
  QuizAttemptInsert,
  RankTier,
  SharedResultInsert,
} from "./types";

const LOCAL_PLAYER_KEY = "thine-player-stats";
const SYNC_DEDUPE_KEY = "thine-sync-dedupe";
const DAILY_BONUS_KEY = "thine-xp-daily-bonus";

export interface LocalPlayerStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string;
  piScore: number;
  rankTier: RankTier;
}

interface SyncResult {
  xpEarned: number;
  bonusXP: number;
  currentStreak: number;
  longestStreak: number;
  rankTier: RankTier;
  totalXP: number;
  piScore?: number;
}

function sanitizeUsername(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);

  return normalized || null;
}

function defaultLocalPlayerStats(): LocalPlayerStats {
  const retention = readRetention();
  return {
    totalXP: 0,
    currentStreak: retention.currentStreak ?? 0,
    longestStreak: retention.bestStreak ?? 0,
    lastActiveDate: retention.lastActiveDate,
    piScore: 0,
    rankTier: "bronze",
  };
}

export function readLocalPlayerStats(): LocalPlayerStats {
  if (typeof window === "undefined") {
    return defaultLocalPlayerStats();
  }

  const fallback = defaultLocalPlayerStats();
  const raw = window.localStorage.getItem(LOCAL_PLAYER_KEY);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalPlayerStats>;
    return {
      totalXP:
        typeof parsed.totalXP === "number" ? parsed.totalXP : fallback.totalXP,
      currentStreak:
        typeof parsed.currentStreak === "number"
          ? parsed.currentStreak
          : fallback.currentStreak,
      longestStreak:
        typeof parsed.longestStreak === "number"
          ? parsed.longestStreak
          : fallback.longestStreak,
      lastActiveDate:
        typeof parsed.lastActiveDate === "string"
          ? parsed.lastActiveDate
          : fallback.lastActiveDate,
      piScore:
        typeof parsed.piScore === "number" ? parsed.piScore : fallback.piScore,
      rankTier:
        parsed.rankTier === "silver" ||
        parsed.rankTier === "gold" ||
        parsed.rankTier === "platinum" ||
        parsed.rankTier === "diamond"
          ? parsed.rankTier
          : fallback.rankTier,
    };
  } catch {
    return fallback;
  }
}

function writeLocalPlayerStats(stats: LocalPlayerStats) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_PLAYER_KEY, JSON.stringify(stats));
}

export function syncLocalPlayerStatsFromProfile(
  profile: ProfileRow | null
): void {
  if (!profile) {
    return;
  }

  const fallback = defaultLocalPlayerStats();
  const rankTier =
    profile.ranktier === "silver" ||
    profile.ranktier === "gold" ||
    profile.ranktier === "platinum" ||
    profile.ranktier === "diamond"
      ? profile.ranktier
      : "bronze";

  writeLocalPlayerStats({
    totalXP: profile.total_xp ?? fallback.totalXP,
    currentStreak: profile.current_streak ?? fallback.currentStreak,
    longestStreak: profile.longest_streak ?? fallback.longestStreak,
    lastActiveDate: profile.lastactivedate ?? fallback.lastActiveDate,
    piScore: Math.round(profile.pi_score ?? fallback.piScore),
    rankTier,
  });
}

function shouldAwardFirstActivityBonus() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(DAILY_BONUS_KEY) !== getLocalDateKey();
}

function markDailyBonusAwarded() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DAILY_BONUS_KEY, getLocalDateKey());
}

function syncRetentionBackup(activityType: "quiz" | "arena", currentStreak: number, longestStreak: number, lastActiveDate: string) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readRetention();
  window.localStorage.setItem(
    "thine-retention",
    JSON.stringify({
      ...current,
      currentStreak,
      bestStreak: longestStreak,
      lastActiveDate,
      lastQuizDate: activityType === "quiz" ? lastActiveDate : current.lastQuizDate,
      lastArenaDate: activityType === "arena" ? lastActiveDate : current.lastArenaDate,
    })
  );
}

function readSyncedKeys() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(SYNC_DEDUPE_KEY);
    if (!raw) {
      return new Set<string>();
    }

    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
}

function isAlreadySynced(dedupeKey?: string) {
  if (!dedupeKey) {
    return false;
  }

  return readSyncedKeys().has(dedupeKey);
}

function markSynced(dedupeKey?: string) {
  if (!dedupeKey || typeof window === "undefined") {
    return;
  }

  const existing = Array.from(readSyncedKeys());
  const next = Array.from(new Set([dedupeKey, ...existing])).slice(0, 200);
  window.localStorage.setItem(SYNC_DEDUPE_KEY, JSON.stringify(next));
}

function averageDimensionPercent(
  dimensionScores?: Array<{ percent?: number | null }> | null
) {
  if (!dimensionScores?.length) {
    return 0;
  }

  const total = dimensionScores.reduce((sum, entry) => {
    return sum + (typeof entry.percent === "number" ? entry.percent : 0);
  }, 0);

  return Math.round(total / dimensionScores.length);
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return (data ?? null) as ProfileRow | null;
}

export async function ensureProfileRow({
  user,
  username,
  displayName,
}: {
  user: User;
  username?: string | null;
  displayName?: string | null;
}): Promise<ProfileRow | null> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const sanitizedUsername =
    sanitizeUsername(username) ||
    sanitizeUsername(user.user_metadata?.username) ||
    sanitizeUsername(user.email?.split("@")[0]);

  const payload = {
    id: user.id,
    username: sanitizedUsername,
    display_name:
      displayName ||
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return (data ?? null) as ProfileRow | null;
}

async function updateProfileStats({
  userId,
  currentProfile,
  totalXP,
  currentStreak,
  longestStreak,
  lastActiveDate,
  piScore,
}: {
  userId: string;
  currentProfile: ProfileRow | null;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  piScore?: number;
}) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const rank = getRankTier(totalXP);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        total_xp: totalXP,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        lastactivedate: lastActiveDate,
        pi_score: typeof piScore === "number" ? piScore : currentProfile?.pi_score ?? 0,
        ranktier: rank.tier,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return (data ?? null) as ProfileRow | null;
}

function buildLocalStats({
  previous,
  currentStreak,
  longestStreak,
  totalXP,
  piScore,
}: {
  previous: LocalPlayerStats;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  piScore?: number;
}) {
  const rank = getRankTier(totalXP);

  return {
    totalXP,
    currentStreak,
    longestStreak,
    lastActiveDate: getLocalDateKey(),
    piScore: typeof piScore === "number" ? piScore : previous.piScore,
    rankTier: rank.tier,
  } satisfies LocalPlayerStats;
}

export async function saveQuizAttempt(
  data: Omit<QuizAttemptInsert, "user_id" | "xp_earned"> & {
    dedupeKey?: string;
    userId?: string | null;
  }
): Promise<SyncResult | null> {
  if (isAlreadySynced(data.dedupeKey)) {
    const stats = readLocalPlayerStats();
    return {
      xpEarned: 0,
      bonusXP: 0,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      rankTier: stats.rankTier,
      totalXP: stats.totalXP,
      piScore: stats.piScore,
    };
  }

  const localStats = readLocalPlayerStats();
  const currentProfile = data.userId ? await fetchProfile(data.userId) : null;
  const baseLastActiveDate = currentProfile?.lastactivedate ?? localStats.lastActiveDate;
  const baseCurrentStreak = currentProfile?.current_streak ?? localStats.currentStreak;
  const baseLongestStreak = currentProfile?.longest_streak ?? localStats.longestStreak;
  const nextStreak = updateStreak(
    baseLastActiveDate,
    baseCurrentStreak ?? 0,
    baseLongestStreak ?? 0
  );
  const isFirstToday = shouldAwardFirstActivityBonus();
  const xp = calculateXP({
    activityType: "quiz",
    score: data.normalized_score,
    sessionMode: data.sessionmode as QuizSessionMode | undefined,
    isFirstToday,
    currentStreak: nextStreak.currentStreak,
  });
  const currentTotalXP = currentProfile?.total_xp ?? localStats.totalXP;
  const nextTotalXP = currentTotalXP + xp.totalXP;
  const nextPiScore = (() => {
    if (typeof data.normalized_score === "number") {
      return Math.round(data.normalized_score);
    }

    const attemptPi = averageDimensionPercent(
      Array.isArray(data.dimension_scores)
        ? (data.dimension_scores as Array<{ percent?: number | null }>)
        : null
    );

    if (attemptPi) {
      return attemptPi;
    }

    return Math.round(currentProfile?.pi_score ?? localStats.piScore);
  })();

  const nextLocal = buildLocalStats({
    previous: localStats,
    currentStreak: nextStreak.currentStreak,
    longestStreak: nextStreak.longestStreak,
    totalXP: nextTotalXP,
    piScore: nextPiScore,
  });

  writeLocalPlayerStats(nextLocal);
  markDailyBonusAwarded();
  syncRetentionBackup(
    "quiz",
    nextStreak.currentStreak,
    nextStreak.longestStreak,
    nextStreak.lastActiveDate
  );

  if (data.userId) {
    try {
      const supabase = getSupabaseBrowserClient();

      if (supabase) {
        await supabase.from("quiz_attempts").insert({
          ...data,
          user_id: data.userId,
          xp_earned: xp.totalXP,
        });

        await updateProfileStats({
          userId: data.userId,
          currentProfile,
          totalXP: nextTotalXP,
          currentStreak: nextStreak.currentStreak,
          longestStreak: nextStreak.longestStreak,
          lastActiveDate: nextStreak.lastActiveDate,
          piScore: nextPiScore,
        });
      }
    } catch {
      // Fall back silently to local state.
    }
  }

  markSynced(data.dedupeKey);

  return {
    xpEarned: xp.totalXP,
    bonusXP: xp.bonusXP,
    currentStreak: nextStreak.currentStreak,
    longestStreak: nextStreak.longestStreak,
    rankTier: getRankTier(nextTotalXP).tier,
    totalXP: nextTotalXP,
    piScore: nextPiScore,
  };
}

export async function saveArenaAttempt(
  data: Omit<ArenaAttemptInsert, "user_id" | "xp_earned"> & {
    dedupeKey?: string;
    userId?: string | null;
  }
): Promise<SyncResult | null> {
  if (isAlreadySynced(data.dedupeKey)) {
    const stats = readLocalPlayerStats();
    return {
      xpEarned: 0,
      bonusXP: 0,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      rankTier: stats.rankTier,
      totalXP: stats.totalXP,
    };
  }

  const localStats = readLocalPlayerStats();
  const currentProfile = data.userId ? await fetchProfile(data.userId) : null;
  const nextStreak = updateStreak(
    currentProfile?.lastactivedate ?? localStats.lastActiveDate,
    currentProfile?.current_streak ?? localStats.currentStreak,
    currentProfile?.longest_streak ?? localStats.longestStreak
  );
  const isFirstToday = shouldAwardFirstActivityBonus();
  const xp = calculateXP({
    activityType: "arena",
    sessionMode: data.sessionmode as ArenaSessionMode | undefined,
    isFirstToday,
    currentStreak: nextStreak.currentStreak,
  });
  const nextTotalXP = (currentProfile?.total_xp ?? localStats.totalXP) + xp.totalXP;
  const nextLocal = buildLocalStats({
    previous: localStats,
    currentStreak: nextStreak.currentStreak,
    longestStreak: nextStreak.longestStreak,
    totalXP: nextTotalXP,
  });

  writeLocalPlayerStats(nextLocal);
  markDailyBonusAwarded();
  syncRetentionBackup(
    "arena",
    nextStreak.currentStreak,
    nextStreak.longestStreak,
    nextStreak.lastActiveDate
  );

  if (data.userId) {
    try {
      const supabase = getSupabaseBrowserClient();

      if (supabase) {
        await supabase.from("arena_attempts").insert({
          ...data,
          user_id: data.userId,
          xp_earned: xp.totalXP,
        });

        await updateProfileStats({
          userId: data.userId,
          currentProfile,
          totalXP: nextTotalXP,
          currentStreak: nextStreak.currentStreak,
          longestStreak: nextStreak.longestStreak,
          lastActiveDate: nextStreak.lastActiveDate,
        });
      }
    } catch {
      // Fall back silently to local state.
    }
  }

  markSynced(data.dedupeKey);

  return {
    xpEarned: xp.totalXP,
    bonusXP: xp.bonusXP,
    currentStreak: nextStreak.currentStreak,
    longestStreak: nextStreak.longestStreak,
    rankTier: getRankTier(nextTotalXP).tier,
    totalXP: nextTotalXP,
  };
}

export async function saveSharedResult(
  data: SharedResultInsert & { userId?: string | null }
) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase || !data.userId) {
    return null;
  }

  try {
    const { data: inserted } = await supabase
      .from("shared_results")
      .insert({
        ...data,
        user_id: data.userId,
      })
      .select("id")
      .single();

    return inserted?.id ?? null;
  } catch {
    return null;
  }
}
