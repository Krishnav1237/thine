"use client";

import { useEffect, useRef } from "react";

import { useAuth } from "../hooks/useAuth";
import {
  identifyPostHogUser,
  initPostHog,
  resetPostHog,
} from "../lib/posthog";

export { capturePostHogEvent } from "../lib/posthog";

export default function PostHogProvider({
  children,
  apiKey,
  host,
}: {
  children: React.ReactNode;
  apiKey?: string;
  host?: string;
}): React.JSX.Element {
  const { user } = useAuth();
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    initPostHog({ apiKey, host });
  }, [apiKey, host]);

  useEffect(() => {
    if (user?.id) {
      identifyPostHogUser(user.id, {
        email: user.email ?? undefined,
      });
      previousUserIdRef.current = user.id;
      return;
    }

    if (previousUserIdRef.current) {
      resetPostHog();
    }
    previousUserIdRef.current = null;
  }, [user?.email, user?.id]);

  return <>{children}</>;
}
