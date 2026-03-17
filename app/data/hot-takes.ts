export type HotTake = {
  id: number;
  text: string;
  stats: {
    agree: number;
    disagree: number;
    depends: number;
  };
};

export const HOT_TAKES: HotTake[] = [
  {
    id: 1,
    text: "Most people who say they are busy are just bad at prioritizing",
    stats: { agree: 68, disagree: 22, depends: 10 },
  },
  {
    id: 2,
    text: "Networking matters more than skills",
    stats: { agree: 54, disagree: 36, depends: 10 },
  },
  {
    id: 3,
    text: "Remote work makes most teams less ambitious",
    stats: { agree: 48, disagree: 38, depends: 14 },
  },
  {
    id: 4,
    text: "College is a 4-year insurance policy, not education",
    stats: { agree: 45, disagree: 40, depends: 15 },
  },
  {
    id: 5,
    text: "Calendars are a better measure of power than titles",
    stats: { agree: 57, disagree: 28, depends: 15 },
  },
  {
    id: 6,
    text: "Most meeting notes are never read",
    stats: { agree: 62, disagree: 25, depends: 13 },
  },
  {
    id: 7,
    text: "Speed is a feature, not a tradeoff",
    stats: { agree: 51, disagree: 33, depends: 16 },
  },
  {
    id: 8,
    text: "If you need a to-do list, your system is broken",
    stats: { agree: 41, disagree: 46, depends: 13 },
  },
  {
    id: 9,
    text: "Being well-liked beats being right",
    stats: { agree: 39, disagree: 49, depends: 12 },
  },
  {
    id: 10,
    text: "Great products are built by opinionated teams, not consensus",
    stats: { agree: 66, disagree: 21, depends: 13 },
  },
  {
    id: 11,
    text: "Culture fit is often code for sameness",
    stats: { agree: 44, disagree: 42, depends: 14 },
  },
  {
    id: 12,
    text: "Most goal-setting is just comfort theater",
    stats: { agree: 37, disagree: 48, depends: 15 },
  },
  {
    id: 13,
    text: "Asking for feedback too early ruins ideas",
    stats: { agree: 34, disagree: 50, depends: 16 },
  },
  {
    id: 14,
    text: "Inbox zero is a distraction, not a virtue",
    stats: { agree: 58, disagree: 29, depends: 13 },
  },
  {
    id: 15,
    text: "Your first draft should be embarrassing",
    stats: { agree: 60, disagree: 22, depends: 18 },
  },
  {
    id: 16,
    text: "The best founders are part therapist",
    stats: { agree: 52, disagree: 31, depends: 17 },
  },
  {
    id: 17,
    text: "Personal brands matter more than resumes",
    stats: { agree: 55, disagree: 30, depends: 15 },
  },
  {
    id: 18,
    text: "If you can't explain it simply, you don't understand it",
    stats: { agree: 71, disagree: 17, depends: 12 },
  },
  {
    id: 19,
    text: "Deep work is more about boundaries than focus",
    stats: { agree: 63, disagree: 24, depends: 13 },
  },
  {
    id: 20,
    text: "AI will make average taste more valuable",
    stats: { agree: 47, disagree: 35, depends: 18 },
  },
];
