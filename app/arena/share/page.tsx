import ArenaShareCardView from "./ArenaShareCardView";
import {
  ARENA_STANCE_LABELS,
  normalizeArenaPercents,
  resolveDominantFromPercents,
  type ArenaAnswer,
} from "../../lib/arena-share";

// LEGACY SHARE ROUTE - query-param based, pre-Supabase.
// Will be deprecated once all share flows use Supabase-backed /share/[id].
// Do not add new features here. New share logic goes in /app/share/[score]/page.tsx.

const clampPercent = (value?: string): number => {
  const numeric = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.min(100, Math.max(0, numeric));
};

const resolveDominantLabel = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  if (trimmed in ARENA_STANCE_LABELS) {
    const key = trimmed as ArenaAnswer;
    return ARENA_STANCE_LABELS[key];
  }
  const match = Object.values(ARENA_STANCE_LABELS).find(
    (label) => label.toLowerCase() === trimmed
  );
  return match ?? null;
};

const getParam = (
  value: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const cleanText = (value?: string, max = 48): string | undefined => {
  if (!value) {
    return undefined;
  }
  return value.trim().slice(0, max);
};

export default function ArenaSharePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): React.JSX.Element {
  const name = cleanText(getParam(searchParams.name));
  const role = cleanText(getParam(searchParams.role), 64);
  const profile = cleanText(getParam(searchParams.profile)) ?? "Hot Takes Profile";
  const agree = clampPercent(getParam(searchParams.agree));
  const disagree = clampPercent(getParam(searchParams.disagree));
  const depends = clampPercent(getParam(searchParams.depends));
  const dominant = resolveDominantLabel(getParam(searchParams.dominant));
  const mode = getParam(searchParams.mode);
  const takes = Number.parseInt(getParam(searchParams.takes) ?? "", 10);

  const normalized = normalizeArenaPercents({
    agree,
    disagree,
    depends,
  });
  const dominantKey = resolveDominantFromPercents({
    agree: normalized.agreePct,
    disagree: normalized.disagreePct,
    depends: normalized.dependsPct,
  });
  const resolvedDominant = dominant ?? ARENA_STANCE_LABELS[dominantKey];

  return (
    <ArenaShareCardView
      profile={profile}
      name={name}
      role={role}
      agree={normalized.agreePct}
      disagree={normalized.disagreePct}
      depends={normalized.dependsPct}
      dominant={resolvedDominant}
      mode={mode}
      takes={Number.isNaN(takes) ? undefined : takes}
    />
  );
}
