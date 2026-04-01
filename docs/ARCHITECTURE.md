# Thine Architecture

This document explains how the current Thine codebase is organized, where each system lives, and how data flows through the platform.

It is written as a practical engineering map, not a theoretical design note.

## 1. Architecture Summary

Thine is a Next.js 16 App Router application with a layered runtime model:

- `presentation layer`: route components and shared UI in `app/`
- `product logic layer`: scoring, seeded content rotation, challenge logic, streak logic, share generation, analytics helpers
- `anonymous persistence layer`: `sessionStorage` + `localStorage`
- `account persistence layer`: Supabase auth, tables, and RPCs
- `distribution layer`: share routes, image capture, and OG generation

The architecture is intentionally biased toward graceful degradation:

- the local anonymous path is always the baseline
- Supabase enhances persistence and social features
- PostHog enhances visibility
- missing external configuration should not collapse the product

## 2. Directory Map

### App routes and route-level UI
- `/Users/HP/thine/app/layout.tsx`
- `/Users/HP/thine/app/page.tsx`
- `/Users/HP/thine/app/quiz/page.tsx`
- `/Users/HP/thine/app/results/page.tsx`
- `/Users/HP/thine/app/results/layout.tsx`
- `/Users/HP/thine/app/results/ResultsClient.tsx`
- `/Users/HP/thine/app/arena/page.tsx`
- `/Users/HP/thine/app/leaderboard/page.tsx`
- `/Users/HP/thine/app/dashboard/page.tsx`
- `/Users/HP/thine/app/share/page.tsx`
- `/Users/HP/thine/app/share/[score]/page.tsx`
- `/Users/HP/thine/app/arena/share/page.tsx`
- `/Users/HP/thine/app/api/og/route.tsx`
- `/Users/HP/thine/app/error.tsx`
- `/Users/HP/thine/app/not-found.tsx`

### Shared UI components
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

### Data and logic modules
- `/Users/HP/thine/app/data/questions.ts`
- `/Users/HP/thine/app/data/hot-takes.ts`
- `/Users/HP/thine/app/lib/analyzeUser.ts`
- `/Users/HP/thine/app/lib/arena-share.ts`
- `/Users/HP/thine/app/lib/challenge.ts`
- `/Users/HP/thine/app/lib/daily-pack.ts`
- `/Users/HP/thine/app/lib/generatePlaybook.ts`
- `/Users/HP/thine/app/lib/quiz-session.ts`
- `/Users/HP/thine/app/lib/retention.ts`
- `/Users/HP/thine/app/lib/share-card.ts`
- `/Users/HP/thine/app/lib/streak.ts`
- `/Users/HP/thine/app/lib/xp.ts`
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

## 3. Route Ownership

### `/`
Primary ownership:
- landing page composition
- challenge landing state
- high-level conversion framing

Key files:
- `/Users/HP/thine/app/page.tsx`
- `/Users/HP/thine/app/LandingCta.tsx`
- `/Users/HP/thine/app/components/ChallengeBanner.tsx`
- `/Users/HP/thine/app/components/DailyCheckInCard.tsx`

### `/quiz`
Primary ownership:
- quiz personalization
- seeded question selection
- question progression
- answer capture
- challenge completion registration
- transition to results
- quiz analytics events

Key files:
- `/Users/HP/thine/app/quiz/page.tsx`
- `/Users/HP/thine/app/data/questions.ts`
- `/Users/HP/thine/app/lib/quiz-session.ts`
- `/Users/HP/thine/app/lib/daily-pack.ts`
- `/Users/HP/thine/app/lib/challenge.ts`

### `/results`
Primary ownership:
- score interpretation
- challenge comparison
- report rendering
- share actions
- XP/streak/rank feedback
- auth prompt
- full-analysis gating
- quiz attempt syncing

Key files:
- `/Users/HP/thine/app/results/page.tsx`
- `/Users/HP/thine/app/results/ResultsClient.tsx`
- `/Users/HP/thine/app/lib/analyzeUser.ts`
- `/Users/HP/thine/app/lib/generatePlaybook.ts`
- `/Users/HP/thine/app/lib/challenge.ts`
- `/Users/HP/thine/app/lib/share-card.ts`
- `/Users/HP/thine/app/lib/supabase/sync.ts`

### `/arena`
Primary ownership:
- take deck generation
- swipe/tap interaction model
- response capture
- crowd-response inserts
- summary generation
- async matchmaking
- arena sharing
- arena attempt syncing

Key files:
- `/Users/HP/thine/app/arena/page.tsx`
- `/Users/HP/thine/app/data/hot-takes.ts`
- `/Users/HP/thine/app/lib/arena-share.ts`
- `/Users/HP/thine/app/lib/share-card.ts`
- `/Users/HP/thine/app/lib/supabase/sync.ts`
- `/Users/HP/thine/app/components/MatchCard.tsx`

### `/leaderboard`
Primary ownership:
- server-side profile ranking
- timeboxed XP views
- current-user highlighting
- anonymous-access leaderboard browsing

Key files:
- `/Users/HP/thine/app/leaderboard/page.tsx`
- `/Users/HP/thine/app/leaderboard/loading.tsx`
- `/Users/HP/thine/app/lib/supabase/server.ts`

### `/dashboard`
Primary ownership:
- logged-in account summary
- recent quiz history
- recent arena history
- quick actions back into product loops

Key files:
- `/Users/HP/thine/app/dashboard/page.tsx`
- `/Users/HP/thine/app/dashboard/loading.tsx`
- `/Users/HP/thine/app/lib/supabase/server.ts`

### Share routes
Legacy routes:
- `/Users/HP/thine/app/share/page.tsx`
- `/Users/HP/thine/app/share/ShareCardView.tsx`
- `/Users/HP/thine/app/arena/share/page.tsx`
- `/Users/HP/thine/app/arena/share/ArenaShareCardView.tsx`

Durable mixed route:
- `/Users/HP/thine/app/share/[score]/page.tsx`

OG route:
- `/Users/HP/thine/app/api/og/route.tsx`

## 4. Provider Tree

### Root layout
`/Users/HP/thine/app/layout.tsx` currently wires together:

- metadata
- site URL wiring
- `AuthProvider`
- `PostHogProvider`
- Vercel Analytics

### Important note
PostHog is passed env values from the server layout into the client provider because the configured environment variable names are:
- `NEXTPUBLICPOSTHOG_KEY`
- `NEXTPUBLICPOSTHOG_HOST`

Those are intentionally not read directly from client code as `NEXT_PUBLIC_*` values.

## 5. Anonymous-First State Model

### Why this matters
The product was deliberately built so that users can complete meaningful flows before ever signing in.

### Client-side storage responsibilities
- `sessionStorage` stores the current or most recent quiz session
- `localStorage` stores anonymous product history, progression backup, challenge state, and suppression flags

### Design rule
If Supabase is down or not configured:
- quiz must still run
- results must still render
- arena must still run
- streaks/XP must still appear from local backup
- share links must still work via legacy routes or copy-link fallbacks

## 6. Supabase Architecture

### Browser client
File:
- `/Users/HP/thine/app/lib/supabase/client.ts`

Purpose:
- create browser-side Supabase client only when env vars exist
- prevent client-side failures in unconfigured environments

### Server client
File:
- `/Users/HP/thine/app/lib/supabase/server.ts`

Purpose:
- server component auth reads
- route-level database reads
- admin-client access for timeboxed leaderboard queries

### Types
File:
- `/Users/HP/thine/app/lib/supabase/types.ts`

Purpose:
- typed table shapes
- typed inserts/updates
- typed RPC return signatures

### Sync logic
File:
- `/Users/HP/thine/app/lib/supabase/sync.ts`

Purpose:
- dual-write helper layer
- local player stats backup
- profile ensuring
- attempt persistence
- shared-result persistence

### Migration layer
File:
- `/Users/HP/thine/app/lib/supabase/migrate.ts`

Purpose:
- move meaningful anonymous local data into Supabase after auth
- preserve local data as fallback rather than deleting it

## 7. Data Flow By Experience

### Quiz run → results
1. user configures quiz mode and optional personalization
2. seeded questions are selected from the question bank
3. answers are stored into `thine-quiz-session`
4. score is computed client-side
5. challenge completion is registered locally
6. cross-device challenge completion insert is attempted remotely
7. route transitions to `/results?score=...`
8. results page reads session first, query param second
9. results page saves attempt through dual-write sync
10. report renders, share paths become available

### Arena run → summary
1. user selects `Daily` or `Avid`
2. seeded take deck is selected from `HOT_TAKES`
3. a per-run `session_id` is created
4. each response is saved locally
5. each response is inserted remotely to `arena_responses` if possible
6. final summary computes counts, percentages, and profile locally
7. arena attempt is dual-written when appropriate
8. crowd stats are fetched for the seen take IDs
9. completed session is inserted into `arena_sessions`
10. match lookup runs against previous sessions
11. summary renders crowd + match UI when available

### Auth flow
1. user opens `AuthModal`
2. auth event is tracked
3. sign-in/up succeeds or fails inside the modal
4. `AuthProvider` receives auth state change
5. profile row is ensured
6. migration runs once for that user
7. profile state refreshes
8. PostHog identify runs if analytics is configured

## 8. Share Architecture

### Link layers
There are two share generations living side by side:

- `legacy query-param routes` for anonymous-compatible fallback sharing
- `durable Supabase-backed route` for persistent public result pages

### Image sharing
The client-side image sharing path is:

1. render hidden share-card DOM
2. wait for fonts to load
3. capture with `html2canvas`
4. try `navigator.share()` with file + URL
5. if unsupported:
   - copy link to clipboard
   - download the image
   - show toast feedback

### Server-side OG
For shared URLs, `/api/og` can generate social preview images without relying on client rendering.

## 9. Analytics Architecture

### Provider and helper
Files:
- `/Users/HP/thine/app/components/PostHogProvider.tsx`
- imported helper `capturePostHogEvent(...)`

### Behavior
- no key → analytics disabled
- key present → PostHog initializes once
- login → identify user
- logout → reset analytics identity

### Current tracked surfaces
- quiz lifecycle
- arena lifecycle
- share actions
- auth opens/completions
- auth prompt impressions
- email capture submissions

## 10. Styling Architecture

### Global CSS
Most styling lives in:
- `/Users/HP/thine/app/globals.css`

The styling system currently owns:
- shell layout
- card system
- typography rhythm
- button system
- toasts
- responsive navigation
- report layout
- arena layout
- leaderboard/dashboard layout

### Component-level inline styling
Share card capture surfaces rely partially on inline styles or tightly scoped markup because capture fidelity matters more than reusable abstraction in those cases.

## 11. Error and Loading Architecture

### Error boundaries
- `/Users/HP/thine/app/error.tsx`
- `/Users/HP/thine/app/not-found.tsx`

### Skeleton loading
- `/Users/HP/thine/app/components/shared/Skeleton.tsx`
- route-level loading files for leaderboard, dashboard, and durable share page

These improve perceived quality for slower Supabase-backed reads while keeping the app visually consistent.

## 12. High-Risk Areas For Future Work

These parts of the architecture deserve extra care because they bridge multiple systems.

### Results page
`/Users/HP/thine/app/results/ResultsClient.tsx`

Why it is sensitive:
- joins quiz session state, share logic, auth state, challenge state, XP, streaks, persistence, and gated analysis in one surface

### Arena page
`/Users/HP/thine/app/arena/page.tsx`

Why it is sensitive:
- owns gestures, timing, summary generation, crowd writes, crowd reads, matchmaking, sharing, and sync

### Supabase sync layer
`/Users/HP/thine/app/lib/supabase/sync.ts`

Why it is sensitive:
- changing this can affect anonymous fallback, dedupe behavior, profile updates, and progression correctness simultaneously

### Share route bridge
`/Users/HP/thine/app/share/[score]/page.tsx`

Why it is sensitive:
- combines legacy numeric handling with durable shared-result IDs, so routing changes can easily break old shares

## 13. Architecture Rules To Preserve

- keep anonymous flows first-class
- keep legacy share compatibility until deliberately retired
- prefer additive layers over replacing the local path
- do not silently change scoring, XP, or streak contracts
- do not introduce server dependency into flows that currently work locally
- preserve graceful degradation when Supabase or PostHog is absent

## 14. Best Entry Points For Future Changes

### If you are changing quiz behavior
Start in:
- `/Users/HP/thine/app/quiz/page.tsx`
- `/Users/HP/thine/app/data/questions.ts`
- `/Users/HP/thine/app/lib/analyzeUser.ts`

### If you are changing arena behavior
Start in:
- `/Users/HP/thine/app/arena/page.tsx`
- `/Users/HP/thine/app/data/hot-takes.ts`
- `/Users/HP/thine/app/lib/arena-share.ts`

### If you are changing progression or persistence
Start in:
- `/Users/HP/thine/app/lib/supabase/sync.ts`
- `/Users/HP/thine/app/lib/xp.ts`
- `/Users/HP/thine/app/lib/streak.ts`

### If you are changing auth
Start in:
- `/Users/HP/thine/app/components/auth/AuthProvider.tsx`
- `/Users/HP/thine/app/components/auth/AuthModal.tsx`
- `/Users/HP/thine/app/hooks/useAuth.ts`

### If you are changing sharing
Start in:
- `/Users/HP/thine/app/lib/share-card.ts`
- `/Users/HP/thine/app/components/shared/ShareCard.tsx`
- `/Users/HP/thine/app/share/[score]/page.tsx`
- `/Users/HP/thine/app/api/og/route.tsx`

## 15. Mental Model In One Sentence

Thine is a client-first product system where the quiz and arena are the acquisition loops, results and summary pages are the conversion surfaces, Supabase is the persistence amplifier, and sharing/progression are the retention multipliers.
