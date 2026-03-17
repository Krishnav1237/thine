"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

import BrandHeader from "../components/BrandHeader";
import { HOT_TAKES, type HotTake } from "../data/hot-takes";

type ArenaAnswer = "agree" | "depends" | "disagree";

type ArenaResponse = {
  takeId: number;
  answer: ArenaAnswer;
};

type CardStage = "enter" | "idle" | "exit-left" | "exit-right" | "exit-down";

type ArenaPhase = "arena" | "summary";

const STORAGE_KEY = "arenaResponses";
const TAKES_PER_SESSION = 7;
const REVEAL_DURATION_MS = 1400;
const EXIT_DURATION_MS = 260;
const SWIPE_THRESHOLD = 45;
const SWIPE_FLICK_THRESHOLD = 24;
const SWIPE_FLICK_TIME_MS = 260;
const MAX_DRAG = 160;
const HORIZONTAL_LOCK_RATIO = 1.1;

const takeStatsOrder = [
  { key: "disagree", label: "Disagree" },
  { key: "depends", label: "Depends" },
  { key: "agree", label: "Agree" },
] as const;

const shuffleTakes = (takes: HotTake[]) => {
  const copy = [...takes];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const readStoredResponses = (): ArenaResponse[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as ArenaResponse[];
  } catch {
    return [];
  }
};

const persistResponse = (response: ArenaResponse) => {
  if (typeof window === "undefined") {
    return;
  }
  const existing = readStoredResponses();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...existing, response])
  );
};

const buildDeck = () => shuffleTakes(HOT_TAKES).slice(0, TAKES_PER_SESSION);

export default function ArenaPage() {
  const [deck, setDeck] = useState<HotTake[]>(() => buildDeck());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<ArenaAnswer | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [cardStage, setCardStage] = useState<CardStage>("enter");
  const [sessionResponses, setSessionResponses] = useState<ArenaResponse[]>([]);
  const [phase, setPhase] = useState<ArenaPhase>("arena");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(
    null
  );

  const revealTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const shareTimerRef = useRef<number | null>(null);
  const dragXRef = useRef(0);
  const pointerCapturedRef = useRef(false);
  const pointerStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    pointerId: number;
  } | null>(null);

  const totalTakes = deck.length;
  const currentTake = deck[currentIndex];

  const answersLocked = selectedAnswer !== null || phase === "summary";

  const sessionMix = useMemo(() => {
    if (sessionResponses.length === 0) {
      return {
        total: 0,
        agreePct: 0,
        disagreePct: 0,
        dependsPct: 0,
      };
    }

    const totals = sessionResponses.reduce(
      (acc, response) => {
        acc[response.answer] += 1;
        return acc;
      },
      { agree: 0, disagree: 0, depends: 0 }
    );

    const total = sessionResponses.length;
    return {
      total,
      agreePct: Math.round((totals.agree / total) * 100),
      disagreePct: Math.round((totals.disagree / total) * 100),
      dependsPct: Math.round((totals.depends / total) * 100),
    };
  }, [sessionResponses]);

  const mixRows = useMemo(() => {
    const mixValues: Record<ArenaAnswer, number> = {
      agree: sessionMix.agreePct,
      depends: sessionMix.dependsPct,
      disagree: sessionMix.disagreePct,
    };

    return takeStatsOrder.map((option) => ({
      key: option.key,
      label: option.label,
      value: mixValues[option.key],
    }));
  }, [sessionMix.agreePct, sessionMix.dependsPct, sessionMix.disagreePct]);

  const sessionSummary = useMemo(() => {
    if (sessionResponses.length === 0) {
      return null;
    }

    const agreePct = sessionMix.agreePct;
    const disagreePct = sessionMix.disagreePct;
    const dependsPct = sessionMix.dependsPct;

    let profile = "Balanced Thinker";
    let profileNote =
      "You land in the middle: strong opinions, but you know when nuance matters.";

    if (disagreePct >= 50) {
      profile = "Contrarian Thinker";
      profileNote =
        "You default to disagreement and trust your own signal more than the default.";
    } else if (agreePct >= 50) {
      profile = "Conformist Thinker";
      profileNote =
        "You choose agree more often than not, which keeps your responses consistent.";
    } else if (dependsPct >= 45) {
      profile = "Nuanced Thinker";
      profileNote =
        "You see tradeoffs quickly and avoid binary choices when the truth is mixed.";
    }

    return {
      agreePct,
      disagreePct,
      dependsPct,
      profile,
      profileNote,
    };
  }, [sessionMix]);

  useEffect(() => {
    if (phase !== "arena") {
      return;
    }

    setCardStage("enter");
    const frameId = window.requestAnimationFrame(() => {
      setCardStage("idle");
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [currentIndex, phase]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
      }
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
      if (shareTimerRef.current) {
        window.clearTimeout(shareTimerRef.current);
      }
    };
  }, []);

  const resetTakeState = () => {
    setSelectedAnswer(null);
    setShowResults(false);
    setDragX(0);
    dragXRef.current = 0;
    setIsDragging(false);
    setDragDirection(null);
  };

  const advanceTake = (direction: CardStage) => {
    setCardStage(direction);

    exitTimerRef.current = window.setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      resetTakeState();
    }, EXIT_DURATION_MS);
  };

  const handleAnswer = (answer: ArenaAnswer) => {
    if (answersLocked || !currentTake) {
      return;
    }

    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
    }
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
    }

    setSelectedAnswer(answer);
    setShowResults(true);
    setIsDragging(false);
    setDragX(0);
    dragXRef.current = 0;
    setDragDirection(null);

    const response = { takeId: currentTake.id, answer };
    setSessionResponses((prev) => [...prev, response]);
    persistResponse(response);

    revealTimerRef.current = window.setTimeout(() => {
      if (currentIndex >= totalTakes - 1) {
        setPhase("summary");
        return;
      }

      if (answer === "agree") {
        advanceTake("exit-right");
      } else if (answer === "disagree") {
        advanceTake("exit-left");
      } else {
        advanceTake("exit-down");
      }
    }, REVEAL_DURATION_MS);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (answersLocked) {
      return;
    }
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerId: event.pointerId,
    };
    pointerCapturedRef.current = false;
    setIsDragging(true);
    setDragDirection(null);
    dragXRef.current = 0;
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!pointerStartRef.current || answersLocked) {
      return;
    }
    const deltaX = event.clientX - pointerStartRef.current.x;
    const deltaY = event.clientY - pointerStartRef.current.y;
    if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
      return;
    }
    if (Math.abs(deltaY) > Math.abs(deltaX) * HORIZONTAL_LOCK_RATIO) {
      return;
    }
    if (!pointerCapturedRef.current && Math.abs(deltaX) > 8) {
      pointerCapturedRef.current = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        pointerCapturedRef.current = false;
      }
    }
    const nextDragX = Math.max(Math.min(deltaX, MAX_DRAG), -MAX_DRAG);
    dragXRef.current = nextDragX;
    setDragX(nextDragX);
    if (nextDragX > 16) {
      setDragDirection("right");
    } else if (nextDragX < -16) {
      setDragDirection("left");
    } else {
      setDragDirection(null);
    }
  };

  const handlePointerUp = (event?: PointerEvent<HTMLElement>) => {
    if (!pointerStartRef.current || answersLocked) {
      pointerStartRef.current = null;
      setIsDragging(false);
      setDragX(0);
      dragXRef.current = 0;
      setDragDirection(null);
      return;
    }

    const elapsed = performance.now() - pointerStartRef.current.time;
    const deltaX = dragXRef.current;
    const isFlick =
      Math.abs(deltaX) > SWIPE_FLICK_THRESHOLD &&
      elapsed < SWIPE_FLICK_TIME_MS;
    const isSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD || isFlick;

    if (isSwipe && deltaX > 0) {
      handleAnswer("agree");
    } else if (isSwipe && deltaX < 0) {
      handleAnswer("disagree");
    }

    if (pointerCapturedRef.current && event) {
      try {
        event.currentTarget.releasePointerCapture(
          pointerStartRef.current.pointerId
        );
      } catch {
        // ignore
      }
    }
    pointerCapturedRef.current = false;
    pointerStartRef.current = null;
    setIsDragging(false);
    setDragX(0);
    dragXRef.current = 0;
    setDragDirection(null);
  };

  const handleShare = async () => {
    if (!sessionSummary) {
      return;
    }

    const shareText = `I disagreed with ${sessionSummary.disagreePct}% of takes in Hot Takes Arena \ud83d\udc80`;
    const shareLink = `${window.location.origin}/arena`;

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareLink}`);
      setShareStatus("copied");
      if (shareTimerRef.current) {
        window.clearTimeout(shareTimerRef.current);
      }
      shareTimerRef.current = window.setTimeout(
        () => setShareStatus("idle"),
        1800
      );
    } catch {
      setShareStatus("idle");
    }
  };

  const handleRestart = () => {
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
    }
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
    }
    if (shareTimerRef.current) {
      window.clearTimeout(shareTimerRef.current);
    }
    setDeck(buildDeck());
    setCurrentIndex(0);
    setSessionResponses([]);
    setPhase("arena");
    resetTakeState();
  };

  return (
    <div className="page-container arena-page">
      <div className="arena-gradient" />
      <div className="arena-noise" />

      <div className="arena-shell">
        <BrandHeader />

        <main className="arena-main">
          {phase === "summary" && sessionSummary ? (
            <section className="arena-summary" aria-live="polite">
              <div className="arena-summary-header">
                <span className="arena-kicker">Your Thinking Profile</span>
                <h1>{sessionSummary.profile}</h1>
                <p className="arena-summary-note">{sessionSummary.profileNote}</p>
                <p className="arena-summary-meta">
                  Based on your responses in this session.
                </p>
              </div>

              <div className="arena-summary-grid">
                <article className="arena-summary-card">
                  <span className="arena-summary-label">Agreed</span>
                  <strong>{sessionSummary.agreePct}%</strong>
                </article>
                <article className="arena-summary-card">
                  <span className="arena-summary-label">Disagreed</span>
                  <strong>{sessionSummary.disagreePct}%</strong>
                </article>
                <article className="arena-summary-card">
                  <span className="arena-summary-label">Chose depends</span>
                  <strong>{sessionSummary.dependsPct}%</strong>
                </article>
              </div>

              <div className="arena-share-card">
                <div>
                  <span className="arena-share-label">Share text</span>
                  <p className="arena-share-text">
                    I disagreed with {sessionSummary.disagreePct}% of takes in Hot
                    Takes Arena \ud83d\udc80
                  </p>
                </div>
                <button
                  className="btn-primary"
                  type="button"
                  onClick={handleShare}
                >
                  {shareStatus === "copied" ? "Copied" : "Share your result"}
                </button>
              </div>

              <div className="arena-summary-actions">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={handleRestart}
                >
                  Try new takes
                </button>
                <a className="btn-secondary" href="/quiz">
                  Take the Test
                </a>
              </div>
            </section>
          ) : (
            <section className="arena-stage" aria-live="polite">
              {currentTake ? (
                <article
                  className={`arena-card is-${cardStage} ${
                    showResults ? "is-answered" : ""
                  } ${isDragging ? "is-dragging" : ""} ${
                    dragDirection ? `drag-${dragDirection}` : ""
                  }`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  style={
                    isDragging && !answersLocked
                      ? {
                          transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)`,
                        }
                      : undefined
                  }
                >
                  <div className="arena-card-header">
                    <span className="arena-kicker">Hot Takes Arena</span>
                    <span className="arena-progress">
                      {currentIndex + 1} / {totalTakes}
                    </span>
                  </div>

                  <p className="arena-text">{currentTake.text}</p>

                  <div className="arena-actions">
                    {takeStatsOrder.map((option) => {
                      const answerKey = option.key as ArenaAnswer;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          className={`arena-btn arena-btn--${option.key} ${
                            selectedAnswer === answerKey ? "is-selected" : ""
                          }`}
                          onClick={() => handleAnswer(answerKey)}
                          disabled={answersLocked}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className={`arena-results ${
                      showResults ? "is-visible" : ""
                    }`}
                  >
                    <div className="arena-results-title">
                      Your stance mix so far
                    </div>
                    {mixRows.map((row) => (
                      <div
                        key={row.key}
                        className={`arena-stat ${
                          selectedAnswer === row.key ? "is-selected" : ""
                        }`}
                      >
                        <span className="arena-stat-label">{row.label}</span>
                        <div className="arena-stat-bar">
                          <span
                            style={{
                              width: showResults ? `${row.value}%` : "0%",
                            }}
                          />
                        </div>
                        <span className="arena-stat-value">{row.value}%</span>
                      </div>
                    ))}
                  </div>

                  <p className="arena-hint">
                    Swipe left to disagree, right to agree.
                  </p>
                </article>
              ) : null}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
