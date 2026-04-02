export const WEB_VITALS_STORAGE_KEY = "thine-web-vitals";

export type WebVitalName = "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
export type WebVitalRating = "good" | "needs-improvement" | "poor";

export interface WebVitalSnapshot {
  name: WebVitalName;
  value: number;
  delta: number;
  rating: WebVitalRating;
  pathname: string;
  recordedAt: string;
  navigationType?: string;
}

export type WebVitalsStore = Partial<Record<WebVitalName, WebVitalSnapshot>>;

const SUPPORTED_VITAL_NAMES: WebVitalName[] = ["CLS", "FCP", "INP", "LCP", "TTFB"];

export function isSupportedWebVitalName(value: string): value is WebVitalName {
  return SUPPORTED_VITAL_NAMES.includes(value as WebVitalName);
}

export function normalizeWebVitalValue(
  name: WebVitalName,
  value: number
): number {
  if (name === "CLS") {
    return Number(value.toFixed(3));
  }

  return Math.round(value);
}

function readWebVitalsStore(): WebVitalsStore {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(WEB_VITALS_STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as WebVitalsStore;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function persistWebVital(snapshot: WebVitalSnapshot): WebVitalsStore {
  if (typeof window === "undefined") {
    return {};
  }

  const nextStore: WebVitalsStore = {
    ...readWebVitalsStore(),
    [snapshot.name]: snapshot,
  };

  window.localStorage.setItem(WEB_VITALS_STORAGE_KEY, JSON.stringify(nextStore));
  return nextStore;
}
