-- ALX ProConnect — V1 schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- TALENTS  (Freelancer Academy graduates who cleared the Portfolio
-- Showcase judging rubric and submitted a ProConnect profile)
-- ─────────────────────────────────────────────────────────────
create table if not exists talents (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  full_name      text not null,
  email          text not null unique,
  phone          text,
  country        text not null,
  city           text,
  program        text not null,               -- e.g. 'FLA', matches ALX program taxonomy
  skill_tags     text[] not null default '{}',
  one_liner      text not null,                -- short value proposition shown on the card
  bio            text,
  portfolio_url  text,
  linkedin_url   text,
  headshot_path  text,                         -- storage object path in the 'headshots' bucket
  showcase_score numeric(3,2) check (showcase_score between 0 and 5),
  status         text not null default 'pending'
                 check (status in ('pending', 'published', 'rejected')),
  reviewed_by    text,
  reviewed_at    timestamptz
);

create index if not exists talents_status_idx on talents (status);
create index if not exists talents_skill_tags_idx on talents using gin (skill_tags);

alter table talents enable row level security;

-- Signed-in recruiters may read only published profiles.
-- All writes (apply-form submissions, admin moderation) go through
-- server-side route handlers using the service-role key, which bypasses RLS,
-- so no public INSERT/UPDATE policy is defined here on purpose.
create policy "recruiters can read published talents"
  on talents for select
  to authenticated
  using (status = 'published');

-- ─────────────────────────────────────────────────────────────
-- RECRUITERS  (one row per Supabase Auth user, id = auth.users.id)
-- ─────────────────────────────────────────────────────────────
create table if not exists recruiters (
  id            uuid primary key references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  full_name     text not null,
  company       text not null,
  role_title    text,
  work_email    text not null,
  hiring_focus  text
);

alter table recruiters enable row level security;

create policy "recruiters can read own row"
  on recruiters for select
  to authenticated
  using (auth.uid() = id);

create policy "recruiters can insert own row"
  on recruiters for insert
  to authenticated
  with check (auth.uid() = id);

create policy "recruiters can update own row"
  on recruiters for update
  to authenticated
  using (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- INTRO REQUESTS  (a recruiter asking to be connected to a talent)
-- ─────────────────────────────────────────────────────────────
create table if not exists intro_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  recruiter_id  uuid not null references recruiters (id) on delete cascade,
  talent_id     uuid not null references talents (id) on delete cascade,
  message       text,
  status        text not null default 'pending'
                check (status in ('pending', 'sent', 'declined')),
  unique (recruiter_id, talent_id)
);

alter table intro_requests enable row level security;

create policy "recruiters can read own intro requests"
  on intro_requests for select
  to authenticated
  using (auth.uid() = recruiter_id);

create policy "recruiters can create intro requests"
  on intro_requests for insert
  to authenticated
  with check (auth.uid() = recruiter_id);

-- ─────────────────────────────────────────────────────────────
-- STORAGE — public bucket for talent headshots
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('headshots', 'headshots', true)
on conflict (id) do nothing;

-- Anyone can view headshots (they're shown on public/recruiter-facing cards).
create policy "public read of headshots"
  on storage.objects for select
  to public
  using (bucket_id = 'headshots');

-- Uploads happen only via the /api/apply route using the service-role key,
-- which bypasses storage RLS — so no public INSERT policy is defined here.
