# ALX ProConnect — V1

A curated talent directory connecting vetted ALX Freelancer Academy graduates
(scored ≥4.6 on the Portfolio Showcase judging rubric) with recruiters and
founders, who browse and self-serve rather than going through a manual
per-request process.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres, Auth, Storage) · Tailwind v4
Deployed frontend on Vercel; database and file storage on Supabase — both free tier.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project. Use the ALX
   company email (matches how you set up the AWS access originally, keeps
   ownership with the org rather than a personal account).
2. Once it's provisioned, open **SQL Editor → New query**, paste the entire
   contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it.
   This creates the `talents`, `recruiters`, and `intro_requests` tables, all
   Row Level Security policies, and the public `headshots` storage bucket.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret —
     it bypasses Row Level Security and is only ever used server-side)
4. Go to **Authentication → URL Configuration** and set the **Site URL** to
   your eventual production URL (e.g. `https://alx-proconnect.vercel.app`).
   Add the same URL under **Redirect URLs**, plus `http://localhost:3000/**`
   for local dev. This is what lets the magic-link emails redirect back into
   the app correctly.
5. Optional but recommended: **Authentication → Email Templates** — the
   default "Magic Link" template works, but you can retitle it to say "ALX
   ProConnect" instead of the Supabase default copy.

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
up for a signed-in recruiter at `/directory`.

## 4. Deploy to Vercel

1. Push this repo to GitHub (a private repo is fine; Vercel just needs read access).
2. On [vercel.com](https://vercel.com), **New Project → Import** the repo.
3. Framework preset auto-detects Next.js — no changes needed.
4. Under **Environment Variables**, add the same four (or five) variables
   from `.env.local`.
5. Deploy. Then go back into Supabase's **Auth → URL Configuration** and
   make sure your live Vercel URL is in the Site URL / Redirect URLs list —
   magic links won't redirect correctly otherwise.

Vercel's free Hobby tier covers this comfortably for V1 traffic. One thing
worth knowing: Hobby's terms of service are scoped to non-commercial,
personal use — ALX isn't charging recruiters or applicants, so this should
be fine, but it's worth keeping in mind if the product ever adds paid
placements.

## How the pieces fit together

| Route | Who | What it does |
|---|---|---|
| `/` | Everyone | Landing page, splits into the two flows |
| `/apply` | Applicants | Profile intake form → saved as `pending` |
| `/recruiters/register`, `/recruiters/login` | Recruiters | Passwordless (magic link) sign-up/sign-in |
| `/directory` | Signed-in recruiters | Search/filter published profiles, request intros |
| `/admin` | FLA team (passcode) | Approve/reject pending profiles, set the showcase score |

**Data flow**, matching the ProConnect doc: a talent submits their profile →
it lands as `pending` → the FLA team reviews it in `/admin` and, if
approved, sets its score and flips it to `published` → it now appears in the
recruiter directory → a recruiter's "Request intro" click writes to
`intro_requests` for the team to action.

## What's intentionally deferred to V2

- **Automated intro emails.** Right now an intro request is logged in
  `intro_requests` for the FLA team to follow up on manually, matching the
  "outbound is still human" tone of the original doc. Wiring up an
  automatic email (e.g. via Resend, triggered on `status = 'sent'`) is a
  small, self-contained addition once V1 is validated.
- **Proper admin roles.** The `/admin` passcode is a shared secret — fine
  for a two-or-three-person team moving fast, but worth upgrading to
  Supabase Auth + a `role` column if the team grows.
- **Applicant self-edit.** Applicants currently can't update their own
  profile after submitting; for now, ask the FLA team to edit directly in
  the Supabase table editor.
