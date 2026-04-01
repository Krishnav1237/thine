# Thine

Thine is a premium, anonymous-first Personal Intelligence Platform built with Next.js App Router. The product currently combines two primary loops:

- `Diagnostic`: a replayable Personal Intelligence assessment that produces a score, report, playbook, streak, XP gain, share flow, and challenge loop.
- `Hot Takes Arena`: a swipeable opinion product that generates a thinking profile, crowd comparisons, a previous-player match, shareable cards, and progression hooks.

The platform is intentionally layered:

- local/session storage keeps the anonymous experience fully functional
- Supabase adds authentication, persistence, leaderboards, durable share pages, and cross-device challenge completion tracking
- PostHog adds product analytics without becoming a runtime dependency for local development

This repository is the current source of truth for the product. The docs in `docs/` have been expanded to serve both as engineering documentation and as handoff material for future contributors or LLMs.

## Platform Status

As of April 1, 2026:

- `npm run lint` passes
- `npm run build` passes
- anonymous-first flows work without Supabase
- Supabase is additive, not required, for core use
- PostHog is optional and no-ops when env vars are missing
- legacy share routes are still supported alongside the durable share system

## Product Surface

### 1. Landing (`/`)
The homepage frames the product, routes users into the Diagnostic or Arena, surfaces daily check-in state, and can display challenge context when a user opens someone else's challenge link.

### 2. Diagnostic (`/quiz`)
A question-based Personal Intelligence assessment with:

- `Quick` mode: 10 questions
- `Deep` mode: 20 questions
- a larger seeded question pool
- optional personalization before the run
- daily rotation so repeat users do not get the exact same set every time

### 3. Intelligence Report (`/results?score=XX`)
A personalized report that combines:

- score and band
- strengths and weakest area
- challenge comparison if the run came from a shared challenge link
- daily check-in and next-step loops
- share link and share-image actions
- a locked full analysis gate
- XP, streak, and rank display
- optional auth prompt and persistence state

### 4. Arena (`/arena`)
A swipeable feed of statements with:

- `Daily` mode: 7 takes
- `Avid` mode: 12 takes
- agree / depends / disagree interactions
- summary profile generation
- real crowd data when Supabase is available
- async comparison to a previous similar player
- share link and share-image actions

### 5. Progression Layer
A persistent progression layer built on top of the product loops:

- XP
- streaks
- rank tiers
- leaderboard
- dashboard

### 6. Persistence + Sharing Layer
The platform supports both:

- anonymous, local-only usage
- authenticated Supabase-backed persistence, durable shares, and public profile surfaces

## Current Architecture At A Glance

### Frontend
- Next.js 16 App Router
- React 19
- TypeScript
- Global CSS in `/Users/HP/thine/app/globals.css`

### Persistence
- `sessionStorage` for in-progress and recent quiz session state
- `localStorage` for anonymous retention, arena history, share unlock state, challenge bookkeeping, and local XP backup
- Supabase for:
  - auth
  - profiles
  - quiz attempts
  - arena attempts
  - shared results
  - challenge completion sync
  - arena crowd responses
  - arena session matchmaking

### Sharing
- client-generated share cards with `html2canvas`
- dynamic OG images with `@vercel/og`
- legacy query-param share pages remain active
- durable `/share/[score]` route handles both numeric legacy redirects and Supabase-backed result IDs

### Analytics
- Vercel Analytics is present globally
- PostHog is optional and initializes only when configured

## Route Map

### Core product routes
- `/` — landing page
- `/quiz` — Personal Intelligence diagnostic
- `/results?score=XX` — intelligence report
- `/arena` — Hot Takes Arena
- `/leaderboard` — public leaderboard
- `/dashboard` — authenticated dashboard

### Share routes
- `/share` — legacy query-param quiz share page
- `/share/[score]` — mixed route for legacy numeric score redirects and durable shared-result pages
- `/arena/share` — legacy query-param arena share page
- `/api/og` — dynamic OG image generation

### Platform routes
- `/error` — global error boundary UI via `app/error.tsx`
- `/not-found` — custom 404 page via `app/not-found.tsx`

## Key Product Invariants

These are intentionally stable and should not be changed casually:

### Diagnostic scoring
- score is normalized to `0–100`
- score bands are:
  - `0–39` Foundation
  - `40–69` Builder
  - `70–89` High Performer
  - `90–100` Elite
- `analyzeUser(answers, score, questionOrder)` must continue returning:
  - `weakestArea`
  - `strengths`
  - `improvementLevel`
  - `improvementPlan`
  - `dimensionScores`

### XP
- quick quiz: `50 + round(score * 0.5)`
- deep quiz: `75 + round(score * 0.75)`
- daily arena: `40`
- avid arena: `60`
- first activity of the day: `+50`
- streak milestone bonuses:
  - `7 days` → `+100`
  - `30 days` → `+500`
  - `100 days` → `+2000`

### Streaks
- same-day activity does not increment streak again
- yesterday increments the streak
- older gap resets the streak to `1`

### Challenge loop
- challenge links still use the existing `/?challenge=true&score=...&name=...&ref=...` format
- local share action must still occur before full analysis unlocks
- challenge completion counting now prefers Supabase when available, but local fallback remains intact

### Anonymous-first behavior
- the quiz, results, arena, and share flows must remain usable without Supabase
- Supabase failures should degrade silently to local behavior wherever possible

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add environment variables
Create `/Users/HP/thine/.env.local` with the values you need.

Required for Supabase-backed auth and persistence:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Optional for server-side admin queries and richer leaderboard queries:
```bash
SUPABASE_SERVICE_ROLE_KEY=
```

Optional for analytics:
```bash
NEXTPUBLICPOSTHOG_KEY=
NEXTPUBLICPOSTHOG_HOST=https://us.i.posthog.com
```

### 3. Run the migration manually in Supabase
The latest platform migration file is:
- `/Users/HP/thine/supabase/migrations/001platformfeatures.sql`

This adds:
- cross-device challenge completions
- arena crowd responses
- arena sessions for async matchmaking
- the supporting indexes, policies, and RPC functions

### 4. Start development
```bash
npm run dev
```

### 5. Verify production build locally
```bash
npm run lint
npm run build
npm start
```

## Documentation Map

### Product + engineering overview
- `/Users/HP/thine/docs/FEATURES.md` — exhaustive product surface and behavior
- `/Users/HP/thine/docs/ARCHITECTURE.md` — route map, component ownership, and system design
- `/Users/HP/thine/docs/DATA_MODEL.md` — local storage keys, Supabase schema, RPCs, and data ownership
- `/Users/HP/thine/docs/SETUP_AND_OPERATIONS.md` — setup, env vars, deployment, and operational runbooks
- `/Users/HP/thine/docs/ANALYTICS.md` — PostHog events, identity behavior, and analytics verification
- `/Users/HP/thine/docs/HANDOFF.md` — full-context prompt-ready handoff for another engineer or LLM

### Growth + creative docs
- `/Users/HP/thine/docs/MARKETING.md` — positioning, channel strategy, messaging, and growth hooks
- `/Users/HP/thine/docs/DEMO_SCRIPT.md` — demo narrative, shot list, and capture plan
- `/Users/HP/thine/docs/EDITING_GUIDE.md` — post-production guide and visual treatment rules

## File Map

### Core routes
- `/Users/HP/thine/app/page.tsx`
- `/Users/HP/thine/app/quiz/page.tsx`
- `/Users/HP/thine/app/results/page.tsx`
- `/Users/HP/thine/app/results/ResultsClient.tsx`
- `/Users/HP/thine/app/arena/page.tsx`
- `/Users/HP/thine/app/leaderboard/page.tsx`
- `/Users/HP/thine/app/dashboard/page.tsx`
- `/Users/HP/thine/app/share/page.tsx`
- `/Users/HP/thine/app/share/[score]/page.tsx`
- `/Users/HP/thine/app/arena/share/page.tsx`
- `/Users/HP/thine/app/api/og/route.tsx`

### Shared UI
- `/Users/HP/thine/app/components/BrandHeader.tsx`
- `/Users/HP/thine/app/components/ChallengeBanner.tsx`
- `/Users/HP/thine/app/components/DailyCheckInCard.tsx`
- `/Users/HP/thine/app/components/DailyPackBadge.tsx`
- `/Users/HP/thine/app/components/PlaybookCard.tsx`
- `/Users/HP/thine/app/components/MatchCard.tsx`
- `/Users/HP/thine/app/components/shared/ShareCard.tsx`
- `/Users/HP/thine/app/components/shared/StreakCounter.tsx`
- `/Users/HP/thine/app/components/shared/RankBadge.tsx`
- `/Users/HP/thine/app/components/shared/XPAnimation.tsx`
- `/Users/HP/thine/app/components/shared/Skeleton.tsx`

### Auth + providers
- `/Users/HP/thine/app/components/PostHogProvider.tsx`
- `/Users/HP/thine/app/components/auth/AuthProvider.tsx`
- `/Users/HP/thine/app/components/auth/AuthModal.tsx`
- `/Users/HP/thine/app/components/auth/AuthPromptCard.tsx`
- `/Users/HP/thine/app/components/auth/EmailCaptureModal.tsx`
- `/Users/HP/thine/app/hooks/useAuth.ts`

### Data + logic
- `/Users/HP/thine/app/data/questions.ts`
- `/Users/HP/thine/app/data/hot-takes.ts`
- `/Users/HP/thine/app/lib/analyzeUser.ts`
- `/Users/HP/thine/app/lib/generatePlaybook.ts`
- `/Users/HP/thine/app/lib/quiz-session.ts`
- `/Users/HP/thine/app/lib/retention.ts`
- `/Users/HP/thine/app/lib/challenge.ts`
- `/Users/HP/thine/app/lib/arena-share.ts`
- `/Users/HP/thine/app/lib/daily-pack.ts`
- `/Users/HP/thine/app/lib/xp.ts`
- `/Users/HP/thine/app/lib/streak.ts`
- `/Users/HP/thine/app/lib/share-card.ts`
- `/Users/HP/thine/app/lib/report-metadata.ts`
- `/Users/HP/thine/app/lib/site.ts`
- `/Users/HP/thine/app/lib/thine-links.ts`

### Supabase layer
- `/Users/HP/thine/app/lib/supabase/client.ts`
- `/Users/HP/thine/app/lib/supabase/server.ts`
- `/Users/HP/thine/app/lib/supabase/types.ts`
- `/Users/HP/thine/app/lib/supabase/sync.ts`
- `/Users/HP/thine/app/lib/supabase/migrate.ts`
- `/Users/HP/thine/supabase/migrations/001platformfeatures.sql`

## Notes For Contributors

- Do not change scoring, XP, streak, or storage-key contracts without deliberately updating the docs and validating downstream impact.
- Treat anonymous flows as first-class. New persistence should be additive, not blocking.
- Legacy share routes are still active and should remain intact until the durable share system fully replaces them.
- For current platform reality, prefer these docs over older assumptions or stale marketing copy.

## License / Ownership

No explicit open-source license is defined in this repository today. Treat the code and product assets as private unless that changes.
