# Thine Setup And Operations

This document covers how to run, configure, deploy, and verify Thine in a practical way.

It is intended for engineers, technical operators, and future contributors who need to move quickly without reverse-engineering the repository first.

## 1. Prerequisites

You should have:
- Node.js 20+
- npm
- a Supabase project if you want auth, persistence, leaderboard, crowd stats, and matchmaking
- a PostHog project if you want analytics

## 2. Install And Run Locally

From the repository root:

```bash
npm install
npm run dev
```

Default local URL:
- `http://localhost:3000`

Verification commands:

```bash
npm run lint
npm run build
npm start
```

## 3. Environment Variables

Create:
- `/Users/HP/thine/.env.local`

### Required for Supabase-backed auth and persistence
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Optional for server-side admin reads
Used for richer leaderboard queries and any server-admin data access.

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

The code also still tolerates `SUPABASE_SERVICE_ROLE` as a server-side alias in `/Users/HP/thine/app/lib/supabase/server.ts`, but new setups should prefer `SUPABASE_SERVICE_ROLE_KEY`.

### Optional for PostHog analytics
```bash
NEXTPUBLICPOSTHOG_KEY=
NEXTPUBLICPOSTHOG_HOST=https://us.i.posthog.com
```

Important note:
- these PostHog env names are intentionally non-standard in this codebase
- `app/layout.tsx` reads them on the server and passes them into `PostHogProvider`
- if the key is missing, PostHog is a no-op

## 4. Supabase Setup

### Core tables expected by the app
- `profiles`
- `quiz_attempts`
- `arena_attempts`
- `email_captures`
- `shared_results`
- `challenge_completions`
- `arena_responses`
- `arena_sessions`

### Core RPC functions expected by the app
- `countchallengecompletions(ref_code text)`
- `getarenacrowdstats(takeids text[])`
- `findarenamatch(exclude_session, match_mode, match_stance)`

### Migration file
The current migration file you should run manually in Supabase SQL Editor is:
- `/Users/HP/thine/supabase/migrations/001platformfeatures.sql`

What it adds:
- challenge completions table + count RPC
- arena responses table + crowd-stats RPC
- arena sessions table + async match RPC
- indexes and policies for those new systems

### Important operating rule
Do not assume the migration file creates the full original schema for `profiles`, `quiz_attempts`, `arena_attempts`, `email_captures`, and `shared_results`. Those foundational tables must already exist in the target Supabase project.

## 5. Anonymous-Only Local Development

Thine is intentionally able to run without Supabase.

If you do not set Supabase env vars:
- quiz still works
- results still work
- arena still works
- local share flow still works
- local streak/XP backup still works
- dashboard and leaderboard degrade gracefully
- auth modal will not complete real auth, but the rest of the product remains usable

This is the fastest way to work on pure UI or client-side experience changes.

## 6. PostHog Setup

### How it initializes
PostHog is wrapped through:
- `/Users/HP/thine/app/components/PostHogProvider.tsx`

Initialization rules:
- no key → do nothing
- key present → initialize once
- login → identify
- logout → reset

### Current event coverage
PostHog currently tracks:
- quiz start
- quiz completion
- arena start
- arena completion
- share actions
- auth modal opens
- auth completions
- auth prompt impressions
- email capture submissions

See `/Users/HP/thine/docs/ANALYTICS.md` for exact event names and properties.

## 7. Running Through Key Flows Locally

### Quiz smoke check
1. open `/`
2. click into the quiz
3. try both `Quick` and `Deep`
4. complete the run
5. verify results page renders
6. verify share actions still work
7. verify no console errors

### Arena smoke check
1. open `/arena`
2. try both `Daily` and `Avid`
3. interact with both swipe and tap inputs
4. verify summary renders
5. verify share actions still work
6. verify crowd and match sections degrade gracefully if Supabase is absent

### Auth smoke check
With Supabase configured:
1. open `Log In` or `Sign Up` from the header
2. test email/password path
3. test Google path if configured in Supabase
4. confirm profile state updates in header/dashboard
5. confirm anonymous data migrates after auth

### Share smoke check
1. generate a quiz result
2. click `Share result`
3. confirm copy/toast feedback
4. click share-as-image if available on device/browser
5. verify public share route renders
6. repeat on Arena summary

## 8. Deployment Notes

### Vercel
The app is well-suited to Vercel because it already uses:
- App Router
- route-level loading states
- server-rendered pages
- `@vercel/og`
- Vercel Analytics

Typical deployment flow:
1. connect the repository in Vercel
2. add env vars
3. deploy
4. run Supabase SQL migration manually if the database is not yet aligned

### Metadata and OG
Global metadata is configured in:
- `/Users/HP/thine/app/layout.tsx`

OG generation is handled by:
- `/Users/HP/thine/app/api/og/route.tsx`

## 9. Operational Verification Checklist

Run this list after meaningful product or persistence changes.

### Baseline
- `npm run lint`
- `npm run build`

### Anonymous path
- quiz works without Supabase
- results page renders without Supabase
- arena works without Supabase
- legacy share pages still render
- localStorage/sessionStorage key names remain unchanged

### Supabase path
- auth modal can sign in/up
- profile row exists after auth
- quiz attempts save
- arena attempts save
- dashboard loads real data
- leaderboard loads profiles
- challenge completions count across devices when configured
- arena crowd stats appear when enough data exists
- arena match card appears when historical sessions exist

### Analytics path
- no PostHog env vars → no runtime crash
- PostHog env vars present → events emit
- login identifies user
- logout resets analytics identity

## 10. Common Failure Modes

### Supabase missing or misconfigured
Symptoms:
- auth cannot complete
- leaderboard may show empty or fallback state
- dashboard shows empty state
- crowd stats and match cards do not appear

Expected behavior:
- the app should still function locally for anonymous users

### Service role key missing
Symptoms:
- leaderboard `Today` and `This Week` may fall back to all-time ranking behavior

Expected behavior:
- `All Time` should still work through public profile reads

### PostHog key missing
Symptoms:
- no analytics events in PostHog

Expected behavior:
- zero runtime breakage

### Migrations not run
Symptoms:
- cross-device challenge counts do not work
- arena crowd stats do not work
- arena matchmaking does not work

Expected behavior:
- core local flows still work

## 11. Files To Check During Ops Or Debugging

### Setup and env wiring
- `/Users/HP/thine/app/layout.tsx`
- `/Users/HP/thine/app/lib/site.ts`
- `/Users/HP/thine/app/lib/supabase/client.ts`
- `/Users/HP/thine/app/lib/supabase/server.ts`

### Sync and persistence
- `/Users/HP/thine/app/lib/supabase/sync.ts`
- `/Users/HP/thine/app/lib/supabase/migrate.ts`
- `/Users/HP/thine/app/lib/challenge.ts`
- `/Users/HP/thine/app/arena/page.tsx`

### Sharing
- `/Users/HP/thine/app/lib/share-card.ts`
- `/Users/HP/thine/app/components/shared/ShareCard.tsx`
- `/Users/HP/thine/app/share/[score]/page.tsx`
- `/Users/HP/thine/app/api/og/route.tsx`

### Analytics
- `/Users/HP/thine/app/components/PostHogProvider.tsx`
- `/Users/HP/thine/app/quiz/page.tsx`
- `/Users/HP/thine/app/arena/page.tsx`
- `/Users/HP/thine/app/results/ResultsClient.tsx`
- `/Users/HP/thine/app/components/auth/AuthModal.tsx`

## 12. If You Need A Safe Operating Principle

When in doubt:
- preserve the anonymous path
- preserve the local fallback path
- prefer additive remote enhancements over replacing local behavior
- run lint and build before assuming a doc change is the only thing that happened
