-- Thine platform feature migration
-- Section 1: challenge completions for cross-device unlock tracking.
-- Section 2: arena crowd-response storage plus aggregate RPC for real percentages.
-- Section 3: arena session storage plus async matchmaking RPC.

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Challenge completions
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
-- 2. Arena crowd responses
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
-- 3. Arena sessions + async matchmaking
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
