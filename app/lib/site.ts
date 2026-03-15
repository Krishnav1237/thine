import { headers } from "next/headers";

const FALLBACK_SITE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://www.thine.com";

function normalizeSiteUrl(url: string): string {
  try {
    const candidate = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    FALLBACK_SITE_URL
);

export async function getRequestSiteUrl(): Promise<string> {
  try {
    const requestHeaders = await headers();
    const forwardedProto = requestHeaders.get("x-forwarded-proto");
    const forwardedHost = requestHeaders.get("x-forwarded-host");
    const host = forwardedHost || requestHeaders.get("host");

    if (host) {
      return normalizeSiteUrl(
        `${forwardedProto || (host.includes("localhost") ? "http" : "https")}://${host}`
      );
    }
  } catch {
    // Fall back to configured site URL when request headers are unavailable.
  }

  return siteUrl;
}
