import { type DimensionKey, getDimension } from "../data/questions";

export interface ImprovementDay {
  title: string;
  tasks: string[];
}

export interface ImprovementPlan {
  days: ImprovementDay[];
  expectedGain: string;
}

const playbookLibrary: Record<DimensionKey, ImprovementDay[]> = {
  memory: [
    {
      title: "Day 1",
      tasks: [
        "List the five most important decisions you made in the last two weeks",
        "Capture the why behind each decision in a single sentence",
      ],
    },
    {
      title: "Day 2",
      tasks: [
        "Summarize three key meetings from this week in under 3 minutes",
        "Highlight the exact commitments and owners",
      ],
    },
    {
      title: "Day 3",
      tasks: [
        "Review yesterday's notes and tag the top two that still matter",
        "Set a reminder to revisit them in 7 days",
      ],
    },
  ],
  follow_up: [
    {
      title: "Day 1",
      tasks: [
        "List five pending replies you owe",
        "Pick the three with the highest leverage",
      ],
    },
    {
      title: "Day 2",
      tasks: ["Send three follow-ups", "Log the next step for each"],
    },
    {
      title: "Day 3",
      tasks: [
        "Track responses and update statuses",
        "Schedule one follow-up check-in",
      ],
    },
  ],
  consistency: [
    {
      title: "Day 1",
      tasks: [
        "Choose one capture ritual (notes, voice memo, or CRM) and commit to it",
        "Block a 10-minute daily review slot",
      ],
    },
    {
      title: "Day 2",
      tasks: [
        "Backfill yesterday's conversations into that system",
        "Flag the two most important open loops",
      ],
    },
    {
      title: "Day 3",
      tasks: [
        "Review the week and close one open loop",
        "Write one insight you want to remember in 30 days",
      ],
    },
  ],
  awareness: [
    {
      title: "Day 1",
      tasks: [
        "List your 10 most important relationships",
        "Note the last touchpoint for each",
      ],
    },
    {
      title: "Day 2",
      tasks: [
        "Add one next step for each relationship",
        "Prioritize the three that need a refresh",
      ],
    },
    {
      title: "Day 3",
      tasks: ["Reach out to three key people", "Track the response"],
    },
  ],
};

function getExpectedGain(score: number): string {
  if (score >= 85) {
    return "Expected Score Gain: +3 to +6";
  }

  if (score >= 70) {
    return "Expected Score Gain: +5 to +10";
  }

  if (score >= 55) {
    return "Expected Score Gain: +7 to +12";
  }

  return "Expected Score Gain: +10 to +18";
}

export function generatePlaybook(
  weakestArea: DimensionKey,
  score: number
): ImprovementPlan {
  const fallbackArea: DimensionKey = "memory";
  const resolvedArea = playbookLibrary[weakestArea] ? weakestArea : fallbackArea;
  const plan = playbookLibrary[resolvedArea];
  const expectedGain = getExpectedGain(score);
  const title = getDimension(resolvedArea).title;

  return {
    days: plan.map((day) => ({
      ...day,
      title: `${day.title}: ${title}`,
    })),
    expectedGain,
  };
}
