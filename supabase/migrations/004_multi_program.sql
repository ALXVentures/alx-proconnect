-- ALX ProConnect — Migration 004: multiple programs per Talent
-- Run this in the SQL Editor. Converts the single `program` text column
-- into a `programs` text array, carrying over existing values, then drops
-- the old column. Safe to re-run — the column-add and data copy are both
-- guarded.

alter table talents add column if not exists programs text[] not null default '{}';

-- Carry over any existing single-program values into the new array column
-- (only touches rows where programs hasn't already been populated).
update talents
set programs = array[program]
where program is not null and (programs = '{}' or programs is null);

alter table talents drop column if exists program;

create index if not exists talents_programs_idx on talents using gin (programs);
