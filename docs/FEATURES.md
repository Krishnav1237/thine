# Thine Feature Reference

This document is the product-level source of truth for what Thine currently does. It is intentionally written from the perspective of the live experience, not just the code.

Use this file when you need to answer questions such as:

- what does the platform currently include?
- what are the user-visible loops?
- which features are local-only versus Supabase-backed?
- what should not be changed accidentally?

## Product Summary

Thine is a two-loop product:

- `Personal Intelligence Diagnostic`: a score-and-report product designed to reveal how well a user preserves context, follow-through, and relational awareness.
- `Hot Takes Arena`: a fast opinion engine designed to produce a thinking profile, encourage repetition, and create a lighter-weight social loop.

Those two loops are then wrapped by three horizontal systems:

- `progression`: XP, streaks, rank tier, leaderboard, dashboard
- `sharing`: legacy links, durable public share pages, image generation, OG previews
- `identity + persistence`: anonymous-first local state, with optional Supabase auth and syncing

## 1. Landing Experience (`/`)

### Purpose
The landing page exists to:

- position the product quickly
- route users into either primary loop
- preserve challenge context when arriving from a shared link
- surface daily usage state
- make the platform feel like one cohesive system rather than two disconnected pages

### Current behavior
- Shared global header with product navigation
- premium hero copy and product explanation
- primary CTA into the Diagnostic
- secondary CTA into Arena
- daily check-in card showing streak and time until the next daily pack
- challenge banner when the URL contains challenge parameters
- mobile nav collapses into a compact menu while keeping the same route structure as desktop

### Challenge banner
If the user arrives via:
- `/?challenge=true&score=XX&name=...&ref=...`

The landing page stores challenger metadata locally and surfaces a challenge banner so the session feels contextualized from the first screen.

## 2. Personal Intelligence Diagnostic (`/quiz`)

### Purpose
This is the core score-producing experience. It turns a short sequence of self-assessment questions into a normalized `0–100` intelligence score, a band, dimension breakdowns, and next steps.

### Session modes
- `Quick`: 10 questions
- `Deep`: 20 questions

### Question bank
- Current pool size: `96` questions
- Dimensions:
  - `memory`
  - `follow_up`
  - `consistency`
  - `awareness`
- The pool is daily-seeded so repeat users see variation across days.

### Personalization step
Before the quiz begins, the user can optionally provide:

- first name
- role or domain
- focus area

The focus area influences the ordering/selection of questions while preserving the existing scoring system.

### Interaction model
- one-question-per-screen
- large tap targets for answers
- progress indicator
- back / restart support
- session mode switch before start
- tightened transition timings so the quiz advances without feeling sticky on mobile

### Tracking and persistence
The quiz always writes to the anonymous local/session path first.

Primary storage:
- `sessionStorage` → `thine-quiz-session`

When the user is authenticated, the same completion is also dual-written to Supabase.

### Analytics events
- `quiz_started`
- `quiz_completed`

### Important invariant
The scoring math and `analyzeUser()` contract are intentionally stable and should not be changed casually.

## 3. Intelligence Report (`/results?score=XX`)

### Purpose
The report page turns the quiz output into a richer product moment:

- interpretation
- share prompt
- challenge loop
- progression reward
- conversion into account creation or repeat usage

### Current sections
The results page currently includes:

- shared header/navigation
- intelligence report summary
- strengths
- weakest area
- share section with share-card preview
- auth prompt or save confirmation
- daily check-in card
- next steps / retake / challenge actions
- 3-day playbook
- locked full analysis section
- optional challenge comparison messaging
- toast feedback for share actions

### Score display
The score remains normalized to `0–100` and maps to these bands:

- `0–39` → Foundation
- `40–69` → Builder
- `70–89` → High Performer
- `90–100` → Elite

### Analysis outputs
`analyzeUser(answers, score, questionOrder)` currently powers:

- strongest dimensions
- weakest area
- improvement level
- improvement plan
- dimension score breakdowns

### Full analysis lock
The report contains a locked full-analysis section.

Current unlock logic:
- share must be triggered locally by the current user
- and the associated challenge reference must have at least `3` recorded completions

The completion count now prefers Supabase-backed cross-device counts when available, but local fallback remains intact.

### Challenge comparison
If the user came from a challenge link, the report compares:
- challenger score
- current score
- win / lose / tie framing

### Share system on results
The report supports:

- link share
- image share
- preview
- durable shared results when logged in and persistence succeeds

### Performance behavior
The report avoids mounting or loading its heaviest share assets until they are useful:

- the hidden share card now mounts during idle time instead of on the first paint
- `html2canvas` is imported only when a user requests image sharing
- challenge completion polling stays active only while the report is still locked and the tab is visible

### Auth prompt behavior
After the share/report section, anonymous users see an auth prompt encouraging them to:
- save progress
- appear on the leaderboard
- unlock persistence benefits

Logged-in users instead see saved-state confirmation, XP gain, streak state, and profile-backed progression.

### Analytics events
- `share_clicked` for link/image/preview actions

## 4. Challenge System

### Purpose
The challenge loop creates a viral path from one user’s quiz outcome to another user’s quiz completion.

### Link format
Thine challenge links still use:
- `/?challenge=true&score=XX&name=...&ref=...`

### Local behavior
Locally, the app stores:
- challenger score
- challenger name
- challenge ref
- completed refs
- local completion counters

### Supabase extension
Cross-device challenge completion tracking now exists via:
- `challenge_completions` table
- `countchallengecompletions(ref_code text)` RPC

### Current design rule
Do not remove or replace the local challenge path yet. The local system is still the anonymous fallback and still matters for offline or unconfigured environments.

## 5. Hot Takes Arena (`/arena`)

### Purpose
Arena is the second major product loop. It is lighter, faster, more repeatable, and more socially expressive than the Diagnostic.

### Session modes
- `Daily`: 7 takes
- `Avid`: 12 takes

### Content pool
- Current pool size: `83` takes
- Each take has a stable numeric `id`
- Daily-seeded shuffling rotates which takes appear

### Interaction model
- swipe right → agree
- swipe left → disagree
- tap buttons for:
  - Agree
  - Depends
  - Disagree
- auto-advance transitions
- gesture thresholds tuned for touch devices

### Summary outputs
After completion, the Arena summary computes:

- agree / disagree / depends counts
- normalized percentages
- dominant stance
- thinking profile
- share preview
- XP/streak/rank state
- per-take crowd stats when aggregate data exists
- async comparison against a previous similar player when a match is found

### Thinking profiles
Current profile families include:
- `Contrarian Thinker`
- `Conformist Thinker`
- `Nuanced Thinker`
- `Balanced Thinker`

### Crowd responses
Arena now records each take response to Supabase when available.

That enables summary-time crowd statistics for the takes the user actually saw.

Current crowd display rules:
- if Supabase data exists and `total_responses >= 10`, show crowd percentages
- if response count is below `10`, show `Not enough data yet`
- if Supabase is unavailable, suppress crowd stats and keep the local-only summary experience intact

### Async matchmaking
After summary, the current Arena session is written to Supabase and the app looks up a previous similar session.

If a match is found, the page shows a comparison card with:
- you vs match counts
- profile comparison
- stance comparison
- completion timing

If no match exists or Supabase is unavailable, the app degrades gracefully without breaking the main summary experience.

### Performance behavior
Arena received a dedicated premium-feel pass to reduce friction:

- the atmospheric background now matches the rest of the platform instead of feeling like a separate microsite
- swipe/tap transitions resolve faster so the loop keeps momentum
- personalization fields no longer write to localStorage on every keystroke
- crowd-response inserts are fire-and-forget and do not block gestures or summary transitions

### Share system on Arena
Arena supports:
- link share
- image share
- public arena share page
- personalized copy based on name and role

### Analytics events
- `arena_started`
- `arena_completed`
- `share_clicked` for arena share actions

## 6. Authentication Layer

### Core principle
Auth is additive, not blocking.

Anonymous users must be able to:
- land on the site
- take the quiz
- view results
- use Arena
- share links
- participate in challenge flows

### Current auth surface
- modal-based auth, not full-page redirects
- tabs for sign up and log in
- Google OAuth
- email/password auth
- email capture fallback on dismiss

### Prompt locations
Auth prompts can currently originate from:
- results page
- arena summary
- header / navbar actions

### Post-auth behavior
After successful auth, the system attempts to:
- ensure a profile row exists
- migrate local data to Supabase if needed
- refresh profile state
- identify the user in PostHog when analytics is configured

### Analytics events
- `auth_prompted`
- `auth_completed`
- `email_captured`
- `authpromptshown`

## 7. Supabase Persistence Layer

### Purpose
Supabase extends the anonymous product into a real account-backed platform.

### Current tables in active use
- `profiles`
- `quiz_attempts`
- `arena_attempts`
- `email_captures`
- `shared_results`
- `challenge_completions`
- `arena_responses`
- `arena_sessions`

### Current RPC functions
- `countchallengecompletions`
- `getarenacrowdstats`
- `findarenamatch`

### Sync strategy
Thine uses a dual-write model:

- local storage/session storage remains the baseline source for anonymous continuity
- Supabase writes happen opportunistically when the user is authenticated or when a feature explicitly depends on public aggregate storage
- failures fall back silently wherever possible

## 8. XP, Streaks, and Rank

### Purpose
These systems turn single sessions into compounding behavior.

### XP rules
The current XP rules are:

- Quick quiz → `50 + round(score * 0.5)`
- Deep quiz → `75 + round(score * 0.75)`
- Daily Arena → `40`
- Avid Arena → `60`
- First activity of the day bonus → `+50`
- Streak bonuses:
  - `7 days` → `+100`
  - `30 days` → `+500`
  - `100 days` → `+2000`

### Rank tiers
- Bronze → `0–999`
- Silver → `1000–4999`
- Gold → `5000–14999`
- Platinum → `15000–49999`
- Diamond → `50000+`

### Where progression appears
- results page
- arena summary
- navbar (compact streak for logged-in users)
- dashboard
- leaderboard

## 9. Leaderboard (`/leaderboard`)

### Purpose
The leaderboard makes Thine outcomes socially legible and creates a repeat-usage target.

### Tabs
- `All Time`
- `This Week`
- `Today`

### Ranking logic
- `All Time` ranks by `profiles.pi_score`
- `This Week` and `Today` aggregate recent `xp_earned` from quiz and arena attempts when admin/server Supabase access is available
- when that timeboxed query path is unavailable, the page falls back gracefully

### Anonymous access
Anonymous users can still browse the leaderboard.

### Logged-in behavior
If the current user is in the dataset, their row is highlighted.

### Performance behavior
The leaderboard uses cached server payloads for its most common reads so repeat visits and public browsing do not feel cold every time:

- all-time profiles are cached
- week and today aggregates are cached independently
- mobile presentation avoids horizontal table scrolling

## 10. Dashboard (`/dashboard`)

### Purpose
The dashboard is the logged-in home for account-backed momentum.

### Current content
For authenticated users with Supabase configured, it shows:
- profile summary
- PI score
- current streak
- total XP
- rank tier
- recent quiz attempts
- recent arena attempts
- quick action buttons

For anonymous users or environments without Supabase, it shows a contextual empty state rather than breaking.

### Performance behavior
The dashboard now renders through a dedicated client component with a short-lived local cache per user so return visits can show recent activity while live sync catches up.

## 11. Share System

### Legacy share routes
Still active and intentionally preserved:
- `/share`
- `/arena/share`

These are query-param based and exist primarily as anonymous-compatible fallbacks.

### Durable share route
- `/share/[score]`

Despite the segment name, this route currently handles two cases:
- numeric legacy redirects
- durable shared result IDs from Supabase

### Image generation
Client-side image sharing is powered by `html2canvas` and a hidden DOM share card.

Current runtime behavior:
- the share card is lazily mounted
- `html2canvas` is loaded on demand
- fallback behavior remains copy-link plus image download when native file sharing is unavailable

### Social preview generation
Server-side OG previews are generated by `/api/og` using `@vercel/og`.

## 12. Analytics

### Provider model
PostHog is wrapped globally via `PostHogProvider`.

### Initialization rule
If `NEXTPUBLICPOSTHOG_KEY` is missing, PostHog does not initialize and the app becomes a no-op analytics environment.

### Tracked events
Currently instrumented events include:
- `quiz_started`
- `quiz_completed`
- `arena_started`
- `arena_completed`
- `share_clicked`
- `auth_prompted`
- `auth_completed`
- `email_captured`
- `authpromptshown`
- `web_vital_reported`

See `/Users/HP/thine/docs/ANALYTICS.md` for full details.

## 13. Error Handling and Fallbacks

### Global error surfaces
- `/Users/HP/thine/app/error.tsx`
- `/Users/HP/thine/app/not-found.tsx`

### Loading states
Reusable skeletons exist for:
- leaderboard
- dashboard
- durable share page

### Degradation strategy
The platform should continue operating when any of the following are unavailable:
- Supabase
- PostHog
- admin/service-role leaderboard queries
- crowd-response data
- arena matchmaking

When those systems are unavailable, the product should degrade to the local, anonymous, client-only path rather than failing hard.

## 14. What Should Be Treated As Stable

The following should be treated as explicit product contracts unless the team intentionally decides to change them:

- quiz score normalization and score bands
- `analyzeUser()` output shape
- XP formulas
- streak progression logic
- local storage/session storage key names
- legacy share fallback behavior
- anonymous-first platform posture
- challenge link structure

## 15. Current Product Direction Embedded In The Codebase

The codebase currently signals a product direction with five priorities:

- `replayability`: daily-seeded content, multiple modes, repeatable arena runs
- `social proof`: shares, challenge links, crowd stats, leaderboard, match cards
- `progression`: XP, streaks, ranks, dashboard history
- `anonymous-to-account conversion`: auth prompts that never block the core experience
- `premium presentation`: consistent shell, dark styling, strong share surfaces, minimal hard breaks
