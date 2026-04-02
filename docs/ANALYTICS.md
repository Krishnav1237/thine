# Thine Analytics Reference

This document covers the current analytics instrumentation in Thine.

The analytics stack is intentionally simple:
- Vercel Analytics is included globally
- PostHog is used for event capture and identity
- browser Web Vitals are captured through `next/web-vitals`
- PostHog is optional and safely disabled when env vars are missing

## 1. Analytics Goals

The current instrumentation is designed to answer a practical set of product questions:

- how many users start and complete the quiz?
- how many users start and complete Arena?
- which share actions are used?
- how often are auth prompts shown versus completed?
- where are users being prompted to create accounts?
- how often do users leave an email instead of authenticating?

## 2. Initialization Model

### Provider
File:
- `/Users/HP/thine/app/components/PostHogProvider.tsx`

### Wiring
Root layout file:
- `/Users/HP/thine/app/layout.tsx`

Performance telemetry provider:
- `/Users/HP/thine/app/components/WebVitalsProvider.tsx`

### Env vars
- `NEXTPUBLICPOSTHOG_KEY`
- `NEXTPUBLICPOSTHOG_HOST`

If `NEXTPUBLICPOSTHOG_KEY` is empty or missing:
- PostHog does not initialize
- event helper calls become safe no-ops
- local development remains clean and usable

### Initialization timing
PostHog is intentionally deferred until the browser is idle via `requestIdleCallback` (or a timeout fallback) so analytics setup does not compete with first paint on slower devices.

### Default host
If `NEXTPUBLICPOSTHOG_HOST` is missing, the default host is:
- `https://us.i.posthog.com`

## 3. Identity Behavior

### On login or signup
When a user becomes authenticated, the provider calls:
- `posthog.identify(user.id, { email: user.email })`

### On logout
When a previously identified user signs out, the provider calls:
- `posthog.reset()`

### Why this matters
This keeps pre-auth anonymous browsing separate from authenticated usage while still preserving a clean profile once a real account exists.

## 4. Event Helper

The shared helper is:
- `capturePostHogEvent(eventName, properties?)`

Location:
- `/Users/HP/thine/app/components/PostHogProvider.tsx`

Behavior:
- if PostHog is not initialized, it returns immediately
- event callers do not need to guard every call site manually

## 5. Web Vitals Instrumentation

### Provider
File:
- `/Users/HP/thine/app/components/WebVitalsProvider.tsx`

### Storage helper
File:
- `/Users/HP/thine/app/lib/web-vitals.ts`

### What it records
The provider listens to `useReportWebVitals` and records the latest browser-reported values for:

- `CLS`
- `FCP`
- `INP`
- `LCP`
- `TTFB`

### Local persistence
Latest metric snapshots are persisted into:
- `localStorage["thine-web-vitals"]`

Stored fields include:
- vital name
- normalized value
- delta
- rating
- pathname
- recorded timestamp
- navigation type when available

### Analytics event
Each recorded vital also emits:
- `web_vital_reported`

Properties:
- `name`
- `value`
- `delta`
- `rating`
- `pathname`
- `navigationType`

## 6. Event Inventory

### `quiz_started`
Location:
- `/Users/HP/thine/app/quiz/page.tsx`

Triggered when:
- the user starts a quiz after selecting mode and moving past the personalization step

Properties:
- `mode`: `quick` or `deep`
- `focus`: selected focus string or `null`

### `quiz_completed`
Location:
- `/Users/HP/thine/app/quiz/page.tsx`

Triggered when:
- the quiz finishes and score is computed before navigating to results

Properties:
- `mode`: `quick` or `deep`
- `score`: numeric normalized score
- `focus`: selected focus string or `null`

### `arena_started`
Location:
- `/Users/HP/thine/app/arena/page.tsx`

Triggered when:
- the user records the first response in an Arena run

Important note:
- Arena currently has no dedicated “Begin” CTA, so first interaction is used as the start signal

Properties:
- `mode`: `daily` or `avid`

### `arena_completed`
Location:
- `/Users/HP/thine/app/arena/page.tsx`

Triggered when:
- all takes in the current Arena session have been answered

Properties:
- `mode`: `daily` or `avid`
- `dominant_stance`: resolved dominant stance for the session

### `share_clicked`
Locations:
- `/Users/HP/thine/app/results/ResultsClient.tsx`
- `/Users/HP/thine/app/arena/page.tsx`

Triggered when:
- share link is triggered
- share-as-image is triggered
- preview is triggered
- challenge share path is triggered from results

Properties:
- `type`: currently one of
  - `link`
  - `image`
  - `preview`

### `auth_prompted`
Location:
- `/Users/HP/thine/app/components/auth/AuthModal.tsx`

Triggered when:
- the auth modal opens

Properties:
- `trigger`: a source string passed by the opening surface

Examples of triggers currently used:
- `header`
- results prompt triggers routed through the prompt card
- arena prompt triggers routed through the prompt card

### `auth_completed`
Location:
- `/Users/HP/thine/app/components/auth/AuthModal.tsx`

Triggered when:
- login or signup succeeds

Properties:
- `method`: `google` or `email`

### `email_captured`
Location:
- `/Users/HP/thine/app/components/auth/EmailCaptureModal.tsx`

Triggered when:
- the user submits email through the fallback capture modal

Properties:
- none

### `authpromptshown`
Location:
- `/Users/HP/thine/app/components/auth/AuthPromptCard.tsx`

Triggered when:
- the auth prompt card renders for an anonymous user

Properties:
- `location`: `results` or `arena`

### `web_vital_reported`
Location:
- `/Users/HP/thine/app/components/WebVitalsProvider.tsx`

Triggered when:
- Next.js reports a supported browser web vital

Properties:
- `name`
- `value`
- `delta`
- `rating`
- `pathname`
- `navigationType`

## 7. Event-to-Surface Mapping

### Quiz funnel
- `quiz_started`
- `quiz_completed`
- optional downstream `share_clicked`
- optional downstream `authpromptshown`
- optional downstream `auth_prompted`
- optional downstream `auth_completed`

### Arena funnel
- `arena_started`
- `arena_completed`
- optional downstream `share_clicked`
- optional downstream `authpromptshown`
- optional downstream `auth_prompted`
- optional downstream `auth_completed`

### Conversion assist funnel
- `authpromptshown`
- `auth_prompted`
- `auth_completed`
- `email_captured`

### Runtime quality funnel
- `web_vital_reported`
- downstream route or feature events on the same pathname

## 8. Practical Questions You Can Answer Today

With the current events, you can answer:

- which quiz mode gets more starts?
- which quiz mode produces more completions?
- how often does a share click happen after results?
- are Arena users more likely to authenticate than quiz users?
- does the header auth entry point convert better than results or arena prompts?
- how often do users prefer email capture over authentication?
- which routes are producing weak LCP/INP values on real devices?
- are heavy share or summary surfaces correlated with worse vitals on mobile?

## 9. Gaps In Current Instrumentation

The analytics layer is useful, but not yet exhaustive. It does not currently answer everything.

Known gaps:
- no explicit per-question quiz drop-off events
- no per-take Arena drop-off events
- no explicit “challenge link copied” versus generic share segmentation beyond share type
- no view-count or CTR events for durable share pages themselves
- no explicit leaderboard row interaction tracking
- no dashboard interaction tracking

These are not bugs; they are simply areas where instrumentation could be extended later.

## 9. Verification Checklist

### Without PostHog env vars
- app should load normally
- no analytics-related runtime crash should occur
- event helper calls should remain safe

### With PostHog env vars
- verify the provider initializes
- start a quiz and confirm `quiz_started`
- complete a quiz and confirm `quiz_completed`
- run Arena and confirm `arena_started` / `arena_completed`
- click share actions and confirm `share_clicked`
- open auth modal and confirm `auth_prompted`
- complete auth and confirm `auth_completed`
- submit email capture and confirm `email_captured`

## 10. Files To Update If Analytics Changes

If you add or rename events, you will likely need to touch:

- `/Users/HP/thine/app/components/PostHogProvider.tsx`
- `/Users/HP/thine/app/layout.tsx`
- `/Users/HP/thine/app/quiz/page.tsx`
- `/Users/HP/thine/app/arena/page.tsx`
- `/Users/HP/thine/app/results/ResultsClient.tsx`
- `/Users/HP/thine/app/components/auth/AuthModal.tsx`
- `/Users/HP/thine/app/components/auth/EmailCaptureModal.tsx`
- `/Users/HP/thine/app/components/auth/AuthPromptCard.tsx`

## 11. Safe Rule For Future Analytics Changes

Do not let analytics become a reason a product flow can fail.

In this codebase, analytics should always be:
- optional
- side-effect only
- safe to skip
- never blocking a transition, score computation, share flow, or auth flow
