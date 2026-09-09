-- ALX ProConnect — V1 schema
-- For a brand-new Supabase project, run this once in the SQL Editor.
-- If you already have a project running the OLD (auth-based recruiter)
-- schema, use supabase/migrations/002_recruiter_lightweight_flow.sql instead
-- — it transforms the live database in place without touching your talents data.

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
                 check (status in ('pending', 'published', 'rejected', 'removed')),
  reviewed_by    text,
  reviewed_at    timestamptz
);

create index if not exists talents_status_idx on talents (status);
create index if not exists talents_skill_tags_idx on talents using gin (skill_tags);

alter table talents enable row level security;
-- No public policies: every read (directory) and write (apply form, admin
-- moderation) goes through a server-side route handler using the
-- service-role key. Nothing is readable via the anon key directly —
-- recruiters and talents never talk to Supabase directly from the browser.

-- ─────────────────────────────────────────────────────────────
-- RECRUITERS  (standalone table, identified by email — no accounts,
-- no passwords. A browser cookie + this table is what "signs a
-- recruiter in"; see /api/recruiters/continue.)
-- ─────────────────────────────────────────────────────────────
create table if not exists recruiters (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  full_name       text not null,
  company         text not null,
  company_website text,
  industry        text,
  company_size    text,
  role_title      text,
  linkedin_url    text,
  work_email      text not null unique,
  hiring_focus    text
);

alter table recruiters enable row level security;
-- No public policies — service-role only, same reasoning as `talents`.

-- ─────────────────────────────────────────────────────────────
-- INTRO REQUESTS  (a recruiter selecting/downloading a talent profile)
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
-- No public policies — service-role only.

-- ─────────────────────────────────────────────────────────────
-- ACTIVITY LOG  (shared engagement log for both recruiters and talents —
-- logins/re-entries, directory searches, profile submissions, etc.)
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
-- No public policies — written only via service-role key from route handlers.

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

-- ─────────────────────────────────────────────────────────────
-- TAKEDOWN REQUESTS  (Talent-initiated "remove me" requests — must be
-- actioned within 30 days per privacy policy)
-- ─────────────────────────────────────────────────────────────
create table if not exists takedown_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  email         text not null,
  message       text,
  status        text not null default 'pending'
                check (status in ('pending', 'resolved')),
  resolved_at   timestamptz
);

create index if not exists takedown_requests_status_idx on takedown_requests (status);

alter table takedown_requests enable row level security;
-- No public policies: inserts (from the public /remove-me form) and reads
-- (from /admin) both go through the service-role key server-side.

-- ─────────────────────────────────────────────────────────────
-- RETENTION — scheduled purge / anonymization jobs
--
-- Requires the pg_cron extension. Enable it once in the Supabase dashboard:
-- Database → Extensions → search "pg_cron" → Enable. Then run the two
-- schedule statements below (they're idempotent-safe to re-run).
-- ─────────────────────────────────────────────────────────────

-- create extension if not exists pg_cron;

-- Intro request records: keep 3 years for moderation/audit purposes, then delete.
-- select cron.schedule(
--   'purge-old-intro-requests',
--   '0 3 1 * *',  -- 03:00 on the 1st of every month
--   $$ delete from intro_requests where created_at < now() - interval '3 years'; $$
-- );

-- Recruiter accounts: anonymize (not hard-delete, to preserve intro_requests
-- audit history) after 3 years with no directory activity.
-- select cron.schedule(
--   'anonymize-inactive-recruiters',
--   '0 4 1 * *',  -- 04:00 on the 1st of every month
--   $$
--     update recruiters
--     set full_name = 'Removed recruiter',
--         work_email = concat('removed-', id, '@deleted.alxproconnect'),
--         role_title = null,
--         hiring_focus = null
--     where last_seen_at < now() - interval '3 years';
--   $$
-- );

-- Note: uncomment and run these two `select cron.schedule(...)` statements
-- manually in the SQL editor once pg_cron is enabled — they're left
-- commented here so schema.sql stays safe to re-run during setup.
