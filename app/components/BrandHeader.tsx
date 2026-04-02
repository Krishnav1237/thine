"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import { thineLinks } from "../lib/thine-links";
import StreakCounter from "./shared/StreakCounter";

const AuthModal = dynamic(() => import("./auth/AuthModal"), {
  ssr: false,
});

const isTestPath = (pathname: string): boolean =>
  pathname === "/" ||
  pathname.startsWith("/quiz") ||
  pathname.startsWith("/results") ||
  pathname.startsWith("/share");

export default function BrandHeader(): React.JSX.Element {
  const pathname = usePathname();
  const { isLoggedIn, loading, profile, signOut, user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signup" | "login">("signup");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const headerPanelRef = useRef<HTMLDivElement | null>(null);
  const testActive = isTestPath(pathname);
  const arenaActive = pathname.startsWith("/arena");
  const leaderboardActive = pathname.startsWith("/leaderboard");
  const dashboardActive = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (!menuOpen && !mobileNavOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (!headerPanelRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setMobileNavOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMobileNavOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, mobileNavOpen]);

  const displayName =
    profile?.display_name?.trim() ||
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "You";
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const compactStreak = profile?.current_streak ?? 0;
  const rankTier = profile?.ranktier ?? "bronze";
  const profileToneClass = `is-${rankTier}`;
  const closeMenus = (): void => {
    setMenuOpen(false);
    setMobileNavOpen(false);
  };
  const profileLabel = useMemo(() => {
    if (!isLoggedIn) {
      return null;
    }

    return displayName;
  }, [displayName, isLoggedIn]);
  const showDashboardTab = isLoggedIn || loading;

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand-mark" aria-label="Thine home">
          <span className="brand-mark-title">Thine</span>
          <span className="brand-mark-meta">yours, once remembered</span>
        </Link>

        <div className="site-header-panel" ref={headerPanelRef}>
          <button
            className="site-mobile-toggle"
            type="button"
            aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileNavOpen}
            aria-controls="site-header-actions"
            onClick={() => setMobileNavOpen((value) => !value)}
          >
            {mobileNavOpen ? "Close" : "Menu"}
          </button>

          <div
            className={`site-header-actions ${mobileNavOpen ? "is-open" : ""}`}
            id="site-header-actions"
          >
            <nav className="site-nav" aria-label="Primary">
              <Link
                href="/quiz"
                className={`site-tab ${testActive ? "is-active" : ""}`}
                aria-current={testActive ? "page" : undefined}
                onClick={closeMenus}
              >
                Test
              </Link>
              <Link
                href="/arena"
                className={`site-tab ${arenaActive ? "is-active" : ""}`}
                aria-current={arenaActive ? "page" : undefined}
                onClick={closeMenus}
              >
                Arena
              </Link>
              <Link
                href="/leaderboard"
                className={`site-tab ${leaderboardActive ? "is-active" : ""}`}
                aria-current={leaderboardActive ? "page" : undefined}
                onClick={closeMenus}
              >
                Leaderboard
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className={`site-tab ${dashboardActive ? "is-active" : ""}`}
                  aria-current={dashboardActive ? "page" : undefined}
                  onClick={closeMenus}
                >
                  Dashboard
                </Link>
              ) : showDashboardTab ? (
                <span className="site-tab site-tab-placeholder" aria-hidden="true">
                  Dashboard
                </span>
              ) : null}
            </nav>

            <div className="site-utility-actions">
              <a
                className="site-link"
                href={thineLinks.story}
                target="_blank"
                rel="noreferrer"
                onClick={closeMenus}
              >
                Story
              </a>

              {isLoggedIn ? (
                <div className="site-profile-cluster">
                  <StreakCounter
                    currentStreak={compactStreak}
                    longestStreak={profile?.longest_streak ?? 0}
                    compact
                  />
                  <div className="site-profile-menu">
                    <button
                      className={`site-profile-trigger ${profileToneClass}`}
                      type="button"
                      onClick={() => setMenuOpen((value) => !value)}
                      aria-expanded={menuOpen}
                      aria-haspopup="menu"
                      aria-label={`${displayName} account menu`}
                    >
                      <span className="site-profile-avatar" aria-hidden="true">
                        {avatarInitial}
                      </span>
                      <span className="site-profile-copy">{profileLabel}</span>
                    </button>

                    {menuOpen ? (
                      <div className="site-profile-dropdown" role="menu">
                        <div className="site-profile-dropdown-head">
                          <strong>{displayName}</strong>
                          <span>{rankTier}</span>
                        </div>
                        <Link
                          href="/dashboard"
                          className="site-dropdown-item"
                          role="menuitem"
                          onClick={closeMenus}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/leaderboard"
                          className="site-dropdown-item"
                          role="menuitem"
                          onClick={closeMenus}
                        >
                          Leaderboard
                        </Link>
                        <button
                          type="button"
                          className="site-dropdown-item is-button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpen(false);
                            void signOut();
                          }}
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : loading ? (
                <div className="site-auth-placeholder" aria-hidden="true">
                  <span className="site-auth-placeholder-pill site-auth-placeholder-pill--sm" />
                  <span className="site-auth-placeholder-pill" />
                </div>
              ) : !loading ? (
                <div className="site-auth-actions">
                  <button
                    type="button"
                    className="site-auth-link"
                    onClick={() => {
                      setAuthTab("login");
                      setIsAuthOpen(true);
                      setMobileNavOpen(false);
                    }}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    className="site-auth-btn"
                    onClick={() => {
                      setAuthTab("signup");
                      setIsAuthOpen(true);
                      setMobileNavOpen(false);
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {isAuthOpen ? (
        <AuthModal
          isOpen={isAuthOpen}
          sourcePage={`nav:${pathname}`}
          trigger="header"
          defaultTab={authTab}
          onClose={() => setIsAuthOpen(false)}
        />
      ) : null}
    </>
  );
}
