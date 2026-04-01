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

/** Trusted hostnames to prevent host-header injection attacks. */
function buildAllowedHosts(): Set<string> {
  const hosts = new Set<string>(["localhost"]);

  try {
    hosts.add(new URL(FALLBACK_SITE_URL).hostname);
  } catch {
    // noop
  }

  for (const envVar of [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]) {
    if (envVar?.trim()) {
      try {
        const candidate = /^https?:\/\//i.test(envVar)
          ? envVar
          : `https://${envVar}`;
        hosts.add(new URL(candidate).hostname);
      } catch {
        // skip invalid
      }
    }
  }

  return hosts;
}

const ALLOWED_HOSTS = buildAllowedHosts();

function isAllowedHost(host: string): boolean {
  try {
    const hostname = host.split(":")[0].toLowerCase();
    return ALLOWED_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

export async function getRequestSiteUrl(): Promise<string> {
  try {
    const requestHeaders = await headers();
    const forwardedProto = requestHeaders.get("x-forwarded-proto");
    const forwardedHost = requestHeaders.get("x-forwarded-host");
    const host = forwardedHost || requestHeaders.get("host");

    if (host && isAllowedHost(host)) {
      return normalizeSiteUrl(
        `${forwardedProto || (host.includes("localhost") ? "http" : "https")}://${host}`
      );
    }
  } catch {
    // Fall back to configured site URL when request headers are unavailable.
  }

  return siteUrl;
}
