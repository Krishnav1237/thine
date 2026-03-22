"use client";

import { FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import EmailCaptureModal from "./EmailCaptureModal";

const EMAIL_CAPTURE_KEY = "thine-email-captured";

function AuthModalPanel({
  sourcePage,
  defaultTab,
  onClose,
}: {
  sourcePage: string;
  defaultTab: "signup" | "login";
  onClose: () => void;
}): React.JSX.Element {
  const { signIn, signUp } = useAuth();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const copyId = useId();
  const [tab, setTab] = useState<"signup" | "login">(defaultTab);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDismiss = useCallback((): void => {
    onClose();

    if (typeof window !== "undefined") {
      const captured = window.localStorage.getItem(EMAIL_CAPTURE_KEY) === "true";
      if (!captured) {
        setShowEmailCapture(true);
      }
    }
  }, [onClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const getFocusableElements = (): HTMLElement[] =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleDismiss();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleDismiss]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const action =
      tab === "signup"
        ? signUp({
            email,
            password,
            username,
            displayName: username,
          })
        : signIn({
            email,
            password,
          });

    const result = await action;
    setSubmitting(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Success. Your progress is now tied to your profile.");
    window.setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setMessage("");

    const action = tab === "signup" ? signUp : signIn;
    const result = await action({ provider: "google" });
    setSubmitting(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Redirecting to Google...");
  };

  return (
    <>
      <div className="auth-overlay" role="presentation">
        <div
          className="auth-modal"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={copyId}
        >
          <button
            className="auth-close"
            type="button"
            onClick={handleDismiss}
            ref={closeButtonRef}
            aria-label="Close dialog"
          >
            Close
          </button>

          <div className="auth-head">
            <span className="section-eyebrow">Save your momentum</span>
            <h2 className="conversion-title" id={titleId}>
              {tab === "signup" ? "Create your Thine profile." : "Welcome back."}
            </h2>
            <p className="section-copy" id={copyId}>
              Keep your score history, XP, streaks, and leaderboard position in
              sync across sessions.
            </p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Auth tabs">
            <button
              className={`auth-tab ${tab === "signup" ? "is-active" : ""}`}
              type="button"
              onClick={() => setTab("signup")}
            >
              Sign Up
            </button>
            <button
              className={`auth-tab ${tab === "login" ? "is-active" : ""}`}
              type="button"
              onClick={() => setTab("login")}
            >
              Log In
            </button>
          </div>

          <button
            className="btn-secondary auth-google"
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
          >
            Continue with Google
          </button>

          <form className="auth-form" onSubmit={handleSubmit}>
            {tab === "signup" ? (
              <input
                className="auth-input"
                type="text"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
              />
            ) : null}

            <input
              className="auth-input"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
            />

            <input
              className="auth-input"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />

            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting
                ? "Working..."
                : tab === "signup"
                ? "Create account"
                : "Log in"}
            </button>
          </form>

          {message ? <div className="auth-inline-message">{message}</div> : null}

          <button className="text-link-button" type="button" onClick={handleDismiss}>
            Maybe later
          </button>
        </div>
      </div>

      <EmailCaptureModal
        isOpen={showEmailCapture}
        sourcePage={sourcePage}
        onClose={() => setShowEmailCapture(false)}
      />
    </>
  );
}

export default function AuthModal({
  isOpen,
  sourcePage,
  defaultTab = "signup",
  onClose,
}: {
  isOpen: boolean;
  sourcePage: string;
  defaultTab?: "signup" | "login";
  onClose: () => void;
}): React.JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return (
    <AuthModalPanel
      key={`${sourcePage}:${defaultTab}`}
      sourcePage={sourcePage}
      defaultTab={defaultTab}
      onClose={onClose}
    />
  );
}
