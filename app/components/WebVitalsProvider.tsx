"use client";

import { useReportWebVitals } from "next/web-vitals";

import { capturePostHogEvent } from "./PostHogProvider";
import {
  isSupportedWebVitalName,
  normalizeWebVitalValue,
  persistWebVital,
  type WebVitalRating,
} from "../lib/web-vitals";

type WebVitalMetric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

function getMetricRating(metric: WebVitalMetric): WebVitalRating {
  if (metric.rating === "good" || metric.rating === "needs-improvement") {
    return metric.rating;
  }

  return "poor";
}

export default function WebVitalsProvider(): null {
  useReportWebVitals((metric) => {
    if (typeof window === "undefined" || !isSupportedWebVitalName(metric.name)) {
      return;
    }

    const pathname =
      window.location.pathname + window.location.search + window.location.hash;
    const snapshot = {
      name: metric.name,
      value: normalizeWebVitalValue(metric.name, metric.value),
      delta: normalizeWebVitalValue(metric.name, metric.delta),
      rating: getMetricRating(metric),
      pathname,
      recordedAt: new Date().toISOString(),
      navigationType: metric.navigationType,
    };

    persistWebVital(snapshot);
    capturePostHogEvent("web_vital_reported", {
      name: snapshot.name,
      value: snapshot.value,
      delta: snapshot.delta,
      rating: snapshot.rating,
      pathname: snapshot.pathname,
      navigationType: snapshot.navigationType ?? null,
    });
  });

  return null;
}
