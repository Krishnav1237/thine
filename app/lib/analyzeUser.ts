import {
  dimensions,
  normalizeScore,
  questions,
  type DimensionKey,
} from "../data/questions";
import { generatePlaybook, type ImprovementPlan } from "./generatePlaybook";

export interface DimensionScore {
  key: DimensionKey;
  title: string;
  score: number;
  max: number;
  percent: number;
}

export interface ScoreBand {
  name: string;
  min: number;
  max: number;
  tagline: string;
  focus: string;
  highlights: string[];
}

export interface UserAnalysis {
  weakestArea: DimensionKey;
  strengths: string[];
  improvementLevel: string;
  improvementPlan: ImprovementPlan;
  dimensionScores: DimensionScore[];
}

export const scoreBands: ScoreBand[] = [
  {
    name: "Foundation",
    min: 0,
    max: 39,
    tagline: "Most context lives in memory, so details fade quickly.",
    focus: "Build a repeatable capture habit so nothing depends on recall.",
    highlights: [
      "Memory is doing most of the work",
      "Follow-through depends on recall",
    ],
  },
  {
    name: "Builder",
    min: 40,
    max: 69,
    tagline: "Some systems exist, but follow-through still leaks.",
    focus: "Strengthen the rituals that protect commitments and context.",
    highlights: [
      "You have early systems, but they are inconsistent",
      "Context still leaks under pressure",
    ],
  },
  {
    name: "High Performer",
    min: 70,
    max: 89,
    tagline: "Reliable context retention with a few vulnerable edges.",
    focus: "Tighten the weakest dimension and protect momentum.",
    highlights: [
      "Strong retention across most areas",
      "A few weak spots still create leaks",
    ],
  },
  {
    name: "Elite",
    min: 90,
    max: 100,
    tagline: "Your system keeps context durable and consistently retrievable.",
    focus: "Maintain the standard and keep compounding your edge.",
    highlights: [
      "Context is durable and searchable",
      "Follow-up loops rarely break",
    ],
  },
];

export function getScoreBand(score: number): ScoreBand {
  const normalized = normalizeScore(score);
  return (
    scoreBands.find((band) => normalized >= band.min && normalized <= band.max) ??
    scoreBands[0]
  );
}

export function getScoreCategory(score: number): string {
  return getScoreBand(score).name;
}

export function getPercentileCopy(score: number): string {
  const normalized = normalizeScore(score);
  const band = getScoreBand(normalized);
  const span = band.max - band.min;
  const progress = span > 0 ? Math.round(((normalized - band.min) / span) * 100) : 0;

  return `You are ${progress}% of the way through the ${band.name} band.`;
}

export function getImprovementLevel(score: number): string {
  const normalized = normalizeScore(score);

  if (normalized >= 85) {
    return "Optimization";
  }

  if (normalized >= 70) {
    return "Momentum";
  }

  if (normalized >= 55) {
    return "Stability";
  }

  return "Reset";
}

export function calculateDimensionScores(answers: number[]): DimensionScore[] {
  const totals = new Map<DimensionKey, { score: number; max: number }>();

  dimensions.forEach((dimension) => {
    totals.set(dimension.key, { score: 0, max: 0 });
  });

  questions.forEach((question, index) => {
    const total = totals.get(question.dimension);
    if (!total) {
      return;
    }

    const raw = answers[index];
    const safeScore = Number.isFinite(raw) ? Math.max(0, Math.min(3, raw)) : 0;

    total.score += safeScore;
    total.max += 3;
  });

  return dimensions.map((dimension) => {
    const total = totals.get(dimension.key) ?? { score: 0, max: 0 };
    const percent = total.max > 0 ? Math.round((total.score / total.max) * 100) : 0;

    return {
      key: dimension.key,
      title: dimension.title,
      score: total.score,
      max: total.max,
      percent,
    };
  });
}

export function analyzeUser(answers: number[], score: number): UserAnalysis {
  const dimensionScores = calculateDimensionScores(answers);
  const sorted = [...dimensionScores].sort((a, b) => b.percent - a.percent);
  const strengths = sorted.slice(0, 2).map((item) => item.title);
  const weakest = sorted[sorted.length - 1] ?? dimensionScores[0];
  const weakestArea = weakest?.key ?? dimensions[0].key;

  return {
    weakestArea,
    strengths,
    improvementLevel: getImprovementLevel(score),
    improvementPlan: generatePlaybook(weakestArea, score),
    dimensionScores,
  };
}
