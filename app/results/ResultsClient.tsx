"use client";

import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import TierScale from "../components/TierScale";
import { MAX_SCORE, getSharePath, getTier } from "../data/questions";
import { clearQuizSession } from "../lib/quiz-session";
import { thineLinks } from "../lib/thine-links";

export default function ResultsClient({ score }: { score: number }) {
  const router = useRouter();
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const tier = getTier(score);
  const sharePath = getSharePath(score);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

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

  const handleShare = async () => {
    const shareUrl = new URL(sharePath, window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
      showFeedback("Public share link copied.");
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();

      const copied = document.execCommand("copy");

      document.body.removeChild(input);

      if (copied) {
        showFeedback("Public share link copied.");
        return;
      }

      window.prompt("Copy this public share link:", shareUrl);
      showFeedback("Copy the link from the dialog.");
    }
  };

  const handleRetake = () => {
    clearQuizSession();

    startTransition(() => {
      router.push("/quiz");
    });
  };

  return (
    <main className="report-main">
      <section className="report-hero">
        <div className="report-card report-score-card">
          <span className="score-label">Personal Intelligence Score</span>
          <div className="results-score-stack">
            <span className="results-score-value">{score}</span>
            <span className="results-score-total">/ {MAX_SCORE}</span>
          </div>
          <p className="score-caption">How much context your system keeps alive.</p>
        </div>

        <div className="report-card report-summary-card">
          <span className="section-eyebrow">Your tier</span>
          <h1 className="results-tier">{tier.name}</h1>
          <p className="hero-support">{tier.tagline}</p>

          <div className="chip-row">
            <span className="chip">10-question diagnostic</span>
            <span className="chip">
              Tier band {tier.min}-{tier.max}
            </span>
          </div>
        </div>
      </section>

      <section className="insight-grid compact-insight-grid">
        <article className="insight-card">
          <span className="section-eyebrow">Current mode</span>
          <p>{tier.focus}</p>
        </article>

        <article className="insight-card">
          <span className="section-eyebrow">Next move</span>
          <p>{tier.unlock}</p>
        </article>
      </section>

      <TierScale currentScore={score} />

      <section className="report-card conversion-card">
        <div className="section-heading">
          <span className="section-eyebrow">Why Thine</span>
          <h2 className="conversion-title">
            Thine remembers what your brain drops.
          </h2>
          <p className="section-copy">
            Meetings, commitments, people, and open loops stay retrievable
            instead of leaking out of memory.
          </p>
        </div>
      </section>

      <div className="results-actions">
        <button onClick={handleShare} className="btn-primary" type="button">
          Copy Share Link
        </button>
        <Link href={sharePath} className="btn-secondary">
          Preview Share Card
        </Link>
        <a
          href={thineLinks.results}
          className="btn-secondary"
          target="_blank"
          rel="noreferrer"
        >
          See How Thine Works
        </a>
      </div>

      <div className="results-share-note">
        Copies a compact public scorecard.
      </div>

      <div className="results-footer-row">
        <button onClick={handleRetake} className="text-link-button" type="button">
          Take the quiz again
        </button>
      </div>

      <div className={`share-toast ${showToast ? "visible" : ""}`}>
        {toastMessage}
      </div>
    </main>
  );
}
