-- ALX ProConnect — Migration 002: lightweight recruiter capture
-- Run this in the SQL Editor of your EXISTING Supabase project.
-- Safe to run once; re-running is safe too (uses IF EXISTS / IF NOT EXISTS
-- throughout). Your `talents` data is untouched — only `recruiters` and
-- `intro_requests` are rebuilt, and both were still empty/test-only.

-- ─────────────────────────────────────────────────────────────
-- 1. Drop the old Supabase-Auth-based recruiter model
-- ─────────────────────────────────────────────────────────────
drop policy if exists "recruiters can read own row" on recruiters;
drop policy if exists "recruiters can insert own row" on recruiters;
drop policy if exists "recruiters can update own row" on recruiters;
drop policy if exists "recruiters can read own intro requests" on intro_requests;
drop policy if exists "recruiters can create intro requests" on intro_requests;
drop policy if exists "recruiters can read published talents" on talents;

drop table if exists intro_requests;
drop table if exists recruiters;

-- ─────────────────────────────────────────────────────────────
-- 2. Recruiters — standalone table, no auth.users dependency.
-- Identified by email; a browser cookie plus this table is what
-- "signs a recruiter in" now, not Supabase Auth.
-- ─────────────────────────────────────────────────────────────
create table recruiters (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  full_name     text not null,
  company       text not null,
  role_title    text,
  work_email    text not null unique,
  hiring_focus  text
);

alter table recruiters enable row level security;
-- No public policies: every read/write goes through a server-side route
-- handler using the service-role key. Recruiters never talk to Supabase
-- directly from the browser.

-- ─────────────────────────────────────────────────────────────
-- 3. Intro requests — same shape as before, just no longer tied to
-- an auth.users-backed recruiter id.
-- ─────────────────────────────────────────────────────────────
create table intro_requests (
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
-- No public policies here either — service-role only.

-- ─────────────────────────────────────────────────────────────
-- 4. Talents — directory reads now happen server-side via the
-- service-role key too (no more "authenticated recruiter" session to
-- check), so the old RLS policy is gone. Table stays RLS-enabled with
-- zero public policies: nothing is readable via the anon key directly.
-- ─────────────────────────────────────────────────────────────
-- (policy already dropped in step 1 — nothing further to do here)

-- ─────────────────────────────────────────────────────────────
-- 5. Activity log — one shared table for both recruiter and talent
-- engagement events (logins/re-entries, directory searches, profile
-- submissions, intro requests, etc.)
-- ─────────────────────────────────────────────────────────────
create table if not exists activity_log (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  actor_type    text not null check (actor_type in ('recruiter', 'talent')),
  actor_email   text not null,
  action        text not null,          -- e.g. 'search_directory', 'profile_submitted', 'intro_request'
  metadata      jsonb
);

create index if not exists activity_log_actor_idx on activity_log (actor_type, actor_email);
create index if not exists activity_log_created_idx on activity_log (created_at);

alter table activity_log enable row level security;
-- No public policies: written only via service-role key from route handlers.
