# Thine: Feature Deep‑Dive

A focused overview of the systems that drive engagement, retention, sharing, and now persistence.

## 1) Personal Intelligence Diagnostic (`/quiz`)
**The Hook**: A fast diagnostic that turns memory, follow‑through, and context retention into a score people want to compare.

### Mechanics
- **Dual sessions**: Quick (10) or Deep (20).
- **Daily rotation** from a larger question bank.
- **Personalized ordering** based on user focus.
- **Report + playbook**: strengths, weakest area, and a 3‑day plan.
- **Full analysis gate**: unlocks only after share + 3 friend completions.

---

## 2) Hot Takes Arena (`/arena`)
**The Hook**: Fast, swipeable opinions that reveal a personal stance profile people want to share.

### Mechanics
- **Swipe + tap** inputs for Agree / Depends / Disagree.
- **Session presets**: Daily (7 takes) and Avid (12 takes).
- **Daily packs**: seeded rotation so sessions feel fresh.
- **Session‑based results**: summary is based only on the user’s responses.
- **Share card generation**: link copy + image share.

---

## 3) Auth + Anonymous‑First Persistence
**The Hook**: Never block the experience, but reward people who create an account.

### Mechanics
- **Supabase auth modal** instead of redirect.
- **Google + email/password** flows.
- **Local migration** from sessionStorage/localStorage into Supabase.
- **Email capture fallback** when auth is dismissed.
- **Dual‑write pattern**: local state always survives even if Supabase fails.

---

## 4) XP + Streaks + Rank
**The Hook**: Every meaningful action pushes progress forward.

### Mechanics
- **XP awards** for quiz and arena completions.
- **First activity of the day bonus**.
- **Streak milestone bonuses**.
- **Rank tiers** from Bronze to Diamond.
- **Compact streak/rank UI** in the report, arena summary, and navbar.

---

## 5) Leaderboard + Sharing
**The Hook**: Turn solo outcomes into social proof.

### Mechanics
- **Leaderboard** at `/leaderboard`.
- **Public shared result pages** at `/share/[id]` for logged‑in users.
- **Legacy query‑param share pages** still work for anonymous users.
- **Dynamic OG images** via `/api/og`.
- **Client share card generation** via `html2canvas`.

---

## Platform Notes
- **Next.js 16 (App Router)**.
- **Frontend‑first** state with sessionStorage/localStorage and Supabase layered on top.
- **OG previews** rendered with `@vercel/og` (Node runtime).
