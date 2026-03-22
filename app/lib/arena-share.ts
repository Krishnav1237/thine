export type ArenaAnswer = "agree" | "depends" | "disagree";

export const ARENA_STANCE_LABELS: Record<ArenaAnswer, string> = {
  agree: "Agree",
  disagree: "Disagree",
  depends: "Depends",
};

const DOMINANT_TIE_ORDER: ArenaAnswer[] = ["depends", "agree", "disagree"];

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export const normalizeArenaPercents = (raw: Record<ArenaAnswer, number>) => {
  const rounded = {
    agree: Math.round(raw.agree),
    disagree: Math.round(raw.disagree),
    depends: Math.round(raw.depends),
  };
  const total =
    rounded.agree + rounded.disagree + rounded.depends;
  const diff = 100 - total;

  if (diff !== 0) {
    const keys: ArenaAnswer[] = ["agree", "disagree", "depends"];
    const target = keys
      .slice()
      .sort((a, b) => {
        const rawDelta = raw[b] - raw[a];
        if (rawDelta !== 0) {
          return rawDelta;
        }
        return (
          DOMINANT_TIE_ORDER.indexOf(a) - DOMINANT_TIE_ORDER.indexOf(b)
        );
      })[0];

    rounded[target] = clampPercent(rounded[target] + diff);
  }

  return {
    agreePct: rounded.agree,
    disagreePct: rounded.disagree,
    dependsPct: rounded.depends,
  };
};

export const resolveDominantFromCounts = (
  counts: Record<ArenaAnswer, number>
): ArenaAnswer => {
  const keys: ArenaAnswer[] = ["agree", "disagree", "depends"];
  return keys
    .slice()
    .sort((a, b) => {
      const countDelta = counts[b] - counts[a];
      if (countDelta !== 0) {
        return countDelta;
      }
      return DOMINANT_TIE_ORDER.indexOf(a) - DOMINANT_TIE_ORDER.indexOf(b);
    })[0];
};

export const resolveDominantFromPercents = (
  percents: Record<ArenaAnswer, number>
): ArenaAnswer => {
  const keys: ArenaAnswer[] = ["agree", "disagree", "depends"];
  return keys
    .slice()
    .sort((a, b) => {
      const percentDelta = percents[b] - percents[a];
      if (percentDelta !== 0) {
        return percentDelta;
      }
      return DOMINANT_TIE_ORDER.indexOf(a) - DOMINANT_TIE_ORDER.indexOf(b);
    })[0];
};
