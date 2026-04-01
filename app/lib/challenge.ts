import { normalizeScore } from "../data/questions";
import { getSupabaseBrowserClient } from "./supabase/client";

export const CHALLENGE_STORAGE_KEY = "thine-challenge";
export const CHALLENGE_REF_KEY = "thine-challenge-ref";
export const CHALLENGE_COMPLETIONS_KEY = "thine-challenge-completions";
export const CHALLENGE_COMPLETED_REFS_KEY = "thine-challenge-completed-refs";

export interface ChallengeData {
  challengerScore: number;
  challengerName?: string;
  ref?: string;
}

function createRefId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `ref-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}

export function getOrCreateRefId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const existing = window.localStorage.getItem(CHALLENGE_REF_KEY);
  if (existing) {
    return existing;
  }

  const created = createRefId();
  window.localStorage.setItem(CHALLENGE_REF_KEY, created);
  return created;
}

export function buildChallengePath(
  score: number,
  name?: string,
  refId?: string | null
): string {
  const params = new URLSearchParams({
    challenge: "true",
    score: normalizeScore(score).toString(),
  });

  if (name) {
    params.set("name", name.trim().slice(0, 32));
  }

  const resolvedRef = refId ?? getOrCreateRefId();
  if (resolvedRef) {
    params.set("ref", resolvedRef);
  }

  return `/?${params.toString()}`;
}

export function readChallenge(): ChallengeData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as ChallengeData;
    if (!Number.isFinite(parsed.challengerScore)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function sanitizeRef(ref?: string): string | undefined {
  if (!ref || typeof ref !== "string") {
    return undefined;
  }

  const cleaned = ref.trim().slice(0, 128).replace(/[^a-zA-Z0-9\-_]/g, "");
  return cleaned.length > 0 ? cleaned : undefined;
}

export function storeChallenge(data: ChallengeData): void {
  if (typeof window === "undefined") {
    return;
  }

  const sanitized: ChallengeData = {
    ...data,
    challengerName: data.challengerName?.trim().slice(0, 32),
    ref: sanitizeRef(data.ref),
  };

  window.localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(sanitized));
}

function readCompletionMap(): Record<string, number> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(CHALLENGE_COMPLETIONS_KEY);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as Record<string, number>;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

function readCompletedRefs(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const stored = window.localStorage.getItem(CHALLENGE_COMPLETED_REFS_KEY);
    if (!stored) {
      return new Set();
    }

    const parsed = JSON.parse(stored) as string[];
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function hasCompletedChallengeRef(refId?: string | null): boolean {
  if (!refId) {
    return false;
  }

  return readCompletedRefs().has(refId);
}

function writeCompletedRefs(refs: Set<string>): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    CHALLENGE_COMPLETED_REFS_KEY,
    JSON.stringify(Array.from(refs))
  );
}

export function registerChallengeCompletion(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const challenge = readChallenge();
  if (!challenge?.ref) {
    return null;
  }

  const refId = challenge.ref;
  const completedRefs = readCompletedRefs();
  const completionMap = readCompletionMap();

  if (completedRefs.has(refId)) {
    return completionMap[refId] ?? 0;
  }

  const nextCount = (completionMap[refId] ?? 0) + 1;
  completionMap[refId] = nextCount;
  completedRefs.add(refId);

  window.localStorage.setItem(
    CHALLENGE_COMPLETIONS_KEY,
    JSON.stringify(completionMap)
  );
  writeCompletedRefs(completedRefs);

  return nextCount;
}

export function readChallengeCompletionCount(refId?: string | null): number {
  if (!refId) {
    return 0;
  }

  const completionMap = readCompletionMap();
  return completionMap[refId] ?? 0;
}

export async function registerChallengeCompletionRemote(
  ref: string,
  score: number,
  name?: string
): Promise<void> {
  if (!ref) {
    return;
  }

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return;
  }

  try {
    await supabase.from("challenge_completions").insert({
      ref,
      completer_score: normalizeScore(score),
      completer_name: name?.trim().slice(0, 32) || null,
    });
  } catch {
    // Fall back silently to local-only tracking.
  }
}

export async function getChallengeCompletionCount(
  refId?: string | null
): Promise<number> {
  if (!refId) {
    return 0;
  }

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return readChallengeCompletionCount(refId);
  }

  try {
    const { data, error } = await supabase.rpc("countchallengecompletions", {
      ref_code: refId,
    });

    if (error || typeof data !== "number") {
      return readChallengeCompletionCount(refId);
    }

    return Math.max(readChallengeCompletionCount(refId), data);
  } catch {
    return readChallengeCompletionCount(refId);
  }
}
