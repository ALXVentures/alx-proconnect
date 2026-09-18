-- ALX ProConnect — Migration 005: remove program selection entirely
-- Run this in the SQL Editor. Drops the `programs` column (and its index)
-- from `talents` — the team decided to stop collecting program at
-- profile-submission time. This is destructive to any existing program
-- data on talent rows; there's no way to undo it after running.

drop index if exists talents_programs_idx;
alter table talents drop column if exists programs;
