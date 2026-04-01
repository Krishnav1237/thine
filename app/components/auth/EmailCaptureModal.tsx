"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";

import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { capturePostHogEvent } from "../PostHogProvider";

const EMAIL_CAPTURE_KEY = "thine-email-captured";

function EmailCapturePanel({
  sourcePage,
  onClose,
}: {
  sourcePage: string;
  onClose: () => void;
}): React.JSX.Element {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const copyId = useId();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

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
        onClose();
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
  }, [onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();

      if (supabase) {
        await supabase.from("email_captures").insert({
          email,
          source_page: sourcePage,
        });
      }

      window.localStorage.setItem(EMAIL_CAPTURE_KEY, "true");
      capturePostHogEvent("email_captured");
      setMessage("You're on the list!");
      window.setTimeout(onClose, 900);
    } catch {
      window.localStorage.setItem(EMAIL_CAPTURE_KEY, "true");
      capturePostHogEvent("email_captured");
      setMessage("You're on the list!");
      window.setTimeout(onClose, 900);
    }
  };

  return (
    <div className="auth-overlay" role="presentation">
      <div
        className="auth-modal email-capture-modal"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={copyId}
      >
        <button
          className="auth-close"
          type="button"
          onClick={onClose}
          ref={closeButtonRef}
          aria-label="Close dialog"
        >
          Close
        </button>
        <div className="auth-head">
          <span className="section-eyebrow">Stay in the loop</span>
          <h2 className="conversion-title" id={titleId}>
            Get notified about new drops.
          </h2>
          <p className="section-copy" id={copyId}>
            Leave your email and we&apos;ll let you know when new features land.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <button className="btn-primary" type="submit">
            Notify me
          </button>
        </form>

        {message ? <div className="auth-inline-success">{message}</div> : null}
      </div>
    </div>
  );
}

export default function EmailCaptureModal({
  isOpen,
  sourcePage,
  onClose,
}: {
  isOpen: boolean;
  sourcePage: string;
  onClose: () => void;
}): React.JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return <EmailCapturePanel key={sourcePage} sourcePage={sourcePage} onClose={onClose} />;
}
