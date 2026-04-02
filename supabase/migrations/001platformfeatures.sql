-- Thine: Complete database migration
-- Run this ONCE in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- This creates ALL tables, RLS policies, and functions the app needs.

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Profiles
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  total_xp int default 0,
  current_streak int default 0,
  longest_streak int default 0,
  lastactivedate date,
  pi_score int,
  ranktier text default 'bronze' check (ranktier in ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on profiles;
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================================
-- 2. Quiz attempts
-- ============================================================
create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  sessionmode text check (sessionmode in ('quick', 'deep')),
  score int not null,
  max_score int not null,
  normalized_score int not null,
  score_band text,
  dimension_scores jsonb,
  strengths jsonb,
  weakest_area text,
  answers jsonb,
  question_order jsonb,
  timetakenseconds int,
  xp_earned int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_quiz_attempts_user_id
  on quiz_attempts(user_id);
create index if not exists idx_quiz_attempts_created_at
  on quiz_attempts(created_at desc);

alter table quiz_attempts enable row level security;

drop policy if exists "Quiz attempts are viewable by everyone" on quiz_attempts;
create policy "Quiz attempts are viewable by everyone"
  on quiz_attempts for select
  using (true);

drop policy if exists "Users can insert quiz attempts" on quiz_attempts;
create policy "Users can insert quiz attempts"
  on quiz_attempts for insert
  with check (true);

-- ============================================================
-- 3. Arena attempts
-- ============================================================
create table if not exists arena_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  sessionmode text check (sessionmode in ('daily', 'avid')),
  thinking_profile text,
  agree_count int default 0,
  disagree_count int default 0,
  depends_count int default 0,
  stance_mix jsonb,
  responses jsonb,
  xp_earned int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_arena_attempts_user_id
  on arena_attempts(user_id);

alter table arena_attempts enable row level security;

drop policy if exists "Arena attempts are viewable by everyone" on arena_attempts;
create policy "Arena attempts are viewable by everyone"
  on arena_attempts for select
  using (true);

drop policy if exists "Users can insert arena attempts" on arena_attempts;
create policy "Users can insert arena attempts"
  on arena_attempts for insert
  with check (true);

-- ============================================================
-- 4. Shared results
-- ============================================================
create table if not exists shared_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  resulttype text check (resulttype in ('quiz', 'arena')),
  score int,
  score_band text,
  display_name text,
  dimension_scores jsonb,
  thinking_profile text,
  stance_data jsonb,
  shareimageurl text,
  views int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_shared_results_user_id
  on shared_results(user_id);

alter table shared_results enable row level security;

drop policy if exists "Shared results are viewable by everyone" on shared_results;
create policy "Shared results are viewable by everyone"
  on shared_results for select
  using (true);

drop policy if exists "Users can insert shared results" on shared_results;
create policy "Users can insert shared results"
  on shared_results for insert
  with check (true);

-- Allow service_role to update view counts
drop policy if exists "Service role can update shared results" on shared_results;
create policy "Service role can update shared results"
  on shared_results for update
  using (true);

-- ============================================================
-- 5. Email captures
-- ============================================================
create table if not exists email_captures (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source_page text,
  created_at timestamptz default now()
);

alter table email_captures enable row level security;

drop policy if exists "Email captures insertable" on email_captures;
create policy "Email captures insertable"
  on email_captures for insert
  with check (true);

-- ============================================================
-- 6. Challenge completions
-- ============================================================
create table if not exists challenge_completions (
  id uuid primary key default gen_random_uuid(),
  ref text not null,
  completer_score int not null,
  completer_name text,
  completed_at timestamptz default now()
);

create index if not exists idx_challenge_completions_ref
  on challenge_completions(ref);

alter table challenge_completions enable row level security;

drop policy if exists "Challenge completions readable" on challenge_completions;
create policy "Challenge completions readable"
  on challenge_completions for select
  using (true);

drop policy if exists "Challenge completions insertable" on challenge_completions;
create policy "Challenge completions insertable"
  on challenge_completions for insert
  with check (true);

create or replace function countchallengecompletions(ref_code text)
returns int as $$
  select count(*)::int
  from challenge_completions
  where ref = ref_code;
$$ language sql stable;

-- ============================================================
-- 7. Arena crowd responses
-- ============================================================
create table if not exists arena_responses (
  id uuid primary key default gen_random_uuid(),
  take_id text not null,
  stance text not null check (stance in ('agree', 'depends', 'disagree')),
  session_id text not null,
  responded_at timestamptz default now()
);

create index if not exists idx_arena_responses_take_id
  on arena_responses(take_id);

alter table arena_responses enable row level security;

drop policy if exists "Arena responses readable" on arena_responses;
create policy "Arena responses readable"
  on arena_responses for select
  using (true);

drop policy if exists "Arena responses insertable" on arena_responses;
create policy "Arena responses insertable"
  on arena_responses for insert
  with check (true);

create or replace function getarenacrowdstats(takeids text[])
returns table(
  take_id text,
  agree_pct numeric,
  depends_pct numeric,
  disagree_pct numeric,
  total_responses bigint
) as $$
  select
    arena_responses.take_id,
    round(
      100.0 * count(*) filter (where stance = 'agree')::numeric
      / greatest(count(*), 1),
      1
    ) as agree_pct,
    round(
      100.0 * count(*) filter (where stance = 'depends')::numeric
      / greatest(count(*), 1),
      1
    ) as depends_pct,
    round(
      100.0 * count(*) filter (where stance = 'disagree')::numeric
      / greatest(count(*), 1),
      1
    ) as disagree_pct,
    count(*) as total_responses
  from arena_responses
  where arena_responses.take_id = any(takeids)
  group by arena_responses.take_id;
$$ language sql stable;

-- ============================================================
-- 8. Arena sessions + async matchmaking
-- ============================================================
create table if not exists arena_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  display_name text default 'Anonymous',
  mode text not null check (mode in ('daily', 'avid')),
  dominant_stance text,
  thinking_profile text,
  agree_count int not null default 0,
  depends_count int not null default 0,
  disagree_count int not null default 0,
  completed_at timestamptz default now()
);

create index if not exists idx_arena_sessions_mode
  on arena_sessions(mode);
create index if not exists idx_arena_sessions_completed_at
  on arena_sessions(completed_at desc);

alter table arena_sessions enable row level security;

drop policy if exists "Arena sessions readable" on arena_sessions;
create policy "Arena sessions readable"
  on arena_sessions for select
  using (true);

drop policy if exists "Arena sessions insertable" on arena_sessions;
create policy "Arena sessions insertable"
  on arena_sessions for insert
  with check (true);

create or replace function findarenamatch(
  exclude_session text,
  match_mode text,
  match_stance text
)
returns table(
  display_name text,
  dominant_stance text,
  thinking_profile text,
  agree_count int,
  depends_count int,
  disagree_count int,
  completed_at timestamptz
) as $$
  select
    arena_sessions.display_name,
    arena_sessions.dominant_stance,
    arena_sessions.thinking_profile,
    arena_sessions.agree_count,
    arena_sessions.depends_count,
    arena_sessions.disagree_count,
    arena_sessions.completed_at
  from arena_sessions
  where arena_sessions.session_id != exclude_session
    and arena_sessions.mode = match_mode
  order by
    case when arena_sessions.dominant_stance = match_stance then 0 else 1 end,
    arena_sessions.completed_at desc
  limit 1;
$$ language sql stable;
