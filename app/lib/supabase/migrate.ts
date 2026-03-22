"use client";

import { analyzeUser, getScoreBand } from "../analyzeUser";
import { normalizeArenaPercents } from "../arena-share";
import { normalizeScore } from "../../data/questions";
import { readQuizSession } from "../quiz-session";
import { readRetention } from "../retention";
import { getSupabaseBrowserClient } from "./client";
import { saveArenaAttempt, saveQuizAttempt } from "./sync";
import type { Json } from "./types";

const MIGRATED_KEY = "thine-migrated";
const MIGRATED_USER_KEY = "thine-migrated-user";

type ArenaAnswer = "agree" | "disagree" | "depends";

function hasMigrated(userId: string) {
  if (typeof window === "undefined") {
    return true;
  }

  const migrated = window.localStorage.getItem(MIGRATED_KEY);
  const migratedUser = window.localStorage.getItem(MIGRATED_USER_KEY);

  return migrated === "true" && (migratedUser === userId || !migratedUser);
}

function markMigrated(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MIGRATED_KEY, "true");
  window.localStorage.setItem(MIGRATED_USER_KEY, userId);
}

function readArenaState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawResponses = window.localStorage.getItem("arenaResponses");
    if (!rawResponses) {
      return null;
    }

    const responses = JSON.parse(rawResponses) as Array<{
      takeId: number;
      answer: ArenaAnswer;
    }>;

    if (!Array.isArray(responses) || responses.length === 0) {
      return null;
    }

    const counts = responses.reduce(
      (acc, response) => {
        if (response.answer in acc) {
          acc[response.answer] += 1;
        }
        return acc;
      },
      { agree: 0, disagree: 0, depends: 0 }
    );
    const total = responses.length;

    return {
      responses,
      counts,
      stanceMix: normalizeArenaPercents({
        agree: (counts.agree / total) * 100,
        disagree: (counts.disagree / total) * 100,
        depends: (counts.depends / total) * 100,
      }),
      sessionMode:
        (window.localStorage.getItem("arenaSessionMode") === "avid"
          ? "avid"
          : "daily") as "daily" | "avid",
    };
  } catch {
    return null;
  }
}

export async function migrateLocalDataToSupabase(userId: string) {
  if (typeof window === "undefined" || hasMigrated(userId)) {
    return;
  }

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return;
  }

  try {
    const quizSession = readQuizSession();
    const retention = readRetention();
    const arenaState = readArenaState();

    if (
      quizSession?.answers?.length &&
      quizSession.questionOrder?.length &&
      quizSession.answers.length >= quizSession.questionOrder.length
    ) {
      const rawScore =
        (quizSession.answers.reduce((sum, value) => sum + value, 0) /
          Math.max(1, quizSession.answers.length * 3)) *
        100;
      const normalized = normalizeScore(rawScore);
      const analysis = analyzeUser(
        quizSession.answers,
        normalized,
        quizSession.questionOrder
      );

      await saveQuizAttempt({
        userId,
        dedupeKey: `migration:quiz:${quizSession.questionOrder.join("-")}:${quizSession.answers.join("-")}`,
        sessionmode: quizSession.sessionMode ?? "quick",
        score: normalized,
        max_score: 100,
        normalized_score: normalized,
        score_band: getScoreBand(normalized).name,
        dimension_scores: analysis.dimensionScores as unknown as Json,
        strengths: analysis.strengths as unknown as Json,
        weakest_area: analysis.weakestArea,
        answers: quizSession.answers as unknown as Json,
        question_order: quizSession.questionOrder as unknown as Json,
        timetakenseconds: null,
      });
    }

    if (arenaState) {
      await saveArenaAttempt({
        userId,
        dedupeKey: `migration:arena:${arenaState.sessionMode}:${arenaState.responses
          .map((response) => `${response.takeId}-${response.answer}`)
          .join("|")}`,
        sessionmode: arenaState.sessionMode,
        thinking_profile: null,
        agree_count: arenaState.counts.agree,
        disagree_count: arenaState.counts.disagree,
        depends_count: arenaState.counts.depends,
        stance_mix: arenaState.stanceMix as unknown as Json,
        responses: arenaState.responses as unknown as Json,
      });
    }

    await supabase.from("profiles").upsert(
      {
        id: userId,
        current_streak: retention.currentStreak,
        longest_streak: retention.bestStreak,
        lastactivedate:
          retention.lastActiveDate ?? new Date().toISOString().slice(0, 10),
      },
      { onConflict: "id" }
    );

    markMigrated(userId);
  } catch {
    // Keep the anonymous path intact if migration fails.
  }
}
