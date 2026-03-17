export interface Option {
  text: string;
  score: number;
}

export type DimensionKey = "memory" | "follow_up" | "consistency" | "awareness";

export interface Dimension {
  key: DimensionKey;
  title: string;
  description: string;
  focusLabel: string;
  focusDescription: string;
}

export interface Question {
  id: number;
  question: string;
  dimension: DimensionKey;
  options: Option[];
}

export const dimensions: Dimension[] = [
  {
    key: "memory",
    title: "Memory",
    description: "How well decisions and details stay retrievable after the moment.",
    focusLabel: "Memory & recall",
    focusDescription: "Keep decisions, context, and insights easy to retrieve.",
  },
  {
    key: "follow_up",
    title: "Follow-up",
    description: "How reliably commitments and promises close without slipping.",
    focusLabel: "Follow-up & commitments",
    focusDescription: "Make promises trackable and hard to forget.",
  },
  {
    key: "consistency",
    title: "Consistency",
    description: "How steady your habits are for capturing and reviewing context.",
    focusLabel: "Consistency & routine",
    focusDescription: "Build repeatable habits that keep context alive.",
  },
  {
    key: "awareness",
    title: "Awareness",
    description: "How aware you stay of relationship and project state.",
    focusLabel: "Awareness & context",
    focusDescription: "Stay warm on the people and projects that matter.",
  },
];

export const questions: Question[] = [
  {
    id: 1,
    question:
      "You had an important meeting 3 weeks ago. How much do you remember?",
    dimension: "memory",
    options: [
      {
        text: "Almost nothing — I'd need someone to remind me what it was even about",
        score: 0,
      },
      { text: "The general topic, but details are fuzzy", score: 1 },
      { text: "Key decisions and who said what, roughly", score: 2 },
      {
        text: "Specific commitments, who owns what, and exact next steps",
        score: 3,
      },
    ],
  },
  {
    id: 2,
    question:
      "Someone made you a promise in a conversation last month. How do you track it?",
    dimension: "follow_up",
    options: [
      { text: "I don't — if they forget, it's gone", score: 0 },
      { text: "I might remember if something reminds me", score: 1 },
      { text: "I make a mental note and usually follow up", score: 2 },
      { text: "I log it somewhere and follow up systematically", score: 3 },
    ],
  },
  {
    id: 3,
    question:
      "A friend mentions someone you met at a dinner 6 months ago. How fast can you recall your history with them?",
    dimension: "awareness",
    options: [
      { text: "I'd have no idea who they're talking about", score: 0 },
      { text: "The name might ring a bell, but no details", score: 1 },
      {
        text: "I'd remember the person and some context after a moment",
        score: 2,
      },
      {
        text: "Instantly — I remember what we talked about and any follow-ups",
        score: 3,
      },
    ],
  },
  {
    id: 4,
    question:
      "After an important conversation, what do you do with the insights?",
    dimension: "consistency",
    options: [
      { text: "Nothing — I move on to the next thing", score: 0 },
      {
        text: "I think about it briefly but don't capture anything",
        score: 1,
      },
      { text: "I occasionally jot down key takeaways", score: 2 },
      {
        text: "I systematically capture decisions, action items, and key context",
        score: 3,
      },
    ],
  },
  {
    id: 5,
    question:
      "You need to recall a major decision you made and why. How confident are you?",
    dimension: "memory",
    options: [
      {
        text: "I often forget why I made decisions — I just remember the outcome",
        score: 0,
      },
      { text: "I remember the decision but the reasoning is vague", score: 1 },
      {
        text: "I can usually reconstruct the reasoning if I think hard",
        score: 2,
      },
      {
        text: "I can trace back the exact context, inputs, and reasoning",
        score: 3,
      },
    ],
  },
  {
    id: 6,
    question:
      "You have a high-stakes call in 30 minutes with someone you haven't spoken to in a while. How do you prepare?",
    dimension: "awareness",
    options: [
      {
        text: "I wing it and hope context comes back during the call",
        score: 0,
      },
      { text: "I skim my inbox for their name", score: 1 },
      {
        text: "I search emails and calendar for past interactions",
        score: 2,
      },
      {
        text: "I review a complete history — past conversations, commitments, their priorities, open threads",
        score: 3,
      },
    ],
  },
  {
    id: 7,
    question:
      "How often do you forget to follow up on something you said you'd do?",
    dimension: "follow_up",
    options: [
      {
        text: "Frequently — things slip through the cracks all the time",
        score: 0,
      },
      { text: "Sometimes — I catch most but miss a few", score: 1 },
      { text: "Rarely — I have systems that mostly work", score: 2 },
      {
        text: "Almost never — everything is tracked and nothing falls through",
        score: 3,
      },
    ],
  },
  {
    id: 8,
    question:
      "It's Friday. Can you recall the most important insight from each conversation you had this week?",
    dimension: "consistency",
    options: [
      { text: "I can barely remember what happened yesterday", score: 0 },
      { text: "I remember the big ones, but most are gone", score: 1 },
      {
        text: "I could reconstruct most of them with some effort",
        score: 2,
      },
      {
        text: "Yes — I could give you a clear rundown with key details",
        score: 3,
      },
    ],
  },
  {
    id: 9,
    question:
      "Think about your 10 most important professional relationships. How well are you tracking the state of each one?",
    dimension: "awareness",
    options: [
      {
        text: "I'm not tracking them at all — I react when they reach out",
        score: 0,
      },
      {
        text: "I have a vague sense of where things stand with a few",
        score: 1,
      },
      {
        text: "I'm actively maintaining most of them but not systematically",
        score: 2,
      },
      {
        text: "I know the last interaction, open threads, and next steps for each one",
        score: 3,
      },
    ],
  },
  {
    id: 10,
    question:
      "If you lost all your devices tomorrow, how much professional context would you lose forever?",
    dimension: "consistency",
    options: [
      {
        text: "Almost everything — my memory IS my devices",
        score: 0,
      },
      {
        text: "A lot — I'd lose months of context and conversations",
        score: 1,
      },
      {
        text: "Some important stuff, but the critical things are backed up",
        score: 2,
      },
      {
        text: "Very little — my knowledge system exists beyond any single device",
        score: 3,
      },
    ],
  },
];

export const MAX_SCORE = 100;

export function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(MAX_SCORE, Math.max(0, Math.round(score)));
}

export function parseScoreParam(
  value: string | string[] | null | undefined
): number {
  const candidate = Array.isArray(value) ? value[0] : value;
  return normalizeScore(Number.parseInt(candidate ?? "0", 10));
}

export function computeScoreFromAnswers(answers: number[]): number {
  const totalPossible = questions.length * 3;
  const totalScore = answers.reduce((sum, value) => sum + value, 0);
  const normalized = totalPossible > 0 ? (totalScore / totalPossible) * MAX_SCORE : 0;
  return normalizeScore(normalized);
}

export function getDimension(key: DimensionKey): Dimension {
  return dimensions.find((dimension) => dimension.key === key) ?? dimensions[0];
}

function getBaseQuestionOrder(): number[] {
  return questions.map((question) => question.id);
}

export function getQuestionOrder(focus?: DimensionKey): number[] {
  if (!focus) {
    return getBaseQuestionOrder();
  }

  const prioritized = questions
    .filter((question) => question.dimension === focus)
    .map((question) => question.id);
  const remainder = questions
    .filter((question) => question.dimension !== focus)
    .map((question) => question.id);

  return [...prioritized, ...remainder];
}

export function getQuestionsByOrder(order?: number[]): Question[] {
  const baseOrder = getBaseQuestionOrder();
  if (!order || order.length !== baseOrder.length) {
    return questions;
  }

  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const resolved = order
    .map((id) => questionMap.get(id) ?? null)
    .filter((question): question is Question => Boolean(question));
  const unique = new Set(resolved.map((question) => question.id));

  if (resolved.length !== questions.length || unique.size !== questions.length) {
    return questions;
  }

  return resolved;
}

export function reorderAnswersToBase(answers: number[], order?: number[]): number[] {
  if (!order || order.length !== questions.length) {
    return answers;
  }

  const indexById = new Map<number, number>();
  order.forEach((id, index) => {
    indexById.set(id, index);
  });

  return questions.map((question) => {
    const answerIndex = indexById.get(question.id);
    if (answerIndex === undefined) {
      return 0;
    }

    const answer = answers[answerIndex];
    return Number.isFinite(answer) ? Math.max(0, Math.min(3, answer)) : 0;
  });
}

function lowercaseFirst(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function getPersonalizedQuestion(
  question: Question,
  focus?: DimensionKey
): string {
  if (!focus) {
    return question.question;
  }

  const focusLabel = getDimension(focus).title.toLowerCase();
  const tailored = lowercaseFirst(question.question);

  if (question.dimension === focus) {
    return `In your ${focusLabel} layer, ${tailored}`;
  }

  return `Through the lens of ${focusLabel}, ${tailored}`;
}

function sanitizeShareName(value?: string): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().slice(0, 32);
  return trimmed.length > 0 ? trimmed : null;
}

export function getSharePath(score: number, name?: string): string {
  const normalizedScore = normalizeScore(score);
  const safeName = sanitizeShareName(name);

  if (!safeName) {
    return `/share?score=${normalizedScore}`;
  }

  return `/share?score=${normalizedScore}&name=${encodeURIComponent(safeName)}`;
}
