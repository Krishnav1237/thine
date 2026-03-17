"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import PlaybookCard from "../components/PlaybookCard";
import ResultCard from "../components/ResultCard";
import {
  MAX_SCORE,
  getDimension,
  getSharePath,
  normalizeScore,
  reorderAnswersToBase,
} from "../data/questions";
import {
  analyzeUser,
  getPercentileCopy,
  getScoreBand,
  getScoreCategory,
} from "../lib/analyzeUser";
import {
  clearQuizSession,
  readQuizSession,
  type QuizSession,
} from "../lib/quiz-session";
import {
  buildChallengePath,
  getOrCreateRefId,
  readChallenge,
  readChallengeCompletionCount,
  type ChallengeData,
} from "../lib/challenge";
import { thineLinks } from "../lib/thine-links";

const REQUIRED_CHALLENGE_COMPLETIONS = 3;

export default function ResultsClient({ score }: { score: number }) {
  const router = useRouter();
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [includeNameInShare, setIncludeNameInShare] = useState(false);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [refId, setRefId] = useState<string | null>(null);
  const [completionCount, setCompletionCount] = useState(0);

  const normalizedScore = normalizeScore(score);
  const band = getScoreBand(normalizedScore);

  useEffect(() => {
    setSession(readQuizSession());
  }, []);

  useEffect(() => {
    if (session?.profile?.name) {
      setIncludeNameInShare(true);
    }
  }, [session?.profile?.name]);

  useEffect(() => {
    setChallenge(readChallenge());
  }, []);

  useEffect(() => {
    const resolvedRef = getOrCreateRefId();
    setRefId(resolvedRef);
    setCompletionCount(readChallengeCompletionCount(resolvedRef));
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const answers = session?.answers ?? [];
  const questionOrder = session?.questionOrder;
  const baseAnswers = useMemo(
    () => reorderAnswersToBase(answers, questionOrder),
    [answers, questionOrder]
  );

  const analysis = useMemo(
    () => analyzeUser(baseAnswers, normalizedScore),
    [baseAnswers, normalizedScore]
  );

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
  const category = getScoreCategory(normalizedScore);
  const bandSpan = band.max - band.min;
  const bandProgress =
    bandSpan > 0 ? Math.round(((normalizedScore - band.min) / bandSpan) * 100) : 0;
  const analysisUnlocked =
    completionCount >= REQUIRED_CHALLENGE_COMPLETIONS;
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

  const shareName = includeNameInShare ? session?.profile?.name : undefined;
  const sharePath = getSharePath(normalizedScore, shareName);
  const shareToggleDisabled = !session?.profile?.name;
  const challengePath = buildChallengePath(normalizedScore, shareName, refId);

  const copyChallengeLink = async (message: string) => {
    const shareUrl = new URL(challengePath, window.location.origin).toString();

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
      showFeedback("Copy the link from the dialog.");
    }
  };

  const handleShare = async () => {
    await copyChallengeLink("Challenge link copied.");
  };

  const handleChallengeShare = async () => {
    await copyChallengeLink("Challenge link copied.");
  };

  const handleRetake = () => {
    clearQuizSession();

    startTransition(() => {
      router.push("/quiz");
    });
  };

  const profile = session?.profile;
  const focusDimension = profile?.focus ? getDimension(profile.focus) : null;
  const focusCopy = focusDimension
    ? `Urgent focus: ${focusDimension.title}`
    : "No focus selected";
  const profileChips = [
    profile?.name ? `Profile: ${profile.name}` : null,
    profile?.role ?? null,
    focusDimension ? focusCopy : null,
  ].filter((item): item is string => Boolean(item));
  const groupComparison =
    strongestDimension && weakestDimensionScore
      ? `Strongest signal: ${strongestDimension.title} (${strongestDimension.percent}%). Weakest: ${weakestDimension.title} (${weakestDimensionScore.percent}%). Gap: ${dimensionSpread}%.`
      : `Your lowest signal right now is ${weakestDimension.title}.`;

  return (
    <main className="report-main">
      <ResultCard
        score={normalizedScore}
        category={category}
        percentileCopy={percentileCopy}
        strengths={analysis.strengths}
        weakness={weaknessLabel}
        comparison={comparisonCopy}
        name={profile?.name}
        chips={profileChips}
      />

      <section className="report-card action-card">
        <div className="section-heading">
          <span className="section-eyebrow">Next steps</span>
          <h2 className="conversion-title">Challenge friends or retake in 3 days.</h2>
          <p className="section-copy">
            Full analysis unlocks after {REQUIRED_CHALLENGE_COMPLETIONS}
            completions are recorded from your link.
          </p>
        </div>

        <div className="action-row">
          <button onClick={handleShare} className="btn-primary" type="button">
            Copy Challenge Link
          </button>
          <Link href={sharePath} className="btn-secondary">
            Preview Scorecard
          </Link>
          <Link href="/arena" className="btn-secondary">
            Play Hot Takes Arena
          </Link>
          <button onClick={handleRetake} className="btn-secondary" type="button">
            Retake in 3 Days
          </button>
        </div>

        <div className="action-subrow">
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
          <div className="results-share-note">
            Challenge links include your score and optional name.
          </div>
        </div>

        <div className="action-progress">
          <span className="action-progress-count">
            {Math.min(completionCount, REQUIRED_CHALLENGE_COMPLETIONS)}/
            {REQUIRED_CHALLENGE_COMPLETIONS}
          </span>
          <span className="action-progress-copy">
            Challenge completions recorded
          </span>
        </div>
      </section>

      <PlaybookCard
        plan={analysis.improvementPlan}
        improvementLevel={analysis.improvementLevel}
      />

      <section className="report-card progress-card">
        <div className="section-heading">
          <span className="section-eyebrow">Progress framing</span>
          <h2 className="conversion-title">
            {band.name} band progress: {bandProgress}%
          </h2>
          <p className="section-copy">
            Score range {band.min}-{band.max}. Retake in 3 days to lock in the
            gains.
          </p>
        </div>
        <div className="progress-meta">
          <span className="progress-chip">
            Score: {normalizedScore}/{MAX_SCORE}
          </span>
          <span className="progress-chip">Band range: {band.min}-{band.max}</span>
        </div>
      </section>

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
                {completionCount}/{REQUIRED_CHALLENGE_COMPLETIONS} challenge
                completions recorded. Unlocks at {REQUIRED_CHALLENGE_COMPLETIONS}.
              </p>
              <button
                className="btn-primary"
                type="button"
                onClick={handleChallengeShare}
              >
                Copy Challenge Link
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

      <div className="results-footer-row">
        <button onClick={handleRetake} className="text-link-button" type="button">
          Take the diagnostic again
        </button>
      </div>

      <div className={`share-toast ${showToast ? "visible" : ""}`}>
        {toastMessage}
      </div>
    </main>
  );
}
