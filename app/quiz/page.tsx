"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import BrandHeader from "../components/BrandHeader";
import {
  MAX_SCORE,
  computeScoreFromAnswers,
  dimensions,
  getDimension,
  getPersonalizedQuestion,
  getQuestionOrder,
  getQuestionsByOrder,
  questions,
  type DimensionKey,
} from "../data/questions";
import {
  clearQuizSession,
  readQuizSession,
  type QuizProfile,
  writeQuizSession,
} from "../lib/quiz-session";
import { registerChallengeCompletion } from "../lib/challenge";

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
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftRole, setDraftRole] = useState("");
  const [draftFocus, setDraftFocus] = useState<DimensionKey | null>(null);
  const [questionOrder, setQuestionOrder] = useState<number[] | null>(null);

  const rolePlaceholder = "Founder, PM, Partner, Designer...";
  const questionCount = questionOrder?.length ?? questions.length;

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedSession = readQuizSession();

      if (savedSession) {
        const savedOrder = savedSession.questionOrder ?? null;
        const totalQuestions = savedOrder?.length ?? questions.length;

        if (
          savedSession.currentIndex >= totalQuestions &&
          savedSession.answers.length === totalQuestions
        ) {
          const completedScore = computeScoreFromAnswers(savedSession.answers);

          startTransition(() => {
            router.replace(`/results?score=${completedScore}`);
          });
          return;
        }

        setAnswers(savedSession.answers);
        setCurrentIndex(savedSession.currentIndex);
        if (savedOrder) {
          setQuestionOrder(savedOrder);
        } else if (savedSession.answers.length > 0) {
          setQuestionOrder(getQuestionOrder());
        } else if (savedSession.profile?.focus) {
          setQuestionOrder(getQuestionOrder(savedSession.profile.focus));
        }
        if (savedSession.profile) {
          setProfile(savedSession.profile);
          setDraftName(savedSession.profile.name ?? "");
          setDraftRole(savedSession.profile.role ?? "");
          setDraftFocus(savedSession.profile.focus ?? null);
        }
        if (savedSession.introCompleted || savedSession.profile) {
          setIntroCompleted(true);
          if (!savedOrder && savedSession.answers.length === 0) {
            setQuestionOrder(getQuestionOrder(savedSession.profile?.focus));
          }
        }
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
      profile: profile ?? undefined,
      introCompleted,
      questionOrder: questionOrder ?? undefined,
    });
  }, [answers, currentIndex, introCompleted, isReady, profile, questionOrder]);

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
        if (currentIndex < questionCount - 1) {
          setAnswers(nextAnswers);
          setCurrentIndex((previousIndex) => previousIndex + 1);
          setSelectedOptionIndex(null);
          setIsTransitioning(false);
          return;
        }

        const totalScore = computeScoreFromAnswers(nextAnswers);

        writeQuizSession({
          answers: nextAnswers,
          currentIndex: questionCount,
          profile: profile ?? undefined,
          introCompleted,
          questionOrder: questionOrder ?? undefined,
        });

        registerChallengeCompletion();

        startTransition(() => {
          router.push(`/results?score=${totalScore}`);
        });
      }, 320);
    },
    [
      answers,
      currentIndex,
      introCompleted,
      isReady,
      isTransitioning,
      profile,
      questionCount,
      questionOrder,
      router,
    ]
  );

  const handleBack = useCallback(() => {
    if (isTransitioning || !isReady) {
      return;
    }

    if (currentIndex === 0) {
      if (introCompleted && answers.length === 0) {
        setIntroCompleted(false);
        return;
      }

      startTransition(() => {
        router.push("/");
      });
      return;
    }

    setCurrentIndex((previousIndex) => previousIndex - 1);
    setAnswers((previousAnswers) => previousAnswers.slice(0, -1));
    setSelectedOptionIndex(null);
  }, [answers.length, currentIndex, introCompleted, isReady, isTransitioning, router]);

  const handleStartOver = useCallback(() => {
    if (!isReady || isTransitioning) {
      return;
    }

    clearQuizSession();
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOptionIndex(null);
    setProfile(null);
    setIntroCompleted(false);
    setDraftName("");
    setDraftRole("");
    setDraftFocus(null);
    setQuestionOrder(null);
  }, [isReady, isTransitioning]);

  const handleProfileContinue = useCallback(() => {
    if (!isReady || isTransitioning || !draftFocus) {
      return;
    }

    const nextProfile: QuizProfile = {
      name: draftName.trim() || undefined,
      role: draftRole.trim() || undefined,
      focus: draftFocus,
    };

    setProfile(nextProfile);
    setIntroCompleted(true);
    setQuestionOrder(getQuestionOrder(draftFocus));
  }, [draftFocus, draftName, draftRole, isReady, isTransitioning]);

  const handleProfileSkip = useCallback(() => {
    if (!isReady || isTransitioning) {
      return;
    }

    setIntroCompleted(true);
    setQuestionOrder(getQuestionOrder());
  }, [isReady, isTransitioning]);

  const orderedQuestions = getQuestionsByOrder(questionOrder ?? undefined);
  const question = orderedQuestions[currentIndex];
  const showIntro = isReady && !introCompleted && answers.length === 0;
  const resolvedIndex = Math.min(currentIndex + 1, questionCount);
  const progress = introCompleted ? (resolvedIndex / questionCount) * 100 : 0;
  const questionKicker = profile?.name
    ? `${profile.name}'s Diagnostic`
    : "Personal Intelligence Diagnostic";
  const focusDimension = profile?.focus ? getDimension(profile.focus) : null;
  const questionText = question
    ? getPersonalizedQuestion(question, profile?.focus)
    : "";
  const focusLead =
    focusDimension && currentIndex === 0
      ? `We’ll start with ${focusDimension.title.toLowerCase()} questions. `
      : "";
  const questionSupport = profile?.role
    ? `${focusLead}Answer based on how you operate today as a ${profile.role}, not on your ideal system.`
    : `${focusLead}Answer based on how you actually operate today, not on your ideal system.`;

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
                  {showIntro
                    ? "Personalize your diagnostic"
                    : `Question ${resolvedIndex} of ${questionCount}`}
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
            ) : showIntro ? (
              <div className="profile-card">
                <div className="section-heading">
                  <span className="section-eyebrow">Make it yours</span>
                  <h1 className="question-text">Personalize the diagnostic.</h1>
                  <p className="section-copy">
                    This adds a quick context layer so your results read like a
                    brief, not just a score. Everything is stored locally.
                  </p>
                </div>

                <div className="profile-grid">
                  <label className="profile-field">
                    <span className="profile-label">First name (optional)</span>
                    <input
                      className="profile-input"
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      placeholder="Alex"
                      type="text"
                      autoComplete="given-name"
                    />
                  </label>

                  <label className="profile-field">
                    <span className="profile-label">Role or domain (optional)</span>
                    <input
                      className="profile-input"
                      value={draftRole}
                      onChange={(event) => setDraftRole(event.target.value)}
                      placeholder={rolePlaceholder}
                      type="text"
                    />
                  </label>
                </div>

                <div className="profile-field">
                  <span className="profile-label">What feels most urgent right now?</span>
                  <div className="profile-focus-grid">
                    {dimensions.map((dimension) => {
                      const isSelected = draftFocus === dimension.key;

                      return (
                        <button
                          key={dimension.key}
                          type="button"
                          className={`profile-option ${isSelected ? "selected" : ""}`}
                          onClick={() => setDraftFocus(dimension.key)}
                        >
                          <span className="profile-option-title">
                            {dimension.focusLabel}
                          </span>
                          <span className="profile-option-copy">
                            {dimension.focusDescription}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={handleProfileContinue}
                    disabled={!draftFocus}
                  >
                    Start the Diagnostic
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={handleProfileSkip}
                  >
                    Skip for now
                  </button>
                </div>

                <p className="profile-note">
                  No email required. This stays in your browser.
                </p>
              </div>
            ) : question ? (
              <div
                className={`question-card ${isTransitioning ? "exiting" : ""}`}
                key={currentIndex}
              >
                <div className="question-copy">
                  <div className="question-number">{questionKicker}</div>
                  {profile ? (
                    <div className="chip-row question-chip-row">
                      {profile.role ? <span className="chip">{profile.role}</span> : null}
                      {focusDimension ? (
                        <span className="chip">Focus: {focusDimension.title}</span>
                      ) : null}
                    </div>
                  ) : null}
                  <h1 className="question-text">{questionText}</h1>
                  <p className="question-support">{questionSupport}</p>
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
