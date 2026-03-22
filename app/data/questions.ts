import { seededShuffle } from "../lib/daily-pack";

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

export type QuizSessionMode = "quick" | "deep";

export const QUIZ_SESSION_PRESETS: Record<
  QuizSessionMode,
  { label: string; count: number; description: string }
> = {
  quick: { label: "Quick", count: 10, description: "10 questions · 2 minutes" },
  deep: { label: "Deep", count: 20, description: "20 questions · 4 minutes" },
};

export const DEFAULT_QUIZ_MODE: QuizSessionMode = "quick";

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
  {
    id: 11,
    question:
      "At the end of a busy day, how much of the important context can you replay without checking tools?",
    dimension: "memory",
    options: [
      { text: "Almost none — the day blurs together", score: 0 },
      { text: "A few highlights, but most is fuzzy", score: 1 },
      { text: "The big decisions and key moments", score: 2 },
      { text: "A clear recap with decisions, owners, and next steps", score: 3 },
    ],
  },
  {
    id: 12,
    question: "When you promise someone a follow-up, what happens next?",
    dimension: "follow_up",
    options: [
      { text: "It lives in my head and often slips", score: 0 },
      { text: "I hope I remember or see it in my inbox", score: 1 },
      { text: "I add a reminder or note most of the time", score: 2 },
      { text: "It goes into a system with a clear next step", score: 3 },
    ],
  },
  {
    id: 13,
    question: "How consistent is your capture habit after meetings or calls?",
    dimension: "consistency",
    options: [
      { text: "No habit at all", score: 0 },
      { text: "Occasional notes when it feels important", score: 1 },
      { text: "I capture most sessions", score: 2 },
      { text: "Every session is captured the same way", score: 3 },
    ],
  },
  {
    id: 14,
    question:
      "If someone asks what’s happening with a key relationship or account, how fast can you answer?",
    dimension: "awareness",
    options: [
      { text: "I’d need to dig and reconstruct", score: 0 },
      { text: "I can give a vague update", score: 1 },
      { text: "I can summarize the latest state", score: 2 },
      {
        text: "I can give status, last touchpoint, and next step",
        score: 3,
      },
    ],
  },
  {
    id: 15,
    question:
      "When you revisit a project from months ago, how much of the rationale is still retrievable?",
    dimension: "memory",
    options: [
      { text: "Almost none — I only remember outcomes", score: 0 },
      { text: "Some reasons, but incomplete", score: 1 },
      { text: "Most of the reasoning with some gaps", score: 2 },
      { text: "Clear context, tradeoffs, and decisions", score: 3 },
    ],
  },
  {
    id: 16,
    question: "How do you handle open loops from a busy week?",
    dimension: "follow_up",
    options: [
      { text: "I lose track of many of them", score: 0 },
      { text: "I scan my inbox and hope to catch them", score: 1 },
      { text: "I review and close most of them", score: 2 },
      { text: "I have a ritual to close every open loop", score: 3 },
    ],
  },
  {
    id: 17,
    question: "How often do you review what you captured?",
    dimension: "consistency",
    options: [
      { text: "I never review it", score: 0 },
      { text: "Rarely — only when something breaks", score: 1 },
      { text: "Weekly or biweekly", score: 2 },
      { text: "Daily or at a set cadence", score: 3 },
    ],
  },
  {
    id: 18,
    question:
      "Before a high-stakes conversation, how prepared are you on their priorities and history?",
    dimension: "awareness",
    options: [
      { text: "Not prepared", score: 0 },
      { text: "I skim a few recent messages", score: 1 },
      { text: "I review key notes and context", score: 2 },
      { text: "I have a full timeline and open threads", score: 3 },
    ],
  },
  {
    id: 19,
    question: "How quickly do important details fade after a meeting?",
    dimension: "memory",
    options: [
      { text: "Within hours", score: 0 },
      { text: "Within a day or two", score: 1 },
      { text: "After a week or so", score: 2 },
      { text: "They stay accessible until I need them", score: 3 },
    ],
  },
  {
    id: 20,
    question: "When someone is waiting on you, how do you ensure they get a response?",
    dimension: "follow_up",
    options: [
      { text: "I rely on memory", score: 0 },
      { text: "I remember when I see their name", score: 1 },
      { text: "I set a reminder or note", score: 2 },
      { text: "I log it with a due date and status", score: 3 },
    ],
  },
  {
    id: 21,
    question: "How often do you miss capturing a key decision?",
    dimension: "consistency",
    options: [
      { text: "Frequently", score: 0 },
      { text: "Sometimes", score: 1 },
      { text: "Rarely", score: 2 },
      { text: "Almost never", score: 3 },
    ],
  },
  {
    id: 22,
    question: "How well do you track which projects are at risk right now?",
    dimension: "awareness",
    options: [
      { text: "I’m usually surprised", score: 0 },
      { text: "I have a rough sense", score: 1 },
      { text: "I track most risks", score: 2 },
      { text: "I have a clear, updated view", score: 3 },
    ],
  },
  {
    id: 23,
    question:
      "If asked to summarize last week's most important decisions, what happens?",
    dimension: "memory",
    options: [
      { text: "I struggle to recall them", score: 0 },
      { text: "I can name one or two", score: 1 },
      { text: "I can list most of them", score: 2 },
      { text: "I can list them with context and ownership", score: 3 },
    ],
  },
  {
    id: 24,
    question: "How often do you follow up exactly when you intended to?",
    dimension: "follow_up",
    options: [
      { text: "Rarely", score: 0 },
      { text: "Sometimes", score: 1 },
      { text: "Often", score: 2 },
      { text: "Almost always", score: 3 },
    ],
  },
  {
    id: 25,
    question:
      "Do you have a default place where all commitments and notes live?",
    dimension: "consistency",
    options: [
      { text: "No, it's spread everywhere", score: 0 },
      { text: "A few places with no single source", score: 1 },
      { text: "Mostly one place, but not always", score: 2 },
      { text: "Yes, everything lands in one system", score: 3 },
    ],
  },
  {
    id: 26,
    question:
      "How clearly do you know the next step for each of your top relationships?",
    dimension: "awareness",
    options: [
      { text: "I don't know", score: 0 },
      { text: "For a few", score: 1 },
      { text: "For most", score: 2 },
      { text: "For all of them", score: 3 },
    ],
  },
  {
    id: 27,
    question:
      "When context is challenged in a meeting, how often can you pull up the facts from memory?",
    dimension: "memory",
    options: [
      { text: "Almost never", score: 0 },
      { text: "Sometimes", score: 1 },
      { text: "Often", score: 2 },
      { text: "Almost always", score: 3 },
    ],
  },
  {
    id: 28,
    question:
      "How do you make sure promises you receive from others actually close?",
    dimension: "follow_up",
    options: [
      { text: "I don't track them", score: 0 },
      { text: "I rely on them to remember", score: 1 },
      { text: "I check in when I can", score: 2 },
      { text: "I track and follow up systematically", score: 3 },
    ],
  },
  {
    id: 29,
    question: "When you’re busy, what happens to your capture habits?",
    dimension: "consistency",
    options: [
      { text: "They disappear", score: 0 },
      { text: "They become inconsistent", score: 1 },
      { text: "They mostly hold", score: 2 },
      { text: "They stay solid no matter what", score: 3 },
    ],
  },
  {
    id: 30,
    question:
      "How often do you get caught off guard by a stakeholder’s last request or status?",
    dimension: "awareness",
    options: [
      { text: "Frequently", score: 0 },
      { text: "Sometimes", score: 1 },
      { text: "Rarely", score: 2 },
      { text: "Almost never", score: 3 },
    ],
  },
  {
    id: 31,
    question: "How easy is it to recall the last three promises you made?",
    dimension: "memory",
    options: [
      { text: "I can't recall them", score: 0 },
      { text: "I can recall one", score: 1 },
      { text: "I can recall most", score: 2 },
      { text: "I can recall all with details", score: 3 },
    ],
  },
  {
    id: 32,
    question: "When you send a follow-up, how well do you track the outcome?",
    dimension: "follow_up",
    options: [
      { text: "I don't track outcomes", score: 0 },
      { text: "I check in only if I remember", score: 1 },
      { text: "I track important ones", score: 2 },
      { text: "Every follow-up has a status", score: 3 },
    ],
  },
  {
    id: 33,
    question: "Do you have a weekly ritual to review ongoing commitments?",
    dimension: "consistency",
    options: [
      { text: "No", score: 0 },
      { text: "Occasionally", score: 1 },
      { text: "Most weeks", score: 2 },
      { text: "Every week without fail", score: 3 },
    ],
  },
  {
    id: 34,
    question:
      "If you were asked who you should re-engage this week, how clear is your answer?",
    dimension: "awareness",
    options: [
      { text: "Not clear", score: 0 },
      { text: "A few names", score: 1 },
      { text: "Several with reasons", score: 2 },
      { text: "A prioritized list with next steps", score: 3 },
    ],
  },
  {
    id: 35,
    question:
      "How long does it take you to reconstruct a conversation from a month ago?",
    dimension: "memory",
    options: [
      { text: "I can't without help", score: 0 },
      { text: "It takes a long time", score: 1 },
      { text: "A few minutes with effort", score: 2 },
      { text: "I can do it quickly", score: 3 },
    ],
  },
  {
    id: 36,
    question: "How often do you close loops the same day you open them?",
    dimension: "follow_up",
    options: [
      { text: "Almost never", score: 0 },
      { text: "Sometimes", score: 1 },
      { text: "Often", score: 2 },
      { text: "Almost always", score: 3 },
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
  const totalPossible = answers.length * 3;
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

export function getDailyQuestionOrder({
  count,
  focus,
  seed,
}: {
  count: number;
  focus?: DimensionKey;
  seed: number;
}): number[] {
  const total = Math.max(1, Math.min(count, questions.length));

  if (!focus) {
    return seededShuffle(getBaseQuestionOrder(), seed).slice(0, total);
  }

  const focusIds = questions
    .filter((question) => question.dimension === focus)
    .map((question) => question.id);
  const restIds = questions
    .filter((question) => question.dimension !== focus)
    .map((question) => question.id);

  const prioritized = seededShuffle(focusIds, seed + 11);
  const remainder = seededShuffle(restIds, seed + 29);
  return [...prioritized, ...remainder].slice(0, total);
}

export function getQuestionsByOrder(order?: number[]): Question[] {
  if (!order || order.length === 0) {
    return questions;
  }

  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const resolved = order
    .map((id) => questionMap.get(id) ?? null)
    .filter((question): question is Question => Boolean(question));
  const unique = new Set(resolved.map((question) => question.id));

  if (resolved.length !== order.length || unique.size !== order.length) {
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
