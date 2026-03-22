"use client";

import { useState, useSyncExternalStore } from "react";

import { useAuth } from "../../hooks/useAuth";
import AuthModal from "./AuthModal";
import RankBadge from "../shared/RankBadge";
import StreakCounter from "../shared/StreakCounter";

function dismissedKey(sourcePage: string) {
  return `thine-auth-prompt-dismissed:${sourcePage}`;
}

export default function AuthPromptCard({
  sourcePage,
  xpEarned,
}: {
  sourcePage: string;
  xpEarned: number;
}): React.JSX.Element | null {
  const { isLoggedIn, loading, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedOverride, setDismissedOverride] = useState(false);
  const dismissed = useSyncExternalStore(
    () => () => undefined,
    () => {
      if (typeof window === "undefined") {
        return false;
      }

      return (
        dismissedOverride ||
        window.localStorage.getItem(dismissedKey(sourcePage)) === "true"
      );
    },
    () => dismissedOverride
  );

  if (loading) {
    return null;
  }

  if (!isLoggedIn && dismissed) {
    return null;
  }

  if (isLoggedIn && sourcePage === "leaderboard") {
    return null;
  }

  return (
    <>
      <section className="report-card auth-prompt-card">
        {isLoggedIn ? (
          <div className="auth-prompt-saved">
            <div className="section-heading">
              <span className="section-eyebrow">Profile sync</span>
              <h2 className="conversion-title">Score saved.</h2>
              <p className="section-copy">
                Your progress now travels with your account.
              </p>
            </div>
            <div className="auth-prompt-metrics">
              <StreakCounter
                currentStreak={profile?.current_streak ?? 0}
                longestStreak={profile?.longest_streak ?? 0}
              />
              <div className="auth-prompt-xp">+{xpEarned} XP</div>
              <RankBadge tier={profile?.ranktier ?? "bronze"} />
            </div>
          </div>
        ) : (
          <div className="auth-prompt-anon">
            <div className="section-heading">
              <span className="section-eyebrow">Save your progress</span>
              <h2 className="conversion-title">
                Save your progress and appear on the leaderboard.
              </h2>
              <p className="section-copy">
                Create a profile to keep your score history, streak, and XP across
                devices.
              </p>
            </div>
            <div className="auth-prompt-actions">
              <button className="btn-primary" type="button" onClick={() => setIsOpen(true)}>
                Sign up
              </button>
              <button
                className="text-link-button"
                type="button"
                onClick={() => {
                  setDismissedOverride(true);
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem(dismissedKey(sourcePage), "true");
                  }
                }}
              >
                Maybe later
              </button>
            </div>
          </div>
        )}
      </section>

      <AuthModal
        isOpen={isOpen}
        sourcePage={sourcePage}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
