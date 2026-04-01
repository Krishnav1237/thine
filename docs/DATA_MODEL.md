# Thine Data Model

This document explains how data is stored across the platform, which parts are local-only, which parts are synced to Supabase, and what each table, key, and RPC currently means.

Use this file when you need to answer:

- what is persisted locally?
- what is persisted remotely?
- which systems are authoritative versus fallback?
- how do challenge counts, crowd stats, and matchmaking work?

## 1. Data Model Philosophy

Thine uses a layered persistence strategy:

- `sessionStorage` preserves in-progress and immediate post-quiz state
- `localStorage` preserves anonymous continuity, progression backup, and local loop state
- `Supabase` extends the product with account persistence, public ranking, cross-device challenge counting, crowd data, and public share pages

The design principle is:

- local state should be enough to keep the core experience alive
- remote state should improve continuity and social systems, not block them

## 2. Client-Side Storage

### sessionStorage

#### `thine-quiz-session`
Purpose:
- stores quiz progress and/or the most recent quiz completion
- allows the results page to use the just-completed session as the primary source of truth

Typical contents include:
- `answers`
- `questionOrder`
- `sessionMode`
- personalization fields such as name, role, and focus

### localStorage

#### `thine-challenge`
Purpose:
- stores incoming challenge metadata from the landing URL

Used for:
- challenge banner context
- challenger comparison on the results page

#### `thine-challenge-ref`
Purpose:
- stores the current user’s share reference ID for challenge links

Used for:
- generating shareable challenge links
- associating future friend completions to the sharer’s ref

#### `thine-challenge-completions`
Purpose:
- local backup map of completion counts per challenge ref

Used for:
- anonymous/local fallback challenge unlock logic
- preserving behavior when Supabase is missing

#### `thine-challenge-completed-refs`
Purpose:
- remembers which challenge refs this device has already counted

Used for:
- preventing duplicate local completion counts from the same device/session history

#### `arenaResponses`
Purpose:
- stores the current or most recent arena responses

Used for:
- arena summary generation
- local fallback persistence
- migration into Supabase after auth

#### `arenaSessionMode`
Purpose:
- stores the last selected arena mode (`daily` or `avid`)

#### `arenaProfile`
Purpose:
- stores arena name/role personalization

#### `thine-retention`
Purpose:
- stores retention-related local data, including streak state and daily activity dates

Used for:
- daily check-in card
- anonymous streak continuity
- backup copy for synced users

#### `thine-share-unlocked`
Purpose:
- stores local share-trigger state used by results-page full-analysis gating

Important:
- this does not, by itself, unlock full analysis
- full analysis also requires challenge completion count to meet the threshold

#### `thine-user-seed`
Purpose:
- stores daily seed identity used by content rotation helpers

#### `thine-player-stats`
Purpose:
- stores local backup of:
  - total XP
  - current streak
  - longest streak
  - local PI score backup
  - rank tier

Used for:
- progression continuity when not logged in
- fallback display if Supabase is unavailable

#### `thine-xp-daily-bonus`
Purpose:
- prevents repeated first-activity-of-day bonus awards on the same date

#### `thine-email-captured`
Purpose:
- suppresses repeated email-capture prompts after submission

#### `thine-migrated`
Purpose:
- indicates local-to-Supabase migration has already run

#### `thine-migrated-user`
Purpose:
- identifies which authenticated user local migration was performed for

#### `thine-sync-dedupe`
Purpose:
- keeps a rolling set of dedupe keys so attempts are not synced repeatedly

## 3. Local Data Ownership

### Local-first sources of truth
These systems still have important local ownership even after Supabase layering:

- quiz session state
- challenge share-trigger state
- anonymous XP and streak backup
- recent arena response history
- local suppression flags

### Why this matters
If you remove or rename these keys casually, you can break:
- anonymous continuity
- migration into Supabase
- full-analysis gating
- share unlock behavior
- dedupe protection

## 4. Supabase Tables

The typed database surface is defined in:
- `/Users/HP/thine/app/lib/supabase/types.ts`

The latest migration lives in:
- `/Users/HP/thine/supabase/migrations/001platformfeatures.sql`

### `profiles`
Purpose:
- canonical user profile for logged-in users

Current columns include:
- `id`
- `username`
- `display_name`
- `avatar_url`
- `total_xp`
- `current_streak`
- `longest_streak`
- `lastactivedate`
- `pi_score`
- `ranktier`
- `created_at`

Used for:
- navbar account state
- leaderboard ranking
- dashboard summary
- progression state

### `quiz_attempts`
Purpose:
- stores authenticated quiz completions

Current columns include:
- `user_id`
- `sessionmode`
- `score`
- `max_score`
- `normalized_score`
- `score_band`
- `dimension_scores`
- `strengths`
- `weakest_area`
- `answers`
- `question_order`
- `timetakenseconds`
- `xp_earned`
- `created_at`

Used for:
- dashboard history
- leaderboard XP aggregation
- future account-based analytics and history

### `arena_attempts`
Purpose:
- stores authenticated arena completions

Current columns include:
- `user_id`
- `sessionmode`
- `thinking_profile`
- `agree_count`
- `disagree_count`
- `depends_count`
- `stance_mix`
- `responses`
- `xp_earned`
- `created_at`

Used for:
- dashboard history
- leaderboard XP aggregation
- future account-level arena history

### `email_captures`
Purpose:
- stores email submissions from the auth-dismiss fallback modal

Current columns include:
- `email`
- `source_page`
- `created_at`

### `shared_results`
Purpose:
- stores durable shared-result payloads

Current columns include:
- `user_id`
- `resulttype`
- `score`
- `score_band`
- `display_name`
- `dimension_scores`
- `thinking_profile`
- `stance_data`
- `shareimageurl`
- `views`
- `created_at`

Used for:
- durable public share pages
- long-lived result URLs for logged-in users

### `challenge_completions`
Purpose:
- stores challenge completions across devices

Current columns include:
- `ref`
- `completer_score`
- `completer_name`
- `completed_at`

Used for:
- cross-device full-analysis unlock counting

### `arena_responses`
Purpose:
- stores per-take crowd responses from Arena sessions

Current columns include:
- `take_id`
- `stance`
- `session_id`
- `responded_at`

Used for:
- crowd-percentage displays on Arena summary

### `arena_sessions`
Purpose:
- stores completed Arena session summaries used for async matchmaking

Current columns include:
- `session_id`
- `user_id`
- `display_name`
- `mode`
- `dominant_stance`
- `thinking_profile`
- `agree_count`
- `depends_count`
- `disagree_count`
- `completed_at`

Used for:
- previous-player comparison on Arena summary

## 5. RPC Functions

### `countchallengecompletions(ref_code text)`
Purpose:
- returns the count of recorded challenge completions for a given share ref

Current usage:
- results page full-analysis gating
- remote count polling after share activity

### `getarenacrowdstats(takeids text[])`
Purpose:
- returns aggregate crowd percentages per take

Current return shape includes:
- `take_id`
- `agree_pct`
- `depends_pct`
- `disagree_pct`
- `total_responses`

Current usage:
- Arena summary crowd section

### `findarenamatch(exclude_session, match_mode, match_stance)`
Purpose:
- returns one previous Arena session for lightweight async comparison

Current matching behavior:
- excludes the current session
- prefers same session mode
- prefers same dominant stance
- sorts by recency after stance preference

Current usage:
- Arena summary match card

## 6. Data Flow: Challenge System

### Local path
1. sharer generates a challenge link with a local ref
2. recipient opens the landing page with challenge params
3. local challenge metadata is stored
4. recipient completes quiz
5. local completion count for that ref increments unless already counted on this device

### Remote path
1. after local registration, the quiz also attempts to insert into `challenge_completions`
2. the results page calls `countchallengecompletions`
3. if remote count is higher than local count, the higher value is used
4. if Supabase is unavailable, local count remains the fallback

## 7. Data Flow: Arena Crowd Responses

### Write path
1. Arena session starts and generates a local `session_id`
2. each swipe/tap writes locally for summary continuity
3. each swipe/tap also attempts remote insert to `arena_responses`
4. failures are ignored so animation and flow remain uninterrupted

### Read path
1. summary completes
2. current take IDs are collected
3. `getarenacrowdstats` is called with those take IDs
4. UI renders:
   - crowd percentages if data exists and `total_responses >= 10`
   - `Not enough data yet` if sample is too small
   - no crowd block if Supabase is unavailable or returns nothing

## 8. Data Flow: Arena Matchmaking

### Write path
1. Arena summary is reached
2. summary counts/profile are inserted into `arena_sessions`

### Read path
1. after save, `findarenamatch` is called
2. if a match is returned, a comparison card is rendered
3. if no match is found, the UI degrades gracefully

## 9. Sync and Dedupe Strategy

### Why dedupe exists
Auth migration and dual-write sync can easily create duplicate inserts if retries or repeated navigation happen.

### Current strategy
`/Users/HP/thine/app/lib/supabase/sync.ts` stores dedupe markers in:
- `thine-sync-dedupe`

This prevents repeated writes of the same logical attempt.

### Important note
Do not rename or clear this key casually without understanding replay side effects.

## 10. Which Layer Is Authoritative?

### Quiz session truth
For the immediate post-quiz report, the active quiz session is authoritative if it is complete. The URL score is a fallback.

### XP / streak display
- if authenticated profile data is available and refreshed, it becomes the preferred display state
- local player stats remain the fallback and backup

### Challenge counts
- remote count is preferred when available
- local count remains fallback and floor

### Arena crowd percentages
- remote crowd stats are authoritative when available
- if unavailable, no crowd data is shown rather than inventing fake values

### Matchmaking
- fully remote-dependent
- no remote → no match UI requirement

## 11. Data Contracts That Should Not Change Lightly

These are embedded across the app and docs:

- local storage key names
- quiz score range and band thresholds
- XP formulas
- streak milestone thresholds
- arena stance values:
  - `agree`
  - `depends`
  - `disagree`
- challenge link parameter names:
  - `challenge`
  - `score`
  - `name`
  - `ref`

## 12. Operational Note

If you are troubleshooting a feature, first ask which layer is failing:

- local/session storage?
- Supabase browser writes?
- server-side Supabase reads?
- RPC return shape?
- UI state composition?

That framing usually gets you to the bug faster than starting from the page surface alone.
