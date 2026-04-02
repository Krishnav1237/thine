"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import AuthPromptCard from "../components/auth/AuthPromptCard";
import { capturePostHogEvent } from "../components/PostHogProvider";
import DailyCheckInCard from "../components/DailyCheckInCard";
import PlaybookCard from "../components/PlaybookCard";
import RankBadge from "../components/shared/RankBadge";
import StreakCounter from "../components/shared/StreakCounter";
import XPAnimation from "../components/shared/XPAnimation";
import {
  DEFAULT_QUIZ_MODE,
  MAX_SCORE,
  QUIZ_SESSION_PRESETS,
  computeScoreFromAnswers,
  getDimension,
  getSharePath,
  normalizeScore,
} from "../data/questions";
import { analyzeUser, getPercentileCopy, getScoreBand } from "../lib/analyzeUser";
import {
  clearQuizSession,
  readQuizSession,
  type QuizSession,
} from "../lib/quiz-session";
import {
  buildChallengePath,
  getChallengeCompletionCount,
  getOrCreateRefId,
  readChallenge,
  readChallengeCompletionCount,
  type ChallengeData,
} from "../lib/challenge";
import { shareResult } from "../lib/share-card";
import {
  readLocalPlayerStats,
  saveQuizAttempt,
  saveSharedResult,
} from "../lib/supabase/sync";
import type { Json, RankTier } from "../lib/supabase/types";
import { thineLinks } from "../lib/thine-links";
import { useAuth } from "../hooks/useAuth";

const ShareCard = dynamic(() => import("../components/shared/ShareCard"), {
  ssr: false,
});

const REQUIRED_CHALLENGE_COMPLETIONS = 3;
const SHARE_UNLOCK_KEY = "thine-share-unlocked";
const EMPTY_ANSWERS: number[] = [];

interface QuizSyncState {
  xpEarned: number;
  bonusXP: number;
  currentStreak: number;
  longestStreak: number;
  rankTier: RankTier;
  totalXP: number;
  piScore?: number;
}

export default function ResultsClient({ score }: { score: number }) {
  const router = useRouter();
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const saveAttemptRef = useRef(false);
  const savedShareUrlRef = useRef<{ key: string; url: string } | null>(null);
  const {
    user,
    profile: authProfile,
    refreshProfile,
  } = useAuth();
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [session] = useState<QuizSession | null>(() => readQuizSession());
  const [playerStats, setPlayerStats] = useState(() => readLocalPlayerStats());
  const [quizSync, setQuizSync] = useState<QuizSyncState | null>(null);
  const [xpBurst, setXpBurst] = useState(0);
  const [savedShareUrl, setSavedShareUrl] = useState<{
    key: string;
    url: string;
  } | null>(null);
  const [shareCardMounted, setShareCardMounted] = useState(false);
  const [includeNameInShare, setIncludeNameInShare] = useState(() =>
    Boolean(readQuizSession()?.profile?.name)
  );
  const [challenge] = useState<ChallengeData | null>(() => readChallenge());
  const [refId] = useState<string | null>(() => getOrCreateRefId());
  const [completionCount, setCompletionCount] = useState(() =>
    readChallengeCompletionCount(getOrCreateRefId())
  );
  const [bonusUnlocked, setBonusUnlocked] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const raw = window.localStorage.getItem(SHARE_UNLOCK_KEY);
    if (!raw) {
      return false;
    }

    try {
      const parsed = JSON.parse(raw) as { unlocked?: boolean; dateKey?: string };
      return parsed?.unlocked === true || Boolean(parsed?.dateKey);
    } catch {
      return raw === "true";
    }
  });

  const sessionScore = (() => {
    if (!session?.answers?.length) {
      return null;
    }

    const expectedCount =
      session.questionOrder?.length ??
      QUIZ_SESSION_PRESETS[session.sessionMode ?? DEFAULT_QUIZ_MODE].count;

    if (session.answers.length < expectedCount) {
      return null;
    }

    return computeScoreFromAnswers(session.answers);
  })();

  const normalizedScore = normalizeScore(sessionScore ?? score);
  const band = getScoreBand(normalizedScore);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (shareCardMounted || typeof window === "undefined") {
      return;
    }

    let cancelled = false;
    const mount = () => {
      if (!cancelled) {
        setShareCardMounted(true);
      }
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(mount, { timeout: 1800 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timer = globalThis.setTimeout(mount, 1200);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(timer);
    };
  }, [shareCardMounted]);

  useEffect(() => {
    if (!refId) {
      return;
    }

    let active = true;

    const refreshCompletionCount = async () => {
      const count = await getChallengeCompletionCount(refId);

      if (active) {
        setCompletionCount(count);
      }
    };

    void refreshCompletionCount();

    const shouldPoll =
      bonusUnlocked && completionCount < REQUIRED_CHALLENGE_COMPLETIONS;
    const intervalId = shouldPoll
      ? window.setInterval(() => {
          if (document.visibilityState === "visible") {
            void refreshCompletionCount();
          }
        }, 30000)
      : null;

    const handleFocus = () => {
      void refreshCompletionCount();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      window.removeEventListener("focus", handleFocus);
    };
  }, [bonusUnlocked, completionCount, refId]);

  const answers = useMemo(
    () => session?.answers ?? EMPTY_ANSWERS,
    [session?.answers]
  );
  const questionOrder = session?.questionOrder;
  const analysis = useMemo(
    () => analyzeUser(answers, normalizedScore, questionOrder),
    [answers, normalizedScore, questionOrder]
  );

  useEffect(() => {
    if (saveAttemptRef.current) {
      return;
    }

    if (!session?.questionOrder?.length || sessionScore === null) {
      return;
    }

    saveAttemptRef.current = true;

    void saveQuizAttempt({
      userId: user?.id ?? null,
      dedupeKey: `quiz:${session.sessionMode ?? DEFAULT_QUIZ_MODE}:${session.questionOrder.join("-")}:${session.answers.join("-")}`,
      sessionmode: session.sessionMode ?? DEFAULT_QUIZ_MODE,
      score: normalizedScore,
      max_score: MAX_SCORE,
      normalized_score: normalizedScore,
      score_band: band.name,
      dimension_scores: analysis.dimensionScores as unknown as Json,
      strengths: analysis.strengths as unknown as Json,
      weakest_area: analysis.weakestArea,
      answers: session.answers as unknown as Json,
      question_order: session.questionOrder as unknown as Json,
      timetakenseconds: null,
    }).then((result) => {
      if (!result) {
        return;
      }

      setQuizSync(result);
      setPlayerStats(readLocalPlayerStats());
      setXpBurst(result.xpEarned);

      if (user?.id) {
        void refreshProfile();
      }
    });
  }, [
    analysis.dimensionScores,
    analysis.strengths,
    analysis.weakestArea,
    band.name,
    normalizedScore,
    refreshProfile,
    session,
    sessionScore,
    user?.id,
  ]);

  useEffect(() => {
    if (!xpBurst) {
      return;
    }

    const timer = window.setTimeout(() => setXpBurst(0), 1800);
    return () => window.clearTimeout(timer);
  }, [xpBurst]);

  const sortedDimensions = useMemo(
    () => [...analysis.dimensionScores].sort((a, b) => b.percent - a.percent),
    [analysis.dimensionScores]
  );
  const strongestDimension = sortedDimensions[0];
  const weakestDimensionScore = sortedDimensions[sortedDimensions.length - 1];
  const weakestDimension = getDimension(
    weakestDimensionScore?.key ?? analysis.weakestArea
  );
  const dimensionSpread =
    strongestDimension && weakestDimensionScore
      ? Math.max(0, strongestDimension.percent - weakestDimensionScore.percent)
      : 0;
  const percentileCopy = getPercentileCopy(normalizedScore);
  const bandSpan = band.max - band.min;
  const bandProgress =
    bandSpan > 0 ? Math.round(((normalizedScore - band.min) / bandSpan) * 100) : 0;
  const analysisUnlocked =
    bonusUnlocked && completionCount >= REQUIRED_CHALLENGE_COMPLETIONS;
  const weaknessLabel = weakestDimensionScore
    ? `${weakestDimension.title} (${weakestDimensionScore.percent}%)`
    : weakestDimension.title;

  const comparisonCopy = useMemo(() => {
    if (!challenge) {
      return null;
    }

    const challengerName = challenge.challengerName ?? "Someone";

    if (normalizedScore > challenge.challengerScore) {
      return `You beat ${challengerName} 🔥`;
    }

    if (normalizedScore < challenge.challengerScore) {
      return `You lost to ${challengerName} 😬`;
    }

    return `You tied with ${challengerName} 🤝`;
  }, [challenge, normalizedScore]);

  const showFeedback = (message: string) => {
    setToastMessage(message);
    setShowToast(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 2400);
  };

  const unlockBonus = () => {
    setBonusUnlocked(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        SHARE_UNLOCK_KEY,
        JSON.stringify({ unlocked: true })
      );
    }
  };

  const shareName = includeNameInShare ? session?.profile?.name : undefined;
  const shareDisplayName = shareName?.trim();
  const shareCacheKey = shareDisplayName ?? "__anonymous__";
  const sharePath = getSharePath(normalizedScore, shareName);
  const shareToggleDisabled = !session?.profile?.name;
  const challengePath = buildChallengePath(normalizedScore, shareName, refId);
  const currentStreak =
    authProfile?.current_streak ??
    quizSync?.currentStreak ??
    playerStats.currentStreak;
  const longestStreak =
    authProfile?.longest_streak ??
    quizSync?.longestStreak ??
    playerStats.longestStreak;
  const totalXP =
    authProfile?.total_xp ??
    quizSync?.totalXP ??
    playerStats.totalXP;
  const rankTier =
    (authProfile?.ranktier ??
      quizSync?.rankTier ??
      playerStats.rankTier ??
      "bronze") as RankTier;
  const sharePreviewHref =
    savedShareUrl?.key === shareCacheKey ? savedShareUrl.url : sharePath;

  const ensureShareCardMounted = async (): Promise<void> => {
    if (shareCardMounted) {
      return;
    }

    setShareCardMounted(true);
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });
  };

  const resolveShareUrl = async () => {
    const fallbackUrl = new URL(sharePath, window.location.origin).toString();

    if (savedShareUrlRef.current?.key === shareCacheKey) {
      return savedShareUrlRef.current.url;
    }

    if (!user?.id) {
      return fallbackUrl;
    }

    const sharedResultId = await saveSharedResult({
      userId: user.id,
      resulttype: "quiz",
      score: normalizedScore,
      score_band: band.name,
      display_name: shareDisplayName ?? quizProfile?.name ?? null,
      dimension_scores: analysis.dimensionScores as unknown as Json,
      thinking_profile: null,
      stance_data: null,
      shareimageurl: null,
    });

    const nextUrl = sharedResultId
      ? new URL(`/share/${sharedResultId}`, window.location.origin).toString()
      : fallbackUrl;
    const nextShare = {
      key: shareCacheKey,
      url: nextUrl,
    };
    savedShareUrlRef.current = nextShare;
    setSavedShareUrl(nextShare);
    return nextUrl;
  };

  const copyShareLink = async (path: string, message: string) => {
    const shareUrl = /^https?:\/\//i.test(path)
      ? path
      : new URL(path, window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
      showFeedback(message);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();

      const copied = document.execCommand("copy");

      document.body.removeChild(input);

      if (copied) {
        showFeedback(message);
        return;
      }

      window.prompt("Copy this share link:", shareUrl);
      showFeedback(message);
    }
  };

  const handleShare = async () => {
    capturePostHogEvent("share_clicked", { type: "link" });
    const shareUrl = await resolveShareUrl();
    await copyShareLink(shareUrl, "Link copied.");
    unlockBonus();
  };

  const handleImageShare = async () => {
    capturePostHogEvent("share_clicked", { type: "image" });
    try {
      await ensureShareCardMounted();
      const shareUrl = await resolveShareUrl();
      const result = await shareResult({
        cardRef: shareCardRef,
        shareUrl,
        title: shareDisplayName
          ? `${shareDisplayName}'s Thine score`
          : "Thine scorecard",
        text: shareDisplayName
          ? `${shareDisplayName} scored ${normalizedScore} in Thine.`
          : `I scored ${normalizedScore} in Thine.`,
        fileName: `thine-score-${normalizedScore}.png`,
      });

      showFeedback(result.message);
      unlockBonus();
    } catch {
      const shareUrl = await resolveShareUrl();
      await copyShareLink(shareUrl, "Link copied.");
      unlockBonus();
    }
  };

  const handleChallengeShare = async () => {
    capturePostHogEvent("share_clicked", { type: "link" });
    await copyShareLink(challengePath, "Link copied.");
    unlockBonus();
  };

  const handleRetake = () => {
    clearQuizSession();

    startTransition(() => {
      router.push("/quiz");
    });
  };

  const quizProfile = session?.profile;
  const focusDimension = quizProfile?.focus ? getDimension(quizProfile.focus) : null;
  const focusCopy = focusDimension
    ? `Urgent focus: ${focusDimension.title}`
    : "No focus selected";
  const profileChips = [
    quizProfile?.name ? `Profile: ${quizProfile.name}` : null,
    quizProfile?.role ?? null,
    focusDimension ? focusCopy : null,
    bonusUnlocked ? "Shared ✓" : null,
  ].filter((item): item is string => Boolean(item));
  const groupComparison =
    strongestDimension && weakestDimensionScore
      ? `Strongest signal: ${strongestDimension.title} (${strongestDimension.percent}%). Weakest: ${weakestDimension.title} (${weakestDimensionScore.percent}%). Gap: ${dimensionSpread}%.`
      : `Your lowest signal right now is ${weakestDimension.title}.`;


  const title = quizProfile?.name
    ? `${quizProfile.name}'s Intelligence Report`
    : "Your Intelligence Report";
  const eyebrow = quizProfile?.name
    ? `Personalized for ${quizProfile.name}`
    : "Your Intelligence Report";

  return (
    <main className="report-main">
      <section className="report-card result-share-card">
        <div className="result-share-grid">
          <div className="result-share-summary">
            <span className="section-eyebrow">{eyebrow}</span>
            <h1 className="result-title">{title}</h1>
            {profileChips.length > 0 ? (
              <div className="chip-row result-chip-row">
                {profileChips.map((chip) => (
                  <span key={chip} className="chip">
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="result-meta">
              <p className="result-percentile">{percentileCopy}</p>
              {comparisonCopy ? (
                <p className="result-compare">{comparisonCopy}</p>
              ) : null}
            </div>

            <div className="result-achievement-row">
              <StreakCounter
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                compact
              />
              <RankBadge tier={rankTier} totalXP={totalXP} />
            </div>

            <div className="result-grid">
              <div className="result-block">
                <span className="section-eyebrow">Strengths</span>
                <ul className="result-list">
                  {analysis.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="result-block">
                <span className="section-eyebrow">Weakness</span>
                <p className="result-weakness">{weaknessLabel}</p>
              </div>
            </div>
          </div>

          <div className="result-share-preview">
            {xpBurst ? (
              <XPAnimation
                xpAmount={xpBurst}
                bonusText={quizSync?.bonusXP ? "Streak bonus" : undefined}
                visible={xpBurst > 0}
              />
            ) : null}
            <div className="share-spotlight-card">
              {shareDisplayName ? (
                <span className="share-spotlight-name">
                  For {shareDisplayName}
                </span>
              ) : null}
              <div className="share-spotlight-score">
                {normalizedScore}
                <span>/ {MAX_SCORE}</span>
              </div>
              <div className="share-spotlight-band">
                <span className="section-eyebrow">Category</span>
                <h3>{band.name}</h3>
                <p>{band.tagline}</p>
              </div>
              <div className="share-spotlight-chip-row">
                <span className="chip">
                  Band {band.min}-{band.max}
                </span>
                <span className="chip">Public scorecard</span>
              </div>
            </div>
            <div className="result-share-actions">
              <div className="share-spotlight-actions">
                <button onClick={handleShare} className="btn-primary" type="button">
                  Share result
                </button>
                <button
                  onClick={handleImageShare}
                  className="btn-secondary"
                  type="button"
                >
                  Share as image
                </button>
                <a
                  href={sharePreviewHref}
                  className="btn-secondary"
                  onClick={() =>
                    capturePostHogEvent("share_clicked", { type: "preview" })
                  }
                >
                  Preview
                </a>
              </div>
              <p className="results-share-note">
                Share your scorecard so friends can compare and unlock the full
                analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="results-support-grid">
        <AuthPromptCard sourcePage="results" xpEarned={quizSync?.xpEarned ?? 0} />
        <DailyCheckInCard name={quizProfile?.name} context="results" />
      </div>

      <section className="report-card action-card">
        <div className="action-card-grid">
          <div className="section-heading action-card-copy">
            <span className="section-eyebrow">Next steps</span>
            <h2 className="conversion-title">
              Challenge friends or retake in 3 days.
            </h2>
            <p className="section-copy">
              Full analysis unlocks after you share and{" "}
              {REQUIRED_CHALLENGE_COMPLETIONS} friends finish from your link.
            </p>
          </div>

          <div className="action-card-rail">
            <div className="action-row">
              <button
                onClick={handleChallengeShare}
                className="btn-primary"
                type="button"
              >
                Challenge friends
              </button>
              <Link href="/arena" className="btn-secondary">
                Play Hot Takes Arena
              </Link>
              <button
                onClick={handleRetake}
                className="btn-secondary"
                type="button"
              >
                Retake in 3 Days
              </button>
            </div>

            <div className="action-utility-grid">
              <label
                className={`share-privacy-toggle ${shareToggleDisabled ? "disabled" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={includeNameInShare}
                  onChange={(event) => setIncludeNameInShare(event.target.checked)}
                  disabled={shareToggleDisabled}
                />
                <span>Include my name in the share link</span>
              </label>

              <div className="action-progress">
                <span className="action-progress-count">
                  {Math.min(completionCount, REQUIRED_CHALLENGE_COMPLETIONS)}/
                  {REQUIRED_CHALLENGE_COMPLETIONS}
                </span>
                <span className="action-progress-copy">
                  Challenge completions recorded
                </span>
              </div>

              <div className="results-share-note">
                Challenge links include your score and optional name.
              </div>
            </div>
          </div>
        </div>
      </section>

      <PlaybookCard
        plan={analysis.improvementPlan}
        improvementLevel={analysis.improvementLevel}
        name={quizProfile?.name}
      />

      <section className="report-card locked-card">
        <div className={`locked-content ${analysisUnlocked ? "unlocked" : ""}`}>
          <div className="section-heading">
            <span className="section-eyebrow">Full analysis</span>
            <h2 className="conversion-title">Deep dive on your signal map.</h2>
            <p className="section-copy">
              Detailed breakdowns, signal spread, and band position.
            </p>
          </div>

          <div className="locked-grid">
            <div className="locked-panel">
              <span className="section-eyebrow">Dimension breakdown</span>
              <ul className="locked-list">
                {analysis.dimensionScores.map((item) => (
                  <li key={item.key} className="locked-row">
                    <div className="locked-row-title">{item.title}</div>
                    <div className="locked-row-meter">
                      <div className="locked-row-track" aria-hidden="true">
                        <div
                          className="locked-row-fill"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="locked-row-value">{item.percent}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="locked-panel">
              <span className="section-eyebrow">Signal spread</span>
              <p className="section-copy">{groupComparison}</p>
              <p className="section-copy">
                Tighten {weakestDimension.title} to close the gap.
              </p>
            </div>

            <div className="locked-panel">
              <span className="section-eyebrow">Band position</span>
              <p className="section-copy">
                You are {bandProgress}% through {band.name}.
              </p>
              <p className="section-copy">
                Band range: {band.min}-{band.max}.
              </p>
              <p className="section-copy">Score range: 0 to {MAX_SCORE}.</p>
            </div>
          </div>
        </div>

        {!analysisUnlocked ? (
          <div className="locked-overlay">
            <div className="locked-overlay-content">
              <div className="locked-badge">FULL ANALYSIS LOCKED</div>
              <p className="section-copy">
                {!bonusUnlocked
                  ? "Share your scorecard to start tracking completions."
                  : `${completionCount}/${REQUIRED_CHALLENGE_COMPLETIONS} challenge completions recorded. Unlocks at ${REQUIRED_CHALLENGE_COMPLETIONS}.`}
              </p>
              <button
                className="btn-primary"
                type="button"
                onClick={handleChallengeShare}
              >
                Share Challenge Link
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <details className="report-card collapsible-card">
        <summary className="collapsible-summary">
          <div className="collapsible-title">
            <span className="section-eyebrow">Why Thine</span>
            <h2 className="conversion-title">Turn this into a system.</h2>
          </div>
          <span className="collapsible-toggle">View</span>
        </summary>
        <div className="collapsible-body">
          <p className="section-copy">
            Thine keeps meetings, commitments, and relationship context
            retrievable so your intelligence never depends on memory alone.
          </p>
          <div className="conversion-actions">
            <a
              href={thineLinks.results}
              className="btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              See How Thine Works
            </a>
            <button
              onClick={handleRetake}
              className="btn-secondary"
              type="button"
            >
              Retake in 3 Days
            </button>
          </div>
        </div>
      </details>

      <div
        className={`share-toast ${showToast ? "visible" : ""}`}
        role="alert"
        aria-live="assertive"
      >
        {toastMessage}
      </div>

      {shareCardMounted ? (
        <ShareCard
          cardRef={shareCardRef}
          variant="quiz"
          name={shareDisplayName ?? quizProfile?.name}
          score={normalizedScore}
          bandName={band.name}
          dimensions={analysis.dimensionScores}
          streak={currentStreak}
          tier={rankTier}
        />
      ) : null}
    </main>
  );
}
