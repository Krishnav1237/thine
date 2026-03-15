"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import BrandHeader from "../components/BrandHeader";
import { MAX_SCORE, questions } from "../data/questions";
import {
  clearQuizSession,
  readQuizSession,
  writeQuizSession,
} from "../lib/quiz-session";

export default function QuizPage() {
  const router = useRouter();
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedSession = readQuizSession();

      if (savedSession) {
        if (
          savedSession.currentIndex >= questions.length &&
          savedSession.answers.length === questions.length
        ) {
          const completedScore = savedSession.answers.reduce(
            (sum, score) => sum + score,
            0
          );

          startTransition(() => {
            router.replace(`/results?score=${completedScore}`);
          });
          return;
        }

        setAnswers(savedSession.answers);
        setCurrentIndex(savedSession.currentIndex);
      }

      setIsReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [router]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    writeQuizSession({
      answers,
      currentIndex,
    });
  }, [answers, currentIndex, isReady]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const handleOptionSelect = useCallback(
    (score: number, index: number) => {
      if (isTransitioning || !isReady) {
        return;
      }

      setIsTransitioning(true);
      setSelectedOptionIndex(index);

      const nextAnswers = [...answers, score];

      transitionTimerRef.current = setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setAnswers(nextAnswers);
          setCurrentIndex((previousIndex) => previousIndex + 1);
          setSelectedOptionIndex(null);
          setIsTransitioning(false);
          return;
        }

        const totalScore = nextAnswers.reduce((sum, value) => sum + value, 0);

        writeQuizSession({
          answers: nextAnswers,
          currentIndex: questions.length,
        });

        startTransition(() => {
          router.push(`/results?score=${totalScore}`);
        });
      }, 320);
    },
    [answers, currentIndex, isReady, isTransitioning, router]
  );

  const handleBack = useCallback(() => {
    if (isTransitioning || !isReady) {
      return;
    }

    if (currentIndex === 0) {
      startTransition(() => {
        router.push("/");
      });
      return;
    }

    setCurrentIndex((previousIndex) => previousIndex - 1);
    setAnswers((previousAnswers) => previousAnswers.slice(0, -1));
    setSelectedOptionIndex(null);
  }, [currentIndex, isReady, isTransitioning, router]);

  const handleStartOver = useCallback(() => {
    if (!isReady || isTransitioning) {
      return;
    }

    clearQuizSession();
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOptionIndex(null);
  }, [isReady, isTransitioning]);

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="page-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <div className="page-shell quiz-page-shell">
        <BrandHeader />

        <main className="quiz-main">
          <div className="quiz-toolbar">
            <button
              onClick={handleBack}
              className="nav-back-btn"
              disabled={isTransitioning || !isReady}
              type="button"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <button
              onClick={handleStartOver}
              className="text-link-button"
              disabled={isTransitioning || !isReady || answers.length === 0}
              type="button"
            >
              Start over
            </button>
          </div>

          <section className="quiz-frame">
            <div className="progress-container">
              <div className="progress-label">
                <span>
                  Question {Math.min(currentIndex + 1, questions.length)} of{" "}
                  {questions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>

              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {!isReady ? (
              <div className="loading-card">
                <span className="section-eyebrow">Restoring progress</span>
                <p className="section-copy">
                  Loading your saved session and bringing you back to the right
                  question.
                </p>
              </div>
            ) : question ? (
              <div
                className={`question-card ${isTransitioning ? "exiting" : ""}`}
                key={currentIndex}
              >
                <div className="question-copy">
                  <div className="question-number">
                    Personal Intelligence Diagnostic
                  </div>
                  <h1 className="question-text">{question.question}</h1>
                  <p className="question-support">
                    Answer based on how you actually operate today, not on your
                    ideal system.
                  </p>
                </div>

                <ul className="options-list">
                  {question.options.map((option, index) => {
                    const isSelected = selectedOptionIndex === index;

                    return (
                      <li key={option.text}>
                        <button
                          onClick={() => handleOptionSelect(option.score, index)}
                          className={`option-btn ${isSelected ? "option-selected" : ""}`}
                          disabled={isTransitioning}
                          type="button"
                          id={`option-${index}`}
                        >
                          <span className="option-letter">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="option-text">{option.text}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </section>

          <div className="quiz-footer-note">
            Score range: 0 to {MAX_SCORE}. Higher means more of your context
            survives beyond the moment.
          </div>
        </main>
      </div>
    </div>
  );
}
