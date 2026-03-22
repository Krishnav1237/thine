const USER_SEED_KEY = "thine-user-seed";

const pad = (value: number) => value.toString().padStart(2, "0");

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
}

function readUserSeed(): number {
  if (typeof window === "undefined") {
    return 1337;
  }

  const stored = window.localStorage.getItem(USER_SEED_KEY);
  if (stored) {
    const parsed = Number.parseInt(stored, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const nextSeed = Math.floor(Math.random() * 1_000_000_000);
  window.localStorage.setItem(USER_SEED_KEY, nextSeed.toString());
  return nextSeed;
}

export function getDailySeed(dateKey: string = getLocalDateKey()): number {
  return hashString(`${dateKey}-${readUserSeed()}`);
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  const random = mulberry32(seed);

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function getNextPackCountdown(now: Date = new Date()): string {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, next.getTime() - now.getTime());
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${pad(minutes)}m`;
}
