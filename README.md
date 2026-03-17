# Thine Personal Intelligence Diagnostic

A premium, product‑style diagnostic and viral experience that measures how well your current systems preserve recall, commitments, and relationship context — and now includes an interactive **Hot Takes Arena** for fast, addictive opinion play.

## What This App Is

- **Primary experience**: 10‑question Personal Intelligence Diagnostic.
- **Results engine**: Actionable intelligence report, weakest‑area analysis, and a 3‑day improvement playbook.
- **Retention loop**: “Retake in 3 days” framing plus progress comparison bands.
- **Viral loop**: Challenge links, shareable results, and locked analysis (frontend‑only unlock logic).
- **New feature**: **Hot Takes Arena** (`/arena`) — swipeable opinions with a personal stance summary.

## Key Features

### Personal Intelligence Diagnostic
- **Personalized question order** based on user focus (memory, follow‑up, consistency, awareness).
- **Dynamic scoring (0–100)** with tier bands and messaging.
- **Intelligence report** with strengths, weakest dimension, and improvement plan.
- **Progress framing** (frontend‑generated, deterministic score bands).
- **Retake CTA** to drive repeat sessions.

### Viral Challenge Loop (Frontend‑Only)
- **Challenge link generation** via query params.
- **Incoming challenge banner** on landing.
- **Post‑quiz comparison** (win/lose vs challenger).
- **Locked insights** that unlock only after challenge completions (stored in localStorage).

### Hot Takes Arena
- **Swipeable full‑screen cards** with bold statements.
- **Agree / Depends / Disagree** inputs (swipe or tap).
- **Results shown are real**: based on the user’s session responses only (no mock crowd data).
- **Summary profile** at the end with shareable copy.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Global CSS (`app/globals.css`)
- **OG Images**: `@vercel/og` (Node runtime)
- **State**: React hooks + localStorage (no backend)

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

3. Open the app:
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
- `/share` — Share preview
- `/arena` — Hot Takes Arena

## LocalStorage Keys

- `quizSession` — quiz progress + profile (name/role/focus)
- `challenge` — incoming challenge metadata
- `challengeCompletion` — challenge completion counters (frontend only)
- `arenaResponses` — Hot Takes Arena responses

## Notes on Data Integrity

This app is **frontend‑only**. Any “comparison” data is either:
- deterministic and based on the user’s responses, or
- locally stored (same‑device only), or
- explicitly labeled as a simulated framing.

There is no backend, analytics pipeline, or shared crowd dataset.

## Vercel Deployment

This project is optimized for Vercel.

1. Connect the GitHub repository to Vercel.
2. Select the `thine` project.
3. Deploy.

---
Built with a premium UX bar, product‑thinking loops, and a focus on clarity + retention.
