import { questions } from "../data/questions";

export interface QuizSession {
  answers: number[];
  currentIndex: number;
}

export const QUIZ_SESSION_KEY = "thine-quiz-session";

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

    return {
      answers: answers.slice(0, currentIndex),
      currentIndex,
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

  window.sessionStorage.setItem(
    QUIZ_SESSION_KEY,
    JSON.stringify({
      answers,
      currentIndex,
    })
  );
}

export function clearQuizSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(QUIZ_SESSION_KEY);
}
