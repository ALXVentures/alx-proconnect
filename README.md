# ALX ProConnect — V1

A curated talent directory connecting vetted ALX Freelancer Academy graduates
(scored ≥4.6 on the Portfolio Showcase judging rubric) with recruiters and
founders, who browse and self-serve rather than going through a manual
per-request process.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres, Storage) · Tailwind v4
Deployed frontend on Vercel; database and file storage on Supabase — both free tier.
Recruiters and Talent have no accounts/passwords — just a lightweight email
capture (see "How recruiter access works" below).

---

## Already have this deployed? Run the migration, not the full schema

If you already ran `supabase/schema.sql` on a live project (i.e. you did the
original setup and tested a profile submission), **don't re-run
`schema.sql`** — it won't touch existing tables. Instead, run these two
migrations in order in the SQL Editor:

1. [`supabase/migrations/002_recruiter_lightweight_flow.sql`](./supabase/migrations/002_recruiter_lightweight_flow.sql) —
   rebuilds `recruiters` and `intro_requests` for the no-signin model, adds
   `activity_log`. Your `talents` data is untouched.
2. [`supabase/migrations/003_recruiter_profile_fields.sql`](./supabase/migrations/003_recruiter_profile_fields.sql) —
   adds `company_website`, `industry`, `company_size`, and the recruiter's
   own `linkedin_url` to `recruiters` (all nullable — safe to run anytime,
   won't affect existing rows).

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project. Use the ALX
   company email (matches how you set up the AWS access originally, keeps
   ownership with the org rather than a personal account).
2. Once it's provisioned, open **SQL Editor → New query**, paste the entire
   contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it.
   This creates the `talents`, `recruiters`, `intro_requests`, and
   `activity_log` tables, all
   Row Level Security policies, and the public `headshots` storage bucket.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret —
     it bypasses Row Level Security and is only ever used server-side)

   Nothing else from Supabase Auth needs configuring — recruiters and
   Talent never get a Supabase account, so there's no anon key, no
   redirect URLs, no email templates to set up.

## 2. Configure environment variables

Copy the template and fill in the four values from above, plus your own
admin passcode (this gates `/admin`, the moderation queue — treat it like a
shared team password):

```bash
cp .env.local.example .env.local
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Try the applicant flow at `/apply`, then check
`/admin` (using your `ADMIN_PASSCODE`) to approve it — only then will it show
up in the directory. Try the recruiter flow at `/recruiters`: enter an
email, fill in name/company on first visit, and you're dropped straight
into `/directory`. Clear cookies (or use "Not you? Switch email") and
re-enter the same email to confirm the returning-recruiter path skips the
extra fields.

## 4. Deploy to Vercel

1. Push this repo to GitHub (a private repo is fine; Vercel just needs read access).
2. On [vercel.com](https://vercel.com), **New Project → Import** the repo.
3. Framework preset auto-detects Next.js — no changes needed.
4. Under **Environment Variables**, add the same three variables
   from `.env.local`.
5. Deploy. No Supabase Auth URL configuration needed — there's no
   magic-link redirect to worry about since recruiters and Talent never
   hold a Supabase session.

Vercel's free Hobby tier covers this comfortably for V1 traffic. One thing
worth knowing: Hobby's terms of service are scoped to non-commercial,
personal use — ALX isn't charging recruiters or applicants, so this should
be fine, but it's worth keeping in mind if the product ever adds paid
placements.

## How recruiter access works

No accounts, no passwords — this was a deliberate call to cut friction for
recruiters:

1. First visit to `/recruiters`: enter a work email. If it's new, fill in
   name + company (one-time). `POST /api/recruiters/continue` upserts the
   `recruiters` row and sets an httpOnly cookie (`alx_recruiter`, 180-day
   expiry) holding that recruiter's id.
2. `proxy.ts` guards `/directory` with a **cheap cookie-presence check**
   only (no database call at the edge, so it's fast).
3. `/directory` itself (a server component, full Node runtime) does the
   **real check**: looks up that id in `recruiters`. If the row is gone —
   stale cookie, or the row was purged by the 3-year inactivity job — it
   redirects back to `/recruiters` to re-capture, rather than trusting the
   cookie blindly.
4. Returning recruiters just re-enter their email on `/recruiters`; since
   it already exists, they skip straight to the directory and their
   `last_seen_at` is refreshed.
5. Every successful entry into the directory (first-time or returning)
   logs an `activity_log` row (`actor_type: 'recruiter'`,
   `action: 'search_directory'`) — this is your visit-counting /
   engagement-tracking table. Talent-side events (`profile_submitted` so
   far) land in the same table, so you can query both from one place.

## How the pieces fit together

| Route | Who | What it does |
|---|---|---|
| `/` | Everyone | Landing page, splits into the two flows |
| `/apply` | Applicants | Profile intake form → saved as `pending` |
| `/recruiters` | Recruiters | Email capture (new) or re-entry (returning) → sets cookie → directory |
| `/directory` | Recruiters (cookie + DB check) | Search/filter published profiles, request intros |
| `/admin` | FLA team (passcode) | Approve/reject pending profiles, set the showcase score |
| `/remove-me` | Talent | Request profile takedown |

**Data flow**, matching the ProConnect doc: a talent submits their profile →
it lands as `pending` → the FLA team reviews it in `/admin` and, if
approved, sets its score and flips it to `published` → it now appears in the
recruiter directory → a recruiter's "Request intro" click writes to
`intro_requests` for the team to action, and logs an `intro_request`
activity event.

## Privacy & data retention

Built to match the policy legal is drafting:

- **`/remove-me`** — a public form where Talent can request their profile be
  taken down. It writes to `takedown_requests`, which shows up in `/admin`
  with a running day-count against the **30-day SLA** (the badge turns red
  at day 25 so the team doesn't miss it). Marking a request "removed"
  anonymizes the matching `talents` row (name, email, bio, links, headshot
  all cleared, status set to `removed`) rather than hard-deleting it —
  this satisfies the erasure request while keeping the row's `id` intact so
  historical `intro_requests` referencing it stay valid for the audit
  retention period.
- **3-year retention, then purge/anonymize**, for `intro_requests` records
  and inactive `recruiters` accounts (inactivity measured by `last_seen_at`,
  refreshed on every directory visit) — implemented as commented-out
  `pg_cron` schedules at the bottom of `supabase/schema.sql`. Enable the
  `pg_cron` extension in the Supabase dashboard (Database → Extensions),
  then uncomment and run the two `cron.schedule(...)` statements once.
- **Talent → Recruiter notification on approved intro requests** is still a
  manual step in V1 (the FLA team sees pending requests and follows up),
  not yet an automated email — see below.

## What's intentionally deferred to V2

- **Automated intro emails**, both directions: notifying a Talent when
  their contact is actually shared with a recruiter, and notifying a
  recruiter once approved. Right now both are logged in `intro_requests`
  for the FLA team to action manually. Wiring up automatic email (e.g. via
  Resend, triggered when an admin marks a request `sent`) is a small,
  self-contained addition once V1 is validated — flagged as a policy
  commitment worth building toward soon, since the draft privacy policy
  already describes this as automatic.
- **Proper admin roles.** The `/admin` passcode is a shared secret — fine
  for a two-or-three-person team moving fast, but worth upgrading to
  Supabase Auth + a `role` column if the team grows.
- **Applicant self-edit.** Applicants currently can't update their own
  profile after submitting; for now, ask the FLA team to edit directly in
  the Supabase table editor.
