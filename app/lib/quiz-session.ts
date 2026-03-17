import { type DimensionKey, questions } from "../data/questions";

export interface QuizProfile {
  name?: string;
  role?: string;
  focus?: DimensionKey;
}

export interface QuizSession {
  answers: number[];
  currentIndex: number;
  profile?: QuizProfile;
  introCompleted?: boolean;
  questionOrder?: number[];
}

export const QUIZ_SESSION_KEY = "thine-quiz-session";

function sanitizeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim().slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeFocus(value: unknown): DimensionKey | undefined {
  if (
    value === "memory" ||
    value === "follow_up" ||
    value === "consistency" ||
    value === "awareness"
  ) {
    return value;
  }

  return undefined;
}

function sanitizeProfile(value: unknown): QuizProfile | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as Partial<QuizProfile>;
  const name = sanitizeText(candidate.name, 32);
  const role = sanitizeText(candidate.role, 40);
  const focus = sanitizeFocus(candidate.focus);

  if (!name && !role && !focus) {
    return undefined;
  }

  return {
    name,
    role,
    focus,
  };
}

function sanitizeAnswers(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((answer) =>
      Number.isInteger(answer) && answer >= 0 && answer <= 3 ? answer : null
    )
    .filter((answer): answer is number => answer !== null)
    .slice(0, questions.length);
}

function sanitizeQuestionOrder(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const validIds = new Set(questions.map((question) => question.id));
  const sanitized = value
    .map((entry) => (Number.isInteger(entry) && validIds.has(entry) ? entry : null))
    .filter((entry): entry is number => entry !== null);

  const unique = new Set(sanitized);
  if (sanitized.length !== questions.length || unique.size !== questions.length) {
    return undefined;
  }

  return sanitized;
}

export function readQuizSession(): QuizSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(QUIZ_SESSION_KEY);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<QuizSession>;
    const answers = sanitizeAnswers(parsed.answers);
    const resolvedIndex =
      typeof parsed.currentIndex === "number" &&
      Number.isInteger(parsed.currentIndex)
        ? parsed.currentIndex
        : answers.length;
    const currentIndex = Math.min(
      questions.length,
      Math.max(0, Math.min(resolvedIndex, answers.length))
    );

    const profile = sanitizeProfile(parsed.profile);
    const questionOrder = sanitizeQuestionOrder(parsed.questionOrder);
    const introCompleted =
      typeof parsed.introCompleted === "boolean"
        ? parsed.introCompleted
        : Boolean(profile);

    return {
      answers: answers.slice(0, currentIndex),
      currentIndex,
      profile,
      introCompleted,
      questionOrder,
    };
  } catch {
    return null;
  }
}

export function writeQuizSession(session: QuizSession): void {
  if (typeof window === "undefined") {
    return;
  }

  const answers = sanitizeAnswers(session.answers).slice(0, session.currentIndex);
  const currentIndex = Math.min(
    questions.length,
    Math.max(0, Math.min(session.currentIndex, answers.length))
  );

  const profile = sanitizeProfile(session.profile);
  const questionOrder = sanitizeQuestionOrder(session.questionOrder);

  window.sessionStorage.setItem(
    QUIZ_SESSION_KEY,
    JSON.stringify({
      answers,
      currentIndex,
      profile,
      introCompleted: Boolean(session.introCompleted ?? profile),
      questionOrder,
    })
  );
}

export function clearQuizSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(QUIZ_SESSION_KEY);
}
