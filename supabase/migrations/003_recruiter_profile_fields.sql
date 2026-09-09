-- ALX ProConnect — Migration 003: richer recruiter/company profile fields
-- Run this in the SQL Editor of your Supabase project (safe to re-run —
-- every column add is guarded with IF NOT EXISTS).

alter table recruiters add column if not exists company_website text;
alter table recruiters add column if not exists industry text;
alter table recruiters add column if not exists company_size text;
alter table recruiters add column if not exists linkedin_url text;
