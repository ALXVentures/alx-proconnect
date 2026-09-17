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

## Branding notes

- **Logo:** `public/alx-ventures-logo.png` (navy/gold, for light "paper"
  pages like `/apply`) and `public/alx-ventures-logo-light.png` (white/gold,
  for the dark pages). I generated the light variant myself — the navy in
  your source file only had ~1.8:1 contrast against our dark background
  (essentially invisible), so I recolored the navy strokes to off-white
  while keeping the gold "+" untouched. If ALX Ventures has an official
  reversed/white logo, swap it in instead.
- **Color:** `app/globals.css` now runs on your actual brand hex values.
  One adjustment worth knowing about: `Jasmine Yellow` (#FDE791) is used
  at full brightness everywhere it sits on a dark background, but a few
  spots use it as *text on the light paper pages* (the "Portfolio Showcase
  graduates only" eyebrow label, for instance) — full Jasmine there is
  nearly unreadable against a near-white background, so those spots use a
  darkened, same-hue gold (`--brass`, #C8A004) instead. Same logic applies
  to Jungle Green buttons, which use dark text rather than white — white
  text on Jungle Green only hit 2.4:1 contrast.
- **Font:** Poppins, loaded for both headings and body text. IBM Plex Mono
  is kept for the small numeric/label accents (scores, tags, nav) since
  Poppins has no monospace variant and that contrast is part of the site's
  visual language.
- **`/talent`** is a placeholder page — "Talent Log in" needed a real
  destination and the actual dashboard (view counts, self-edit) is queued
  as the next build item, not built yet.

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
3. [`supabase/migrations/004_multi_program.sql`](./supabase/migrations/004_multi_program.sql) —
   converts `talents.program` (single value) into `talents.programs` (an
   array), carrying over your existing test row's value before dropping
   the old column. **Run this one before deploying the new code** — the
   updated app queries `programs`, not `program`, so the old column name
   will 404/500 until this runs.

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
4. Under **Environment Variables**, add all the variables
   from `.env.local`, including the Gmail API ones below.
5. Deploy. No Supabase Auth URL configuration needed — there's no
   magic-link redirect to worry about since recruiters and Talent never
   hold a Supabase session.

Vercel's free Hobby tier covers this comfortably for V1 traffic. One thing
worth knowing: Hobby's terms of service are scoped to non-commercial,
personal use — ALX isn't charging recruiters or applicants, so this should
be fine, but it's worth keeping in mind if the product ever adds paid
placements.

## 5. Set up email (Gmail API, reusing PeerFinder's OAuth credential)

The "notify Talent" and "send to my email" features send through the same
OAuth client + refresh token that already powers PeerFinder's match
notifications — no Workspace admin step, no domain-wide delegation,
nothing new to authorize. The refresh token is tied to whichever Google
account did the original "sign in with Google" consent (for this project,
`programs@alx-ventures.com`), and `googleapis` handles exchanging it for a
fresh access token automatically, the same way it already does for
PeerFinder.

1. From PeerFinder's stored OAuth credentials, pull three values into env
   vars:
   - `client_id` → `GOOGLE_OAUTH_CLIENT_ID`
   - `client_secret` → `GOOGLE_OAUTH_CLIENT_SECRET`
   - `refresh_token` → `GOOGLE_OAUTH_REFRESH_TOKEN`
2. Set `GMAIL_SENDER` to **exactly** the email address that granted the
   original OAuth consent — `programs@alx-ventures.com` for this project.
   This has to match precisely (or be a verified "send as" alias of that
   account); Gmail rejects or silently rewrites a From header that doesn't
   match the authenticated account.
3. Set `APP_URL` to your production URL — it's used for the "Request
   removal" link in the Talent notification email.

**Worth knowing:** this couples ProConnect's email sending to PeerFinder's
credential — if that refresh token is ever rotated or revoked for
PeerFinder-specific reasons, ProConnect's emails stop working too, and
vice versa. Fine for now with one person maintaining both, but worth a
mental note if either project changes hands. Also worth confirming with
whoever owns `programs@alx-ventures.com` that they're expecting
ProConnect's automated traffic mixed in with PeerFinder's.

**Never commit these values to the repo or paste them in chat/Slack** —
set them directly in Vercel's environment variable fields (and your local
`.env.local`, which is gitignored).

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

## How the select-a-profile flow works

No admin approval gate here — this is a deliberate change from the original
"gated intro request" design, worth flagging to legal (see note at the
bottom of this section):

1. A recruiter clicks "View full profile" on a directory card →
   `/directory/[id]`.
2. That page load *is* the "selection" event. Server-side, it tries to
   insert a row into `intro_requests` (`recruiter_id` + `talent_id`, unique
   together). If the insert succeeds, this is the first time this recruiter
   has viewed this talent — the Talent gets an immediate email
   (`sendTalentSelectedEmail`) and a `profile_selected` activity row is
   logged. If the insert hits the unique conflict (they've viewed this
   profile before), nothing fires again — visiting the same profile twice
   doesn't spam the Talent a second time.
3. The page displays the full profile **including contact details**
   (email, phone, portfolio, LinkedIn) directly on screen.
4. From there, two more actions, each independently logged to
   `activity_log`:
   - **Send to my email** (`profile_emailed`) — emails the profile to the
     recruiter's *own* registered address (looked up server-side from
     their cookie, not a client-supplied address, so it can't be spoofed).
   - **Download as PDF** (`profile_downloaded`) — generates a one-page PDF
     with `pdf-lib` and streams it as a file download.

**Worth a legal check-in:** the earlier privacy policy draft said contact
details are shared "when ALX approves" an intro request. That approval
step no longer exists in this flow — contact info is shown/sent
automatically the moment a recruiter selects a profile, matching what you
and Belinda decided in the meeting, but it means that clause needs
updating (drop "and ALX approves it") before this goes live for real
Talent data.

## How the pieces fit together

| Route | Who | What it does |
|---|---|---|
| `/` | Everyone | Landing page, splits into the two flows |
| `/apply` | Applicants | Profile intake form → saved as `pending` |
| `/recruiters` | Recruiters | Email capture (new) or re-entry (returning) → sets cookie → directory |
| `/directory` | Recruiters (cookie + DB check) | Search/filter published profiles |
| `/directory/[id]` | Recruiters | Full profile view (contact info shown), triggers Talent notification, "send to email" / "download PDF" |
| `/admin` | FLA team (passcode) | Approve/reject pending profiles, set the showcase score |
| `/remove-me` | Talent | Request profile takedown |

**Data flow**, matching the ProConnect doc: a talent submits their profile →
it lands as `pending` → the FLA team reviews it in `/admin` and, if
approved, sets its score and flips it to `published` → it now appears in the
recruiter directory → a recruiter viewing a profile writes to
`intro_requests`, notifies the Talent by email, and logs the activity —
all on the first view of that profile.

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

- **Proper admin roles.** The `/admin` passcode is a shared secret — fine
  for a two-or-three-person team moving fast, but worth upgrading to
  Supabase Auth + a `role` column if the team grows.
- **Applicant self-edit / dashboard.** Applicants currently can't update
  their own profile or see how many recruiters have viewed it — that's
  the next build item (Talent-side sign-in + the delayed status pop-up).
- **Country code selector, headshot upload error fix, and the Privacy
  Policy / Terms of Use links** — still on the list from the last
  planning session, not yet built.
- **Email polish.** Worth adding a plain-text fallback alongside the HTML
  email body, and possibly a "why am I getting this" line for Talent who
  may not remember submitting their profile. Also worth watching Gmail's
  per-user sending limits (roughly 2,000/day on Workspace) if volume ever
  grows well past V1 scale — not a concern yet, just a future check-in.
