"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { questions } from "./data/questions";
import { readQuizSession } from "./lib/quiz-session";

export default function LandingCta() {
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const session = readQuizSession();

      setHasProgress(
        Boolean(
          session &&
            session.currentIndex < questions.length &&
            (session.answers.length > 0 || session.introCompleted)
        )
      );
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="landing-primary-action">
      <Link href="/quiz" className="btn-primary" id="start-quiz">
        {hasProgress ? "Resume the Quiz" : "Take the Quiz"}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Link>

      {hasProgress ? (
        <span className="landing-resume-note">Progress is saved in this browser.</span>
      ) : null}
    </div>
  );
}
