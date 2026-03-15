export interface Option {
  text: string;
  score: number;
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
}

export interface Tier {
  name: string;
  min: number;
  max: number;
  description: string;
  tagline: string;
  focus: string;
  blindSpot: string;
  unlock: string;
  signals: string[];
}

export const questions: Question[] = [
  {
    id: 1,
    question:
      "You had an important meeting 3 weeks ago. How much do you remember?",
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

export const MAX_SCORE = questions.length * 3;

export const tiers: Tier[] = [
  {
    name: "Flying Blind",
    min: 0,
    max: 10,
    description:
      "You are relying on raw memory to hold meetings, commitments, and relationship context together. That means important information vanishes the moment the room clears, and you keep paying the cost later.",
    tagline: "You're operating your life and career without a durable context layer.",
    focus:
      "Most of your context is trapped in moments instead of being available when you need it again.",
    blindSpot:
      "Important follow-ups, decision rationale, and relationship threads disappear faster than you think.",
    unlock:
      "The next step is not more effort. It is one trusted system that remembers commitments and context for you.",
    signals: [
      "You walk into important conversations colder than you should.",
      "You spend too much time reconstructing what already happened.",
      "Promises and next steps depend on memory instead of infrastructure.",
    ],
  },
  {
    name: "Surviving on Talent",
    min: 11,
    max: 20,
    description:
      "You already compensate with intelligence and instinct, which is why things still look mostly fine from the outside. But context is still leaking, and you are spending real energy to recover what a better system would simply preserve.",
    tagline: "Your instincts are carrying you, but the operating system underneath is still too manual.",
    focus:
      "You can recover context, but only through effort, searching, and remembering where fragments are stored.",
    blindSpot:
      "The hidden cost is time: every cold start, every inbox dig, every delayed follow-up compounds.",
    unlock:
      "You need a cleaner operating system that turns good habits into automatic recall and reliable follow-through.",
    signals: [
      "You can usually find the answer, but not instantly.",
      "Your best relationships still rely on your personal vigilance.",
      "You notice context loss even when other people do not.",
    ],
  },
  {
    name: "Operating Elite",
    min: 21,
    max: 30,
    description:
      "You already treat context like an advantage, not an afterthought. The remaining friction is not awareness, it is maintenance: you are still doing too much of the work manually, and your system should now start compounding for you.",
    tagline: "You already think in systems. Now your context layer needs to move at the same speed you do.",
    focus:
      "You maintain a high-fidelity picture of decisions, relationships, and open loops most of the time.",
    blindSpot:
      "Your system still depends on manual upkeep, which means scale will eventually create drag.",
    unlock:
      "The next unlock is leverage: let the system surface patterns, priorities, and relationship state before they turn into work.",
    signals: [
      "You rarely lose the thread in important conversations.",
      "You already understand why personal intelligence compounds.",
      "You are ready for automation, not just better note-taking.",
    ],
  },
];

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

export function getTier(score: number): Tier {
  const normalizedScore = normalizeScore(score);
  return (
    tiers.find((tier) => normalizedScore >= tier.min && normalizedScore <= tier.max) ??
    tiers[0]
  );
}

export function getSharePath(score: number): string {
  return `/share?score=${normalizeScore(score)}`;
}
