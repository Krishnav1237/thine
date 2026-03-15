const THINE_BASE_URL = "https://www.thine.com";
const DEFAULT_CAMPAIGN = "personal-intelligence-quiz";

function buildTrackedUrl(
  path: string,
  source: string,
  medium: string,
  campaign = DEFAULT_CAMPAIGN
): string {
  const url = new URL(path, THINE_BASE_URL);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

export const thineLinks = {
  story: buildTrackedUrl("/story", "quiz", "nav"),
  landing: buildTrackedUrl("/", "quiz", "landing"),
  results: buildTrackedUrl("/", "quiz", "results"),
  share: buildTrackedUrl("/", "quiz", "share"),
};
