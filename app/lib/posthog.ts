"use client";

import posthog from "posthog-js";

export type PostHogEventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

let posthogEnabled = false;
let initializedApiKey: string | null = null;
let initScheduled = false;

export function initPostHog({
  apiKey,
  host,
}: {
  apiKey?: string;
  host?: string;
}): void {
  const resolvedKey = apiKey?.trim() ?? "";
  const resolvedHost = host?.trim() || "https://us.i.posthog.com";

  if (!resolvedKey || typeof window === "undefined") {
    return;
  }

  if (posthogEnabled && initializedApiKey === resolvedKey) {
    return;
  }

  if (initScheduled && initializedApiKey === resolvedKey) {
    return;
  }

  initScheduled = true;
  initializedApiKey = resolvedKey;

  const runInit = (): void => {
    posthog.init(resolvedKey, {
      api_host: resolvedHost,
      capture_pageview: true,
      person_profiles: "identified_only",
    });
    posthogEnabled = true;
    initScheduled = false;
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => runInit(), { timeout: 1500 });
    return;
  }

  globalThis.setTimeout(runInit, 1);
}

export function capturePostHogEvent(
  eventName: string,
  properties?: PostHogEventProperties
): void {
  if (!posthogEnabled || typeof window === "undefined") {
    return;
  }

  posthog.capture(eventName, properties);
}

export function identifyPostHogUser(
  userId: string,
  traits?: PostHogEventProperties
): void {
  if (!posthogEnabled || typeof window === "undefined") {
    return;
  }

  posthog.identify(userId, traits);
}

export function resetPostHog(): void {
  if (!posthogEnabled || typeof window === "undefined") {
    return;
  }

  posthog.reset();
}
