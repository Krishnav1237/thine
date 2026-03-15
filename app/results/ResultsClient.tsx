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
          <p className="score-caption">
            The score reflects how much context your current system keeps alive
            after the moment is over.
          </p>
        </div>

        <div className="report-card report-summary-card">
          <span className="section-eyebrow">Your tier</span>
          <h1 className="results-tier">{tier.name}</h1>
          <p className="hero-support">{tier.tagline}</p>
          <p className="report-body">{tier.description}</p>

          <div className="chip-row">
            <span className="chip">10-question diagnostic</span>
            <span className="chip">
              Tier band {tier.min}-{tier.max}
            </span>
            <span className="chip">Share-ready report</span>
          </div>
        </div>
      </section>

      <section className="insight-grid">
        <article className="insight-card">
          <span className="section-eyebrow">What this score says</span>
          <p>{tier.focus}</p>
        </article>

        <article className="insight-card">
          <span className="section-eyebrow">Where friction shows up</span>
          <p>{tier.blindSpot}</p>
        </article>

        <article className="insight-card">
          <span className="section-eyebrow">Next unlock</span>
          <p>{tier.unlock}</p>
        </article>
      </section>

      <section className="report-card signal-card">
        <div className="section-heading">
          <span className="section-eyebrow">Patterns in this tier</span>
          <p className="section-copy">
            These signals describe the operating pattern most likely associated
            with your score.
          </p>
        </div>

        <ul className="signal-list">
          {tier.signals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </section>

      <TierScale currentScore={score} />

      <section className="report-card conversion-card">
        <div className="section-heading">
          <span className="section-eyebrow">What Thine does next</span>
          <h2 className="conversion-title">
            Thine turns meetings, commitments, and relationship context into a
            living system.
          </h2>
          <p className="section-copy">
            If this score stings, that is the point. Thine is built to make
            your most important conversations and follow-ups retrievable before
            they disappear.
          </p>
        </div>

        <div className="conversion-grid">
          <article className="conversion-point">
            <strong>Remember the room</strong>
            <p>Bring the right context into every meeting instead of starting cold.</p>
          </article>
          <article className="conversion-point">
            <strong>Track open loops</strong>
            <p>Stop letting commitments and promises leak out of memory.</p>
          </article>
          <article className="conversion-point">
            <strong>Compound relationships</strong>
            <p>Keep a live picture of where your key people and threads stand.</p>
          </article>
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
        Copies a public scorecard link, not your full personal results page.
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
