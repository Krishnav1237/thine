# Thine Personal Intelligence Platform

Thine is a premium, dark‑themed personal intelligence product built on Next.js App Router. It combines a replayable diagnostic, a swipeable opinion arena, viral challenge/share loops, and an anonymous‑first Supabase layer for persistence, streaks, XP, and leaderboard visibility.

## Current Product Surface

- **Landing**: premium entry page with clear paths into the diagnostic or Arena.
- **Diagnostic**: Quick 10 / Deep 20 question session with seeded daily rotation.
- **Results**: a personalized intelligence report, shareable scorecard, 3‑day improvement plan, challenge loop, and locked full analysis.
- **Arena**: Hot Takes Arena with Daily 7 / Avid 12 takes, swipe interactions, and a thinking profile summary.
- **Persistence layer**: Supabase auth + profiles + attempts + public shared results.
- **Progression**: XP, streaks, rank tiers, and leaderboard support.

## Feature Breakdown

### Diagnostic
- Dual session modes: **Quick (10)** and **Deep (20)**.
- Daily‑seeded question rotation from a larger bank.
- Personalization layer: optional name, role, and focus dimension.
- Deterministic score logic: `0–100`, normalized, with score bands:
  - `0–39` Foundation
  - `40–69` Builder
  - `70–89` High Performer
  - `90–100` Elite
- `analyzeUser(answers, score, questionOrder)` returns:
  - weakest area
  - top strengths
  - dimension score breakdown
  - improvement level
  - improvement plan

### Results / Intelligence Report
- Unified report + share section.
- Strengths + weakest dimension.
- Daily check‑in card.
- 3‑day improvement plan.
- Challenge flow:
  - share challenge link
  - friend completions tracked locally
  - **full analysis only unlocks after sharing + 3 completions**
- Share options:
  - copy link
  - generate/share image card with `html2canvas`
  - preview share page

### Hot Takes Arena
- Swipe right = agree, swipe left = disagree, tap for all three.
- Session presets:
  - `daily` = 7 takes
  - `avid` = 12 takes
- Real stance mix is computed entirely from the session’s own responses.
- Summary creates a thinking profile:
  - Conformist
  - Contrarian
  - Nuanced
  - Balanced
- Share options:
  - copy profile link
  - generate/share image card
  - public share page

### Auth + Persistence
- Supabase auth is **anonymous‑first**:
  - anonymous users keep the full experience
  - logged‑in users get sync, leaderboard placement, and durable share links
- Auth surface:
  - overlay modal, not a redirect
  - sign up / log in tabs
  - Google OAuth + email/password
  - email capture fallback when auth is dismissed
- Migration:
  - reads local quiz session
  - reads local arena responses
  - reads local streak state
  - writes Supabase profile + attempts
  - leaves local data intact as fallback

### XP, Streaks, Ranks
- XP rules:
  - Quick quiz: `50 + round(score * 0.5)`
  - Deep quiz: `75 + round(score * 0.75)`
  - Daily arena: `40`
  - Avid arena: `60`
  - First activity of the day: `+50`
  - Milestones: `7d +100`, `30d +500`, `100d +2000`
- Rank tiers:
  - Bronze `0–999`
  - Silver `1000–4999`
  - Gold `5000–14999`
  - Platinum `15000–49999`
  - Diamond `50000+`
- Leaderboard:
  - `/leaderboard`
  - Today / This Week / All Time tabs
  - anonymous users can browse
  - logged‑in users can be highlighted

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Global CSS (`app/globals.css`)
- **Auth / DB**: Supabase
- **Client capture**: `html2canvas`
- **OG Images**: `@vercel/og` (Node runtime)
- **State**: React hooks + localStorage/sessionStorage + Supabase

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open the app:
   ```
   http://localhost:3000
   ```

## Build for Production

```bash
npm run build
npm start
```

## Routes

- `/` — Landing
- `/quiz` — Diagnostic quiz
- `/results?score=XX` — Intelligence report
- `/leaderboard` — Public leaderboard
- `/dashboard` — Stub route, redirects to leaderboard
- `/share` — Legacy query‑param share preview
- `/share/[id]` — Durable shared result page for logged‑in users
- `/arena` — Hot Takes Arena
- `/arena/share` — Arena share card
- `/api/og` — Dynamic OG image generator

## Storage Keys

### sessionStorage
- `thine-quiz-session` — quiz progress + profile + question order.

### localStorage
- `thine-challenge` — incoming challenge metadata.
- `thine-challenge-ref` — per‑user challenge ref id.
- `thine-challenge-completions` — challenge completion counters.
- `thine-challenge-completed-refs` — refs already counted.
- `arenaResponses` — Hot Takes Arena responses.
- `arenaSessionMode` — last Arena session mode.
- `arenaProfile` — arena name/role.
- `thine-retention` — streak + daily activity stats.
- `thine-share-unlocked` — share gate flag (used for full analysis unlock).
- `thine-user-seed` — daily pack seed per user.
- `thine-player-stats` — local XP/rank/streak backup.
- `thine-xp-daily-bonus` — daily XP bonus tracking.
- `thine-email-captured` — email fallback suppression.
- `thine-migrated` / `thine-migrated-user` — Supabase migration state.
- `thine-sync-dedupe` — prevents duplicate attempt writes.

## Data Integrity Notes

- **Quiz score logic is unchanged** and remains deterministic.
- **Arena stance data is session‑only**, not crowd data.
- **Challenge comparison + unlock counts remain local** by design.
- Supabase layers on persistence for:
  - profiles
  - attempts
  - leaderboard reads
  - durable shared result links
- If Supabase fails, the app falls back silently to local storage behavior.

## Vercel Deployment

This project is optimized for Vercel.

1. Connect the GitHub repository to Vercel.
2. Select the `thine` project.
3. Deploy.

---
Built with a premium UX bar, clean loops, and a focus on clarity + retention.
