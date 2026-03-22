"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

import AuthPromptCard from "../components/auth/AuthPromptCard";
import BrandHeader from "../components/BrandHeader";
import DailyPackBadge from "../components/DailyPackBadge";
import RankBadge from "../components/shared/RankBadge";
import ShareCard from "../components/shared/ShareCard";
import StreakCounter from "../components/shared/StreakCounter";
import XPAnimation from "../components/shared/XPAnimation";
import { HOT_TAKES, type HotTake } from "../data/hot-takes";
import {
  ARENA_STANCE_LABELS,
  normalizeArenaPercents,
  resolveDominantFromCounts,
  type ArenaAnswer,
} from "../lib/arena-share";
import { getDailySeed, seededShuffle } from "../lib/daily-pack";
import { readQuizSession } from "../lib/quiz-session";
import { recordDailyActivity } from "../lib/retention";
import { shareResult } from "../lib/share-card";
import {
  readLocalPlayerStats,
  saveArenaAttempt,
  saveSharedResult,
} from "../lib/supabase/sync";
import type { Json, RankTier } from "../lib/supabase/types";
import { useAuth } from "../hooks/useAuth";

type ArenaResponse = {
  takeId: number;
  answer: ArenaAnswer;
};

type CardStage = "enter" | "idle" | "exit-left" | "exit-right" | "exit-down";

type ArenaPhase = "arena" | "summary";
type SessionMode = "daily" | "avid";

interface ArenaSyncState {
  xpEarned: number;
  bonusXP: number;
  currentStreak: number;
  longestStreak: number;
  rankTier: RankTier;
  totalXP: number;
}

const STORAGE_KEY = "arenaResponses";
const MODE_KEY = "arenaSessionMode";
const PROFILE_KEY = "arenaProfile";
const SESSION_PRESETS: Record<
  SessionMode,
  { label: string; count: number; description: string }
> = {
  daily: { label: "Daily", count: 7, description: "Quick loop · 2-3 min" },
  avid: { label: "Avid", count: 12, description: "Deep loop · 4-5 min" },
};
const DEFAULT_SESSION_MODE: SessionMode = "daily";
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

const readStoredMode = (): SessionMode | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(MODE_KEY);
  return raw === "avid" || raw === "daily" ? raw : null;
};

const storeMode = (mode: SessionMode) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(MODE_KEY, mode);
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

const readStoredProfile = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      (typeof parsed.name !== "string" && typeof parsed.role !== "string")
    ) {
      return null;
    }
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      role: typeof parsed.role === "string" ? parsed.role : "",
    };
  } catch {
    return null;
  }
};

const storeProfile = (name: string, role: string) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({ name: name.trim(), role: role.trim() })
  );
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

const buildDeck = (count: number, seed: number) =>
  seededShuffle(HOT_TAKES, seed).slice(0, count);

export default function ArenaPage() {
  const { user, profile, refreshProfile } = useAuth();
  const initialDailySeed = getDailySeed();
  const initialSessionMode = readStoredMode() ?? DEFAULT_SESSION_MODE;
  const storedProfile = readStoredProfile();
  const sessionProfile = readQuizSession()?.profile;

  const [sessionMode, setSessionMode] = useState<SessionMode>(initialSessionMode);
  const [dailySeed] = useState(initialDailySeed);
  const [deck, setDeck] = useState<HotTake[]>(() =>
    buildDeck(SESSION_PRESETS[initialSessionMode].count, initialDailySeed)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<ArenaAnswer | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [cardStage, setCardStage] = useState<CardStage>("enter");
  const [sessionResponses, setSessionResponses] = useState<ArenaResponse[]>([]);
  const [phase, setPhase] = useState<ArenaPhase>("arena");
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState(() => readLocalPlayerStats());
  const [arenaSync, setArenaSync] = useState<ArenaSyncState | null>(null);
  const [xpBurst, setXpBurst] = useState(0);
  const [profileName, setProfileName] = useState<string | null>(() => {
    if (storedProfile?.name) {
      return storedProfile.name.trim() || null;
    }
    return sessionProfile?.name?.trim() ?? null;
  });
  const [profileRole, setProfileRole] = useState<string | null>(() => {
    if (storedProfile?.role) {
      return storedProfile.role.trim() || null;
    }
    return sessionProfile?.role?.trim() ?? null;
  });
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(
    null
  );

  const revealTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const shareTimerRef = useRef<number | null>(null);
  const idleRef = useRef<number | null>(null);
  const dragXRef = useRef(0);
  const pointerCapturedRef = useRef(false);
  const recordedRef = useRef(false);
  const saveAttemptRef = useRef(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const savedShareUrlRef = useRef<string | null>(null);
  const pointerStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    pointerId: number;
  } | null>(null);

  const sessionPreset = SESSION_PRESETS[sessionMode];
  const sessionCount = sessionPreset.count;
  const totalTakes = deck.length;
  const currentTake = deck[currentIndex];

  const answersLocked = selectedAnswer !== null || phase === "summary";

  const sessionMix = useMemo(() => {
    if (sessionResponses.length === 0) {
      return {
        total: 0,
        counts: { agree: 0, disagree: 0, depends: 0 },
        agreePct: 0,
        disagreePct: 0,
        dependsPct: 0,
        dominantKey: null as ArenaAnswer | null,
      };
    }

    const counts = sessionResponses.reduce(
      (acc, response) => {
        acc[response.answer] += 1;
        return acc;
      },
      { agree: 0, disagree: 0, depends: 0 }
    );

    const total = sessionResponses.length;
    const percents = normalizeArenaPercents({
      agree: (counts.agree / total) * 100,
      disagree: (counts.disagree / total) * 100,
      depends: (counts.depends / total) * 100,
    });
    const dominantKey = resolveDominantFromCounts(counts);

    return {
      total,
      counts,
      ...percents,
      dominantKey,
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
    if (sessionMix.total === 0) {
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

  const dominantStance = useMemo(() => {
    if (!sessionSummary || !sessionMix.dominantKey) {
      return null;
    }
    const key = sessionMix.dominantKey;
    const value =
      key === "agree"
        ? sessionMix.agreePct
        : key === "disagree"
        ? sessionMix.disagreePct
        : sessionMix.dependsPct;
    return {
      key,
      label: ARENA_STANCE_LABELS[key],
      value,
    };
  }, [sessionMix, sessionSummary]);

  const shareText = useMemo(() => {
    if (!sessionSummary) {
      return "";
    }
    const name = profileName?.trim();
    const role = profileRole?.trim();
    const intro = name
      ? `${name}${role ? `, ${role}` : ""} got ${sessionSummary.profile}.`
      : `I got ${sessionSummary.profile} in Hot Takes Arena.`;
    return `${intro} Agree ${sessionSummary.agreePct}%, Disagree ${sessionSummary.disagreePct}%, Depends ${sessionSummary.dependsPct}%. Think you can beat this?`;
  }, [profileName, profileRole, sessionSummary]);
  const currentStreak =
    profile?.current_streak ??
    arenaSync?.currentStreak ??
    playerStats.currentStreak;
  const longestStreak =
    profile?.longest_streak ??
    arenaSync?.longestStreak ??
    playerStats.longestStreak;
  const totalXP =
    profile?.total_xp ??
    arenaSync?.totalXP ??
    playerStats.totalXP;
  const rankTier =
    (profile?.ranktier ??
      arenaSync?.rankTier ??
      playerStats.rankTier ??
      "bronze") as RankTier;

  useEffect(() => {
    if (!xpBurst) {
      return;
    }

    const timer = window.setTimeout(() => setXpBurst(0), 1800);
    return () => window.clearTimeout(timer);
  }, [xpBurst]);

  useEffect(() => {
    if (phase !== "summary" || !sessionSummary || saveAttemptRef.current) {
      return;
    }

    saveAttemptRef.current = true;

    void saveArenaAttempt({
      userId: user?.id ?? null,
      dedupeKey: `arena:${sessionMode}:${sessionResponses
        .map((response) => `${response.takeId}-${response.answer}`)
        .join("|")}`,
      sessionmode: sessionMode,
      thinking_profile: sessionSummary.profile,
      agree_count: sessionMix.counts.agree,
      disagree_count: sessionMix.counts.disagree,
      depends_count: sessionMix.counts.depends,
      stance_mix: {
        agree: sessionSummary.agreePct,
        disagree: sessionSummary.disagreePct,
        depends: sessionSummary.dependsPct,
      } as unknown as Json,
      responses: sessionResponses as unknown as Json,
    }).then((result) => {
      if (!result) {
        return;
      }

      setArenaSync(result);
      setPlayerStats(readLocalPlayerStats());
      setXpBurst(result.xpEarned);

      if (user?.id) {
        void refreshProfile();
      }
    });
  }, [
    phase,
    refreshProfile,
    sessionMix.counts.agree,
    sessionMix.counts.depends,
    sessionMix.counts.disagree,
    sessionMode,
    sessionResponses,
    sessionSummary,
    user?.id,
  ]);

  useEffect(() => {
    if (phase !== "arena") {
      return;
    }

    const enterId = window.requestAnimationFrame(() => {
      setCardStage("enter");
      const idleId = window.requestAnimationFrame(() => {
        setCardStage("idle");
      });
      idleRef.current = idleId;
    });

    return () => {
      window.cancelAnimationFrame(enterId);
      if (idleRef.current) {
        window.cancelAnimationFrame(idleRef.current);
        idleRef.current = null;
      }
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
        if (!recordedRef.current) {
          recordDailyActivity("arena");
          recordedRef.current = true;
        }
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
      time: event.timeStamp,
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

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (!pointerStartRef.current || answersLocked) {
      pointerStartRef.current = null;
      setIsDragging(false);
      setDragX(0);
      dragXRef.current = 0;
      setDragDirection(null);
      return;
    }

    const elapsed = event.timeStamp - pointerStartRef.current.time;
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

  const showShareNotice = (message: string) => {
    setShareNotice(message);
    if (shareTimerRef.current) {
      window.clearTimeout(shareTimerRef.current);
    }
    shareTimerRef.current = window.setTimeout(
      () => setShareNotice(null),
      1800
    );
  };

  const copyToClipboard = async (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  const buildShareLink = () => {
    const url = new URL("/arena/share", window.location.origin);
    if (profileName) {
      url.searchParams.set("name", profileName);
    }
    if (profileRole) {
      url.searchParams.set("role", profileRole);
    }
    if (sessionSummary) {
      url.searchParams.set("profile", sessionSummary.profile);
      url.searchParams.set("agree", String(sessionSummary.agreePct));
      url.searchParams.set("disagree", String(sessionSummary.disagreePct));
      url.searchParams.set("depends", String(sessionSummary.dependsPct));
    }
    if (dominantStance) {
      url.searchParams.set("dominant", dominantStance.label);
    }
    url.searchParams.set("mode", sessionPreset.label);
    url.searchParams.set("takes", String(sessionResponses.length));
    return url.toString();
  };

  const resolveShareUrl = async () => {
    const fallbackUrl = buildShareLink();

    if (savedShareUrlRef.current) {
      return savedShareUrlRef.current;
    }

    if (!user?.id || !sessionSummary) {
      return fallbackUrl;
    }

    const sharedResultId = await saveSharedResult({
      userId: user.id,
      resulttype: "arena",
      score: null,
      score_band: null,
      display_name: profileName?.trim() || null,
      dimension_scores: null,
      thinking_profile: sessionSummary.profile,
      stance_data: {
        agree: sessionSummary.agreePct,
        disagree: sessionSummary.disagreePct,
        depends: sessionSummary.dependsPct,
        dominant: dominantStance?.label ?? null,
        role: profileRole?.trim() || null,
        mode: sessionPreset.label,
        takes: sessionResponses.length,
      } as unknown as Json,
      shareimageurl: null,
    });

    const nextUrl = sharedResultId
      ? new URL(`/share/${sharedResultId}`, window.location.origin).toString()
      : fallbackUrl;

    savedShareUrlRef.current = nextUrl;
    return nextUrl;
  };

  const handleShareProfile = async () => {
    if (!shareText) {
      return;
    }
    try {
      const shareLink = await resolveShareUrl();
      const copied = await copyToClipboard(shareLink);
      if (copied) {
        showShareNotice("Link copied.");
      } else {
        window.prompt("Copy your arena link", shareLink);
        showShareNotice("Link ready to copy.");
      }

      const sharePayload = {
        title: "Hot Takes Arena",
        text: shareText,
        url: shareLink,
      };
      if (navigator.share) {
        try {
          await navigator.share(sharePayload);
        } catch {
          // ignore share sheet errors; link is already copied
        }
      }
    } catch {
      showShareNotice("Copy failed. Try again.");
    }
  };

  const handleShareImage = async () => {
    if (!sessionSummary) {
      return;
    }

    try {
      const shareLink = await resolveShareUrl();
      const result = await shareResult({
        cardRef: shareCardRef,
        shareUrl: shareLink,
        title: `${sessionSummary.profile} · Hot Takes Arena`,
        text: shareText,
        fileName: `thine-arena-${sessionSummary.profile
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}.png`,
      });

      showShareNotice(result.message);
    } catch {
      const shareLink = await resolveShareUrl();
      const copied = await copyToClipboard(shareLink);
      showShareNotice(copied ? "Link copied." : "Copy failed. Try again.");
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
    setShareNotice(null);
    setDeck(buildDeck(sessionCount, dailySeed));
    setCurrentIndex(0);
    setSessionResponses([]);
    setPhase("arena");
    recordedRef.current = false;
    saveAttemptRef.current = false;
    savedShareUrlRef.current = null;
    resetTakeState();
  };

  const handleModeChange = (mode: SessionMode) => {
    if (mode === sessionMode) {
      return;
    }
    storeMode(mode);
    setSessionMode(mode);
    setDeck(buildDeck(SESSION_PRESETS[mode].count, dailySeed));
    setCurrentIndex(0);
    setSessionResponses([]);
    setPhase("arena");
    recordedRef.current = false;
    saveAttemptRef.current = false;
    savedShareUrlRef.current = null;
    resetTakeState();
  };

  return (
    <div className="page-container arena-page">
      <div className="arena-gradient" />
      <div className="arena-noise" />

      <div className="page-shell arena-shell">
        <BrandHeader />

        <main className="arena-main">
          {phase === "summary" && sessionSummary ? (
            <section className="arena-summary" aria-live="polite">
              <div className="arena-summary-header">
                <span className="arena-kicker">Your Thinking Profile</span>
                <h1>{sessionSummary.profile}</h1>
                {profileName ? (
                  <div className="arena-summary-name">
                    For {profileName}
                    {profileRole ? ` · ${profileRole}` : ""}
                  </div>
                ) : null}
                <div className="arena-summary-personalize">
                  <span className="arena-summary-personalize-label">
                    Personalize your share
                  </span>
                  <div className="arena-summary-personalize-fields">
                    <input
                      className="arena-summary-input"
                      type="text"
                      value={profileName ?? ""}
                      onChange={(event) => {
                        const next = event.target.value;
                        setProfileName(next || null);
                        storeProfile(next, profileRole ?? "");
                      }}
                      placeholder="Your name"
                      aria-label="Your name"
                    />
                    <input
                      className="arena-summary-input"
                      type="text"
                      value={profileRole ?? ""}
                      onChange={(event) => {
                        const next = event.target.value;
                        setProfileRole(next || null);
                        storeProfile(profileName ?? "", next);
                      }}
                      placeholder="Role (optional)"
                      aria-label="Your role"
                    />
                  </div>
                </div>
                <p className="arena-summary-note">{sessionSummary.profileNote}</p>
                <div className="arena-summary-achievements">
                  <StreakCounter
                    currentStreak={currentStreak}
                    longestStreak={longestStreak}
                    compact
                  />
                  <RankBadge tier={rankTier} totalXP={totalXP} />
                </div>
              </div>

              <div className="arena-share-spotlight">
                <div className="arena-share-preview">
                  {xpBurst ? (
                    <XPAnimation
                      xpAmount={xpBurst}
                      bonusText={arenaSync?.bonusXP ? "Streak bonus" : undefined}
                      visible={xpBurst > 0}
                    />
                  ) : null}
                  <div className="arena-share-card">
                    <span className="arena-share-title">Hot Takes Arena</span>
                    {profileName ? (
                      <span className="arena-share-name">For {profileName}</span>
                    ) : null}
                    {profileRole ? (
                      <span className="arena-share-role">{profileRole}</span>
                    ) : null}
                    <div className="arena-share-profile">
                      {sessionSummary.profile}
                    </div>
                    <div className="arena-share-mix">
                      <span>Agree {sessionSummary.agreePct}%</span>
                      <span>Disagree {sessionSummary.disagreePct}%</span>
                      <span>Depends {sessionSummary.dependsPct}%</span>
                    </div>
                    {dominantStance ? (
                      <div className="arena-share-chip">
                        Dominant: {dominantStance.label}
                      </div>
                    ) : null}
                    <div className="arena-share-footer">
                      {sessionPreset.label} set · {sessionResponses.length} takes
                    </div>
                  </div>
                </div>

                <div className="arena-share-copy">
                  <div className="arena-share-header">
                    <span className="arena-share-eyebrow">
                      Share your arena profile
                    </span>
                    <p className="arena-share-desc">
                      Personalized with your name, stance mix, and current rank.
                    </p>
                  </div>
                  <div className="arena-share-actions">
                    <button
                      className="btn-primary"
                      type="button"
                      onClick={handleShareProfile}
                    >
                      Share profile
                    </button>
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={handleShareImage}
                    >
                      Share as image
                    </button>
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={handleRestart}
                    >
                      Try new takes
                    </button>
                    <Link className="btn-secondary" href="/quiz">
                      Take the Test
                    </Link>
                    <Link className="btn-secondary" href="/">
                      Return Home
                    </Link>
                  </div>
                </div>
              </div>
              <AuthPromptCard
                sourcePage="arena"
                xpEarned={arenaSync?.xpEarned ?? 0}
              />
            </section>
          ) : (
            <section className="arena-stage" aria-live="polite">
              <div className="arena-mode-row">
                <div className="arena-mode-top">
                  <div className="arena-mode-left">
                    <span className="arena-mode-label">Session length</span>
                    <DailyPackBadge />
                  </div>
                  <div className="arena-mode-toggle" role="tablist">
                    {Object.entries(SESSION_PRESETS).map(([key, preset]) => {
                      const modeKey = key as SessionMode;
                      const isActive = sessionMode === modeKey;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          className={`arena-mode-btn ${
                            isActive ? "is-active" : ""
                          }`}
                          onClick={() => handleModeChange(modeKey)}
                          role="tab"
                          aria-selected={isActive}
                        >
                          {preset.label}
                          <span>{preset.count} takes</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <span className="arena-mode-note">{sessionPreset.description}</span>
              </div>
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

        <div
          className={`share-toast ${shareNotice ? "visible" : ""}`}
          role="alert"
          aria-live="assertive"
        >
          {shareNotice}
        </div>

        {sessionSummary ? (
          <ShareCard
            cardRef={shareCardRef}
            variant="arena"
            name={profileName ?? undefined}
            role={profileRole ?? undefined}
            thinkingProfile={sessionSummary.profile}
            agree={sessionSummary.agreePct}
            disagree={sessionSummary.disagreePct}
            depends={sessionSummary.dependsPct}
            streak={currentStreak}
            tier={rankTier}
          />
        ) : null}
      </div>
    </div>
  );
}
