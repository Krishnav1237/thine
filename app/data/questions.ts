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
  {
    id: 37,
    question: "A project resurfaces after two months. How well can you recall the assumptions behind your last recommendation?",
    dimension: "memory",
    options: [
      { text: "I'd be starting from zero", score: 0 },
      { text: "I remember the broad direction, not the assumptions", score: 1 },
      { text: "I can recover the main assumptions after some digging", score: 2 },
      { text: "I can recall the assumptions, tradeoffs, and open risks clearly", score: 3 }
    ],
  },
  {
    id: 38,
    question: "You leave a meeting with three loose promises and no owners. What happens next?",
    dimension: "follow_up",
    options: [
      { text: "Nothing unless someone reminds me later", score: 0 },
      { text: "I remember one or two, but the rest drift", score: 1 },
      { text: "I follow up on the important ones manually", score: 2 },
      { text: "I convert each promise into a tracked owner and next step", score: 3 }
    ],
  },
  {
    id: 39,
    question: "How often do you review what you captured before starting a new week?",
    dimension: "consistency",
    options: [
      { text: "Almost never", score: 0 },
      { text: "Only when things feel chaotic", score: 1 },
      { text: "Most weeks, with some gaps", score: 2 },
      { text: "Every week with a consistent review ritual", score: 3 }
    ],
  },
  {
    id: 40,
    question: "A teammate suddenly goes quiet after seeming energized. How quickly do you notice and interpret the shift?",
    dimension: "awareness",
    options: [
      { text: "I usually miss it entirely", score: 0 },
      { text: "I notice eventually, but I cannot explain it", score: 1 },
      { text: "I pick up the shift and can make an educated guess", score: 2 },
      { text: "I notice quickly and connect it to likely context or pressure", score: 3 }
    ],
  },
  {
    id: 41,
    question: "A recurring problem appears again. How easily can you recall earlier patterns around it?",
    dimension: "memory",
    options: [
      { text: "I only remember that it felt familiar", score: 0 },
      { text: "I can recall one or two fragments", score: 1 },
      { text: "I can reconstruct the previous pattern with some effort", score: 2 },
      { text: "I remember the pattern, triggers, and prior fixes clearly", score: 3 }
    ],
  },
  {
    id: 42,
    question: "Someone gives you useful advice in passing. How likely is it to become an actual action?",
    dimension: "follow_up",
    options: [
      { text: "It usually disappears after the conversation", score: 0 },
      { text: "I remember it briefly but rarely act on it", score: 1 },
      { text: "I act on important advice if it still feels urgent later", score: 2 },
      { text: "I capture it, assign a next step, and revisit it deliberately", score: 3 }
    ],
  },
  {
    id: 43,
    question: "After a strong conversation, how repeatable is your capture routine?",
    dimension: "consistency",
    options: [
      { text: "I do whatever feels convenient in the moment", score: 0 },
      { text: "I capture sometimes, depending on energy", score: 1 },
      { text: "I have a loose routine that works most days", score: 2 },
      { text: "I follow the same lightweight routine almost every time", score: 3 }
    ],
  },
  {
    id: 44,
    question: "In a room where everyone sounds aligned, how good are you at spotting the hidden concern?",
    dimension: "awareness",
    options: [
      { text: "I usually take the agreement at face value", score: 0 },
      { text: "I sense tension but cannot locate it", score: 1 },
      { text: "I can often identify who is unconvinced", score: 2 },
      { text: "I can usually read the unstated concern and who holds it", score: 3 }
    ],
  },
  {
    id: 45,
    question: "After a pitch or interview, how well do you remember the objections people raised?",
    dimension: "memory",
    options: [
      { text: "I mostly remember whether it went well or badly", score: 0 },
      { text: "I remember one major objection", score: 1 },
      { text: "I remember the main objections with some specifics", score: 2 },
      { text: "I can recall the objections, wording, and where they came from", score: 3 }
    ],
  },
  {
    id: 46,
    question: "Someone says, \"Let's circle back next week.\" What do you typically do?",
    dimension: "follow_up",
    options: [
      { text: "I hope they remember", score: 0 },
      { text: "I rely on memory and often miss the timing", score: 1 },
      { text: "I set a reminder for important cases", score: 2 },
      { text: "I log the follow-up and revisit it on schedule", score: 3 }
    ],
  },
  {
    id: 47,
    question: "How fragmented is your capture system across notes, messages, screenshots, and memory?",
    dimension: "consistency",
    options: [
      { text: "Completely fragmented", score: 0 },
      { text: "Somewhat fragmented, with no clear home base", score: 1 },
      { text: "Mostly centralized, but with a few leaks", score: 2 },
      { text: "Deliberately centralized and easy to review", score: 3 }
    ],
  },
  {
    id: 48,
    question: "How early do you notice when a project is drifting before the metrics make it obvious?",
    dimension: "awareness",
    options: [
      { text: "Usually after it is already a problem", score: 0 },
      { text: "I notice late, when the signs are already visible", score: 1 },
      { text: "I can often feel drift before it becomes explicit", score: 2 },
      { text: "I usually detect drift early from subtle behavior and signal changes", score: 3 }
    ],
  },
  {
    id: 49,
    question: "When your opinion changes on a major decision, how well do you remember what changed your mind?",
    dimension: "memory",
    options: [
      { text: "I remember the new opinion, not the turning point", score: 0 },
      { text: "I vaguely recall one factor", score: 1 },
      { text: "I can name the main evidence or moment", score: 2 },
      { text: "I can explain the full chain of evidence that changed my view", score: 3 }
    ],
  },
  {
    id: 50,
    question: "A warm intro is requested for next week. How dependable is your follow-through?",
    dimension: "follow_up",
    options: [
      { text: "I often forget unless nudged", score: 0 },
      { text: "I remember if it feels urgent enough", score: 1 },
      { text: "I usually send it, though timing slips sometimes", score: 2 },
      { text: "I track it and complete it when I said I would", score: 3 }
    ],
  },
  {
    id: 51,
    question: "How often do you process meetings and calls the same day they happen?",
    dimension: "consistency",
    options: [
      { text: "Rarely", score: 0 },
      { text: "Only for unusually important conversations", score: 1 },
      { text: "Most of the time, though not always fully", score: 2 },
      { text: "Almost always, with a repeatable same-day reset", score: 3 }
    ],
  },
  {
    id: 52,
    question: "How good are you at noticing disagreement that never gets voiced directly?",
    dimension: "awareness",
    options: [
      { text: "I usually miss it", score: 0 },
      { text: "I notice something is off but cannot place it", score: 1 },
      { text: "I can often tell who is unconvinced", score: 2 },
      { text: "I can usually read the hesitation and its likely cause", score: 3 }
    ],
  },
  {
    id: 53,
    question: "A contact mentions a personal detail you may need later. How likely are you to remember it accurately?",
    dimension: "memory",
    options: [
      { text: "I usually forget details like that", score: 0 },
      { text: "I remember the topic but not the specifics", score: 1 },
      { text: "I can recall the detail if prompted", score: 2 },
      { text: "I retain or capture it so it is easy to use later", score: 3 }
    ],
  },
  {
    id: 54,
    question: "When a request depends on three different people replying, what usually happens?",
    dimension: "follow_up",
    options: [
      { text: "I lose track of it quickly", score: 0 },
      { text: "I push once and then hope it resolves", score: 1 },
      { text: "I monitor it informally until it closes", score: 2 },
      { text: "I track every dependency and keep the thread moving", score: 3 }
    ],
  },
  {
    id: 55,
    question: "How often do you keep an actual log of major decisions instead of relying on memory?",
    dimension: "consistency",
    options: [
      { text: "Never", score: 0 },
      { text: "Only when something goes badly", score: 1 },
      { text: "For important decisions, but not consistently", score: 2 },
      { text: "As a standard habit for major calls", score: 3 }
    ],
  },
  {
    id: 56,
    question: "On a team, how clearly do you know who needs reassurance, clarity, or challenge right now?",
    dimension: "awareness",
    options: [
      { text: "I am mostly guessing", score: 0 },
      { text: "I know for one or two people", score: 1 },
      { text: "I have a decent read on most people", score: 2 },
      { text: "I can map the emotional and operational needs across the team", score: 3 }
    ],
  },
  {
    id: 57,
    question: "When considering a decision, how well do you remember the second-order effects you discussed?",
    dimension: "memory",
    options: [
      { text: "I only remember the immediate decision", score: 0 },
      { text: "I remember that tradeoffs existed, not what they were", score: 1 },
      { text: "I can recall the main downstream effects", score: 2 },
      { text: "I can explain the second-order effects and who they touched", score: 3 }
    ],
  },
  {
    id: 58,
    question: "Someone says, \"I'll take care of it.\" How do you keep that from becoming invisible?",
    dimension: "follow_up",
    options: [
      { text: "I do not keep track of it", score: 0 },
      { text: "I rely on memory and occasional checking", score: 1 },
      { text: "I follow up if it seems important enough", score: 2 },
      { text: "I capture it with ownership, timing, and a clear check-in point", score: 3 }
    ],
  },
  {
    id: 59,
    question: "How reliably do you resurface dormant threads that matter before they become urgent again?",
    dimension: "consistency",
    options: [
      { text: "I almost always miss them", score: 0 },
      { text: "I remember a few by luck", score: 1 },
      { text: "I surface important ones with some regularity", score: 2 },
      { text: "I have a deliberate cadence for resurfacing dormant threads", score: 3 }
    ],
  },
  {
    id: 60,
    question: "How well do you remember how different people prefer to communicate under pressure?",
    dimension: "awareness",
    options: [
      { text: "I mostly treat everyone the same", score: 0 },
      { text: "I remember preferences for a few people", score: 1 },
      { text: "I adapt for most important relationships", score: 2 },
      { text: "I can quickly adjust style based on each person's context and preference", score: 3 }
    ],
  },
  {
    id: 61,
    question: "After a conflict, how clearly can you separate what actually happened from the story you told yourself?",
    dimension: "memory",
    options: [
      { text: "I mostly remember my emotional version of events", score: 0 },
      { text: "I can separate them a little after time passes", score: 1 },
      { text: "I can usually distinguish facts from interpretation", score: 2 },
      { text: "I can reconstruct the facts, interpretations, and missing context distinctly", score: 3 }
    ],
  },
  {
    id: 62,
    question: "When you delegate something important, how visible is the commitment after the handoff?",
    dimension: "follow_up",
    options: [
      { text: "It mostly disappears from my radar", score: 0 },
      { text: "I remember it if it becomes urgent", score: 1 },
      { text: "I check in periodically when it matters", score: 2 },
      { text: "I keep the delegated commitment visible until it closes", score: 3 }
    ],
  },
  {
    id: 63,
    question: "How strong is your end-of-day habit for closing loops and clearing loose context?",
    dimension: "consistency",
    options: [
      { text: "I do not have one", score: 0 },
      { text: "I do it when I feel overwhelmed", score: 1 },
      { text: "I have a habit, but it breaks under pressure", score: 2 },
      { text: "I run a reliable end-of-day reset almost every day", score: 3 }
    ],
  },
  {
    id: 64,
    question: "How clearly can you tell which important relationships are warming, stable, or cooling?",
    dimension: "awareness",
    options: [
      { text: "I usually realize only when something breaks", score: 0 },
      { text: "I have a rough intuition for a few relationships", score: 1 },
      { text: "I can describe the state of most key relationships", score: 2 },
      { text: "I can track relationship temperature and what is driving it", score: 3 }
    ],
  },
  {
    id: 65,
    question: "How well can you reconstruct why a core metric moved last quarter?",
    dimension: "memory",
    options: [
      { text: "I cannot explain it without starting over", score: 0 },
      { text: "I remember one likely reason", score: 1 },
      { text: "I can recall the major drivers with effort", score: 2 },
      { text: "I can explain the major drivers, assumptions, and caveats clearly", score: 3 }
    ],
  },
  {
    id: 66,
    question: "How disciplined are you about following up while a request is still warm instead of batching it later?",
    dimension: "follow_up",
    options: [
      { text: "I usually wait too long", score: 0 },
      { text: "I follow up late more often than I want", score: 1 },
      { text: "I am fairly timely on important threads", score: 2 },
      { text: "I keep momentum while the context is still alive", score: 3 }
    ],
  },
  {
    id: 67,
    question: "How searchable and reusable are your notes a month after capture?",
    dimension: "consistency",
    options: [
      { text: "Barely usable", score: 0 },
      { text: "Some are usable, many are not", score: 1 },
      { text: "Most important notes are reusable", score: 2 },
      { text: "They are consistently structured and easy to retrieve later", score: 3 }
    ],
  },
  {
    id: 68,
    question: "How often do you sense when someone agrees publicly but is likely to resist privately?",
    dimension: "awareness",
    options: [
      { text: "I usually miss that dynamic", score: 0 },
      { text: "I only notice after the resistance shows up", score: 1 },
      { text: "I can often sense it during or right after the meeting", score: 2 },
      { text: "I usually identify it early and adjust how I close the loop", score: 3 }
    ],
  },
  {
    id: 69,
    question: "After a run of user interviews, how many surprising details can you still recall without re-reading notes?",
    dimension: "memory",
    options: [
      { text: "Only the general vibe", score: 0 },
      { text: "A couple of memorable quotes", score: 1 },
      { text: "Several patterns and standout examples", score: 2 },
      { text: "Detailed patterns, tensions, and memorable specifics", score: 3 }
    ],
  },
  {
    id: 70,
    question: "If someone does not reply to an important message, how intentional is your next move?",
    dimension: "follow_up",
    options: [
      { text: "I usually let it die", score: 0 },
      { text: "I nudge randomly when I remember", score: 1 },
      { text: "I have a rough follow-up pattern", score: 2 },
      { text: "I choose timing, channel, and framing deliberately", score: 3 }
    ],
  },
  {
    id: 71,
    question: "When you are traveling or overloaded, how well does your capture habit hold up?",
    dimension: "consistency",
    options: [
      { text: "It collapses immediately", score: 0 },
      { text: "I keep fragments, but they become messy fast", score: 1 },
      { text: "I maintain the essentials most of the time", score: 2 },
      { text: "I have a resilient lightweight routine even under load", score: 3 }
    ],
  },
  {
    id: 72,
    question: "How quickly do you see how one team's decision will create work or confusion for another?",
    dimension: "awareness",
    options: [
      { text: "Usually only after the friction appears", score: 0 },
      { text: "I notice some spillover late", score: 1 },
      { text: "I often anticipate the cross-team impact", score: 2 },
      { text: "I routinely see the second-order organizational effect early", score: 3 }
    ],
  },
  {
    id: 73,
    question: "When defending a point of view, how well can you recall the concrete examples behind it?",
    dimension: "memory",
    options: [
      { text: "I mostly rely on conviction, not examples", score: 0 },
      { text: "I can remember one example if pressed", score: 1 },
      { text: "I can usually surface a few supporting examples", score: 2 },
      { text: "I can pull up relevant examples, patterns, and context quickly", score: 3 }
    ],
  },
  {
    id: 74,
    question: "After handing work off, how often do you check whether your assumptions still hold?",
    dimension: "follow_up",
    options: [
      { text: "I rarely revisit assumptions", score: 0 },
      { text: "I revisit them only if there is visible trouble", score: 1 },
      { text: "I check them on important handoffs", score: 2 },
      { text: "I intentionally re-check assumptions before drift becomes expensive", score: 3 }
    ],
  },
  {
    id: 75,
    question: "How regularly do you prune, refresh, or reorganize your system so it stays usable?",
    dimension: "consistency",
    options: [
      { text: "I never clean it up", score: 0 },
      { text: "I do big cleanup only when things get painful", score: 1 },
      { text: "I refresh it semi-regularly", score: 2 },
      { text: "I maintain it continuously so it stays light and trustworthy", score: 3 }
    ],
  },
  {
    id: 76,
    question: "How well do you read emotional subtext in short messages, not just explicit content?",
    dimension: "awareness",
    options: [
      { text: "I mostly read messages literally", score: 0 },
      { text: "I sometimes sense tone, but not reliably", score: 1 },
      { text: "I usually catch when the tone matters", score: 2 },
      { text: "I consistently read tone, subtext, and what is missing", score: 3 }
    ],
  },
  {
    id: 77,
    question: "After a bug, outage, or failure, how well can you recall the exact sequence that led there?",
    dimension: "memory",
    options: [
      { text: "The sequence blurs almost immediately", score: 0 },
      { text: "I remember the headline, not the order", score: 1 },
      { text: "I can reconstruct the timeline with some effort", score: 2 },
      { text: "I can recall the timeline, decisions, and warning signs clearly", score: 3 }
    ],
  },
  {
    id: 78,
    question: "After a brainstorm, how reliably do ideas turn into owners, experiments, or decisions?",
    dimension: "follow_up",
    options: [
      { text: "They usually vanish", score: 0 },
      { text: "A few survive if someone is passionate", score: 1 },
      { text: "Important ideas usually turn into action", score: 2 },
      { text: "Ideas routinely convert into explicit owners and next steps", score: 3 }
    ],
  },
  {
    id: 79,
    question: "How often do you turn repeated insights into a checklist, template, or reusable system?",
    dimension: "consistency",
    options: [
      { text: "Almost never", score: 0 },
      { text: "Only after obvious pain repeats many times", score: 1 },
      { text: "I sometimes turn patterns into repeatable assets", score: 2 },
      { text: "I regularly convert patterns into reusable operating tools", score: 3 }
    ],
  },
  {
    id: 80,
    question: "How clearly do you know who actually influences a decision versus who just talks the most?",
    dimension: "awareness",
    options: [
      { text: "I usually confuse visibility with influence", score: 0 },
      { text: "I can identify a few real influencers", score: 1 },
      { text: "I usually know where the actual leverage sits", score: 2 },
      { text: "I can map the decision network and hidden influence quickly", score: 3 }
    ],
  },
  {
    id: 81,
    question: "How well can you recall the strongest counterarguments to your favorite idea?",
    dimension: "memory",
    options: [
      { text: "I mostly remember the arguments for it", score: 0 },
      { text: "I remember one objection vaguely", score: 1 },
      { text: "I can recall the main objections if I pause", score: 2 },
      { text: "I can state the best counterarguments as clearly as the case for it", score: 3 }
    ],
  },
  {
    id: 82,
    question: "How good are you at nudging someone repeatedly without damaging the relationship?",
    dimension: "follow_up",
    options: [
      { text: "I avoid nudging because it feels awkward", score: 0 },
      { text: "I nudge, but it often feels blunt or mistimed", score: 1 },
      { text: "I can usually follow up without much friction", score: 2 },
      { text: "I adapt tone, timing, and context so follow-ups feel natural and effective", score: 3 }
    ],
  },
  {
    id: 83,
    question: "When pressure spikes, how well do you protect time for reflection instead of pure reaction?",
    dimension: "consistency",
    options: [
      { text: "Reflection disappears completely", score: 0 },
      { text: "I reflect only after the rush passes", score: 1 },
      { text: "I keep a little reflection time for important work", score: 2 },
      { text: "I protect reflection as part of the operating system, even under pressure", score: 3 }
    ],
  },
  {
    id: 84,
    question: "How often can you tell when a polite \"yes\" really means \"not now\" or \"not really\"?",
    dimension: "awareness",
    options: [
      { text: "I take the yes literally", score: 0 },
      { text: "I notice sometimes, but often too late", score: 1 },
      { text: "I usually catch the difference", score: 2 },
      { text: "I read intent, timing, and hesitation accurately in the moment", score: 3 }
    ],
  },
  {
    id: 85,
    question: "When several smart people repeat the same advice over time, how likely are you to remember the pattern?",
    dimension: "memory",
    options: [
      { text: "I remember isolated moments, not the pattern", score: 0 },
      { text: "I sense repetition, but cannot name it clearly", score: 1 },
      { text: "I can usually identify the recurring message", score: 2 },
      { text: "I remember the recurring advice, sources, and how it evolved", score: 3 }
    ],
  },
  {
    id: 86,
    question: "How visible are multi-person dependencies once a project starts moving fast?",
    dimension: "follow_up",
    options: [
      { text: "They become invisible fast", score: 0 },
      { text: "I track some, but hidden blockers surprise me often", score: 1 },
      { text: "I can usually keep the critical dependencies visible", score: 2 },
      { text: "I track dependencies proactively so blockers surface early", score: 3 }
    ],
  },
  {
    id: 87,
    question: "How consistent are you about reviewing longer-term commitments that do not feel urgent this week?",
    dimension: "consistency",
    options: [
      { text: "I rarely review them until they become urgent", score: 0 },
      { text: "I remember some of them sporadically", score: 1 },
      { text: "I revisit important long-term commitments regularly", score: 2 },
      { text: "They are part of a stable review system, not memory alone", score: 3 }
    ],
  },
  {
    id: 88,
    question: "How easily can you spot which clients, friends, or collaborators need a context refresh before the next interaction?",
    dimension: "awareness",
    options: [
      { text: "I mostly notice only after an awkward interaction", score: 0 },
      { text: "I remember a few obvious cases", score: 1 },
      { text: "I can usually tell who needs a refresh", score: 2 },
      { text: "I know who needs a refresh and what context matters before I reach out", score: 3 }
    ],
  },
  {
    id: 89,
    question: "If you capture ideas in voice notes or scattered moments, how retrievable are they later?",
    dimension: "memory",
    options: [
      { text: "They disappear into a pile", score: 0 },
      { text: "I can find some, but not reliably", score: 1 },
      { text: "I can usually retrieve the important ones", score: 2 },
      { text: "They are easy to find, connect, and reuse later", score: 3 }
    ],
  },
  {
    id: 90,
    question: "How intentional are you about deciding when to stop following up versus pushing one more time?",
    dimension: "follow_up",
    options: [
      { text: "I mostly guess and avoid the decision", score: 0 },
      { text: "I stop or continue based on mood", score: 1 },
      { text: "I make a decent judgment on important threads", score: 2 },
      { text: "I decide based on signal, stakes, and relationship context", score: 3 }
    ],
  },
  {
    id: 91,
    question: "When your tools or workflow change, how quickly does your capture habit recover?",
    dimension: "consistency",
    options: [
      { text: "It breaks for a long time", score: 0 },
      { text: "It becomes messy until I rebuild from scratch", score: 1 },
      { text: "I adapt after a short dip", score: 2 },
      { text: "The habit survives because the system is principle-driven, not tool-dependent", score: 3 }
    ],
  },
  {
    id: 92,
    question: "How often do you catch the bias or blind spot driving a team discussion before it hardens into a decision?",
    dimension: "awareness",
    options: [
      { text: "Usually only in hindsight", score: 0 },
      { text: "I sense bias but rarely name it clearly", score: 1 },
      { text: "I can often spot the blind spot in time", score: 2 },
      { text: "I regularly detect the hidden bias and reframe the discussion early", score: 3 }
    ],
  },
  {
    id: 93,
    question: "Before asking someone for help, how well can you recall what they currently care about?",
    dimension: "memory",
    options: [
      { text: "I usually ask without much context", score: 0 },
      { text: "I remember a general topic, not specifics", score: 1 },
      { text: "I can usually recall what matters to them", score: 2 },
      { text: "I remember their priorities, constraints, and recent context clearly", score: 3 }
    ],
  },
  {
    id: 94,
    question: "When a thread moves fast across email, chat, and calls, how well do you sync the next steps?",
    dimension: "follow_up",
    options: [
      { text: "It becomes chaotic fast", score: 0 },
      { text: "I keep up partially but lose clarity", score: 1 },
      { text: "I can usually pull the key next steps together", score: 2 },
      { text: "I actively consolidate the thread into a clear shared next-step picture", score: 3 }
    ],
  },
  {
    id: 95,
    question: "How often is the context you capture useful not just to you now, but to your future self or someone else later?",
    dimension: "consistency",
    options: [
      { text: "Almost never", score: 0 },
      { text: "Sometimes, but only if I still remember the backstory", score: 1 },
      { text: "Usually useful for important work", score: 2 },
      { text: "Designed to be reusable, legible, and durable over time", score: 3 }
    ],
  },
  {
    id: 96,
    question: "How well can you anticipate how the same decision will land on different personalities in the room?",
    dimension: "awareness",
    options: [
      { text: "I mostly think about the decision itself, not reactions", score: 0 },
      { text: "I can predict reactions for a few obvious people", score: 1 },
      { text: "I usually anticipate the main reactions across the room", score: 2 },
      { text: "I can forecast how different personalities will interpret and respond to it", score: 3 }
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
