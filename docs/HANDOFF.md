# Thine Full Handoff

This document is designed to be pasted into another LLM or shared with a new engineer who needs full context fast.

It summarizes the current product, architecture, routes, storage model, Supabase layer, analytics, and the major things that should not be broken.

## 1. One-Sentence Product Summary

Thine is a Next.js 16 App Router product with two core loops — a Personal Intelligence Diagnostic and a Hot Takes Arena — wrapped in anonymous-first local persistence, optional Supabase auth/sync, progression systems, share systems, and analytics.

## 2. Current Platform Status

As of April 1, 2026:

- `npm run lint` passes
- `npm run build` passes
- anonymous flows are first-class and still work without Supabase
- Supabase is additive, not required, for core use
- PostHog is optional and no-ops if its env vars are missing
- both legacy share and durable share systems exist in parallel

## 3. High-Level Product Loops

### Loop A: Diagnostic
Entry path:
- `/` → `/quiz` → `/results`

What it does:
- user selects `Quick` or `Deep`
- optional personalization before start
- answers seeded questions from a large bank
- gets a `0–100` score and score band
- sees strengths, weakness, next steps, playbook, progression, and share prompts
- can trigger a challenge link for others

### Loop B: Arena
Entry path:
- `/` → `/arena`

What it does:
- user selects `Daily` or `Avid`
- swipes/taps through hot takes
- gets a thinking profile and stance mix summary
- can see crowd data and an async comparison match when Supabase is available
- can share a personalized link/image

### Horizontal systems
These sit across both loops:
- auth
- migration from local to Supabase
- XP, streaks, rank tiers
- leaderboard
- dashboard
- analytics
- share-card generation
- OG image generation

## 4. Route Map

### Main routes
- `/` — landing page
- `/quiz` — diagnostic flow
- `/results?score=XX` — intelligence report
- `/arena` — Hot Takes Arena
- `/leaderboard` — leaderboard
- `/dashboard` — logged-in dashboard

### Share routes
- `/share` — legacy quiz share route
- `/share/[score]` — mixed route for legacy numeric redirect and durable shared-result ID rendering
- `/arena/share` — legacy arena share route
- `/api/og` — dynamic OG image generation

### Global pages
- `/Users/HP/thine/app/error.tsx`
- `/Users/HP/thine/app/not-found.tsx`

## 5. Current Navbar

Primary file:
- `/Users/HP/thine/app/components/BrandHeader.tsx`

Current header behavior:
- shared across the app
- desktop and mobile layouts are consistent
- mobile nav uses a compact menu toggle

Visible navigation:
- `Test`
- `Arena`
- `Leaderboard`
- `Dashboard` when logged in
- `Story`

Anonymous users see:
- `Log In`
- `Sign Up`

Logged-in users see:
- compact streak chip
- account trigger with XP/name context
- dropdown with dashboard, leaderboard, sign out

## 6. Core Files By Responsibility

### Landing
- `/Users/HP/thine/app/page.tsx`
- `/Users/HP/thine/app/LandingCta.tsx`
- `/Users/HP/thine/app/components/ChallengeBanner.tsx`
- `/Users/HP/thine/app/components/DailyCheckInCard.tsx`

### Quiz
- `/Users/HP/thine/app/quiz/page.tsx`
- `/Users/HP/thine/app/data/questions.ts`
- `/Users/HP/thine/app/lib/quiz-session.ts`
- `/Users/HP/thine/app/lib/daily-pack.ts`
- `/Users/HP/thine/app/lib/challenge.ts`
- `/Users/HP/thine/app/lib/analyzeUser.ts`

### Results
- `/Users/HP/thine/app/results/page.tsx`
- `/Users/HP/thine/app/results/ResultsClient.tsx`
- `/Users/HP/thine/app/lib/analyzeUser.ts`
- `/Users/HP/thine/app/lib/generatePlaybook.ts`
- `/Users/HP/thine/app/lib/share-card.ts`
- `/Users/HP/thine/app/lib/supabase/sync.ts`

### Arena
- `/Users/HP/thine/app/arena/page.tsx`
- `/Users/HP/thine/app/data/hot-takes.ts`
- `/Users/HP/thine/app/lib/arena-share.ts`
- `/Users/HP/thine/app/components/MatchCard.tsx`
- `/Users/HP/thine/app/lib/share-card.ts`
- `/Users/HP/thine/app/lib/supabase/sync.ts`

### Auth
- `/Users/HP/thine/app/components/auth/AuthProvider.tsx`
- `/Users/HP/thine/app/components/auth/AuthModal.tsx`
- `/Users/HP/thine/app/components/auth/AuthPromptCard.tsx`
- `/Users/HP/thine/app/components/auth/EmailCaptureModal.tsx`
- `/Users/HP/thine/app/hooks/useAuth.ts`

### Progression
- `/Users/HP/thine/app/lib/xp.ts`
- `/Users/HP/thine/app/lib/streak.ts`
- `/Users/HP/thine/app/components/shared/XPAnimation.tsx`
- `/Users/HP/thine/app/components/shared/StreakCounter.tsx`
- `/Users/HP/thine/app/components/shared/RankBadge.tsx`

### Supabase
- `/Users/HP/thine/app/lib/supabase/client.ts`
- `/Users/HP/thine/app/lib/supabase/server.ts`
- `/Users/HP/thine/app/lib/supabase/types.ts`
- `/Users/HP/thine/app/lib/supabase/sync.ts`
- `/Users/HP/thine/app/lib/supabase/migrate.ts`
- `/Users/HP/thine/supabase/migrations/001platformfeatures.sql`

### Sharing
- `/Users/HP/thine/app/components/shared/ShareCard.tsx`
- `/Users/HP/thine/app/lib/share-card.ts`
- `/Users/HP/thine/app/share/page.tsx`
- `/Users/HP/thine/app/share/ShareCardView.tsx`
- `/Users/HP/thine/app/share/[score]/page.tsx`
- `/Users/HP/thine/app/arena/share/page.tsx`
- `/Users/HP/thine/app/arena/share/ArenaShareCardView.tsx`
- `/Users/HP/thine/app/api/og/route.tsx`

### Analytics
- `/Users/HP/thine/app/components/PostHogProvider.tsx`
- `/Users/HP/thine/app/layout.tsx`

## 7. Quiz Product Logic

### Session modes
- `quick` = 10 questions
- `deep` = 20 questions

### Question bank
- current pool size: `96`
- dimensions:
  - `memory`
  - `follow_up`
  - `consistency`
  - `awareness`

### Personalization inputs
- first name
- role/domain
- focus area

### Score rules
The score contract must remain:
- normalized to `0–100`
- bands:
  - `0–39` Foundation
  - `40–69` Builder
  - `70–89` High Performer
  - `90–100` Elite

### Analysis contract
`analyzeUser(answers, score, questionOrder)` returns:
- `weakestArea`
- `strengths`
- `improvementLevel`
- `improvementPlan`
- `dimensionScores`

### Results gating
Full analysis currently unlocks only when:
- share has been triggered locally
- and challenge completion count for the current ref is at least `3`

The share-trigger requirement is still local.
The completion count is now remote-aware when Supabase is available.

## 8. Arena Product Logic

### Session modes
- `daily` = 7 takes
- `avid` = 12 takes

### Content pool
- current pool size: `83`
- each take has a stable numeric `id`

### Interaction model
- swipe right = agree
- swipe left = disagree
- tap buttons for agree/depends/disagree

### Summary logic
Arena summary currently computes:
- counts
- normalized percentages
- dominant stance
- thinking profile

### Thinking profiles
Current profile buckets:
- `Contrarian Thinker`
- `Conformist Thinker`
- `Nuanced Thinker`
- `Balanced Thinker`

### Crowd stats
Arena now attempts to show real crowd stats from Supabase:
- if crowd data exists and response count is at least `10`, percentages are shown
- if response count is below `10`, UI says `Not enough data yet`
- if Supabase is unavailable, crowd stats disappear and the local summary still works

### Async match
After completion:
- the session is saved to `arena_sessions`
- the app calls `findarenamatch(...)`
- if a previous session match exists, a comparison card is shown
- otherwise the main summary still works without error

## 9. Auth Model

### Principle
Auth must never block the main product loops.

### Current auth UI
- modal-based auth
- no full-page redirect required for the main prompt flow
- Google OAuth + email/password
- email capture fallback on modal dismissal

### Auth effects
After successful auth:
- ensure profile row exists
- migrate local state once
- refresh profile in context
- identify user in PostHog if analytics is configured

## 10. Anonymous-First Persistence

### sessionStorage
- `thine-quiz-session`

### localStorage
- `thine-challenge`
- `thine-challenge-ref`
- `thine-challenge-completions`
- `thine-challenge-completed-refs`
- `arenaResponses`
- `arenaSessionMode`
- `arenaProfile`
- `thine-retention`
- `thine-share-unlocked`
- `thine-user-seed`
- `thine-player-stats`
- `thine-xp-daily-bonus`
- `thine-email-captured`
- `thine-migrated`
- `thine-migrated-user`
- `thine-sync-dedupe`

### Important rule
Do not rename these keys casually. They are part of the product contract now.

## 11. Supabase Data Model

### Tables
- `profiles`
- `quiz_attempts`
- `arena_attempts`
- `email_captures`
- `shared_results`
- `challenge_completions`
- `arena_responses`
- `arena_sessions`

### RPCs
- `countchallengecompletions(ref_code text)`
- `getarenacrowdstats(takeids text[])`
- `findarenamatch(exclude_session, match_mode, match_stance)`

### Migration file
- `/Users/HP/thine/supabase/migrations/001platformfeatures.sql`

## 12. Dual-Write And Migration Behavior

### Sync layer
Primary file:
- `/Users/HP/thine/app/lib/supabase/sync.ts`

Behavior:
- local state is always preserved
- Supabase writes are additive
- dedupe keys prevent repeated writes

### Migration layer
Primary file:
- `/Users/HP/thine/app/lib/supabase/migrate.ts`

Behavior:
- when a user logs in or signs up, local quiz/arena/retention data can be migrated to Supabase
- local data is not deleted afterward

## 13. Progression Rules

### XP
These formulas should be treated as stable:
- quick quiz: `50 + round(score * 0.5)`
- deep quiz: `75 + round(score * 0.75)`
- daily arena: `40`
- avid arena: `60`
- first daily activity: `+50`
- streak bonuses:
  - `7 days` → `+100`
  - `30 days` → `+500`
  - `100 days` → `+2000`

### Rank tiers
- Bronze → `0–999`
- Silver → `1000–4999`
- Gold → `5000–14999`
- Platinum → `15000–49999`
- Diamond → `50000+`

### Streak rule
- same day = no increment
- yesterday = increment
- older gap = reset to `1`

## 14. Share System

### Legacy share
Still active:
- `/share`
- `/arena/share`

These are query-param based and should not be removed casually.

### Durable share
Current durable route:
- `/share/[score]`

Important note:
- despite the folder name, it handles both numeric slugs and durable Supabase shared-result IDs

### Image share
Implemented through:
- hidden share card DOM
- `html2canvas`
- `navigator.share()` when possible
- clipboard + image download fallback otherwise

### OG previews
Implemented through:
- `/Users/HP/thine/app/api/og/route.tsx`

## 15. Analytics

### Provider
- `/Users/HP/thine/app/components/PostHogProvider.tsx`

### Env vars
- `NEXTPUBLICPOSTHOG_KEY`
- `NEXTPUBLICPOSTHOG_HOST`

### Current events
- `quiz_started`
- `quiz_completed`
- `arena_started`
- `arena_completed`
- `share_clicked`
- `auth_prompted`
- `auth_completed`
- `email_captured`
- `authpromptshown`

### Identity
- login → `identify`
- logout → `reset`

## 16. Known Degradation Paths

The app is intentionally designed so these failures do not kill the core experience:

- Supabase missing
- PostHog missing
- service role key missing
- no crowd stats yet
- no arena match found
- no durable share save available

When those conditions happen, the app should fall back to local-only behavior rather than throw the user out of the flow.

## 17. Current Docs Worth Reading Next

- `/Users/HP/thine/README.md`
- `/Users/HP/thine/docs/FEATURES.md`
- `/Users/HP/thine/docs/ARCHITECTURE.md`
- `/Users/HP/thine/docs/DATA_MODEL.md`
- `/Users/HP/thine/docs/SETUP_AND_OPERATIONS.md`
- `/Users/HP/thine/docs/ANALYTICS.md`

## 18. Things A Future Contributor Or LLM Should Not Change Accidentally

- quiz scoring math
- score band thresholds
- `analyzeUser()` output contract
- XP formulas
- streak formulas
- local storage key names
- challenge link format
- legacy share fallback behavior
- anonymous-first product posture

## 19. Prompt Seed For Another LLM

You can paste this sentence before the rest of the handoff:

> This is a Next.js 16 App Router project called Thine. It already has a working landing page, diagnostic quiz, results report, Hot Takes Arena, anonymous-first local persistence, optional Supabase auth and syncing, XP/streak/rank systems, leaderboard, dashboard, share links, image sharing, OG generation, PostHog analytics, Supabase-backed challenge completions, Arena crowd stats, and async Arena matchmaking. Please reason from the current architecture and file map exactly as described below.
