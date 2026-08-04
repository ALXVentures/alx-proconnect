"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RecruiterRegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("work_email") || "").trim();

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/directory`,
        data: {
          full_name: String(form.get("full_name") || "").trim(),
          company: String(form.get("company") || "").trim(),
          role_title: String(form.get("role_title") || "").trim(),
          work_email: email,
          hiring_focus: String(form.get("hiring_focus") || "").trim(),
        },
      },
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    setSent(true);
    setSubmitting(false);
  }

  if (sent) {
    return (
      <Shell>
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal-hi mb-4">
          Check your inbox
        </p>
        <h1 className="font-display text-3xl md:text-4xl leading-tight">
          We sent you a sign-in link
        </h1>
        <p className="mt-4 text-text-lo max-w-md">
          Click the link in your email to verify your account and land in the
          directory. No password needed.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal-hi mb-4">
        For recruiters &amp; founders
      </p>
      <h1 className="font-display text-3xl md:text-4xl leading-tight">
        Register to browse the directory
      </h1>
      <p className="mt-4 text-text-lo max-w-md">
        Free, always. We'll email you a sign-in link — no password to
        remember.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5 max-w-md">
        <Field label="Full name" name="full_name" required />
        <Field label="Company" name="company" required />
        <Field label="Role / title" name="role_title" />
        <Field label="Work email" name="work_email" type="email" required />
        <div>
          <label className="dark-label" htmlFor="hiring_focus">
            What roles are you hiring for? (optional)
          </label>
          <input
            id="hiring_focus"
            name="hiring_focus"
            className="dark-input"
            placeholder="e.g. Frontend engineers, UI/UX designers"
          />
        </div>

        {error && (
          <p className="font-mono text-sm text-rose bg-rose/10 border border-rose/30 rounded-md px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto font-mono text-sm tracking-wide uppercase bg-teal text-text-hi px-8 py-3.5 rounded-md hover:bg-teal-hi transition-colors disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send sign-in link"}
        </button>
      </form>

      <p className="mt-6 font-mono text-[11px] text-text-lo">
        Already registered?{" "}
        <Link href="/recruiters/login" className="underline hover:text-teal-hi">
          Sign in
        </Link>
      </p>

      <style jsx global>{`
        .dark-label {
          display: block;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-lo);
          margin-bottom: 6px;
        }
        .dark-input {
          width: 100%;
          background: var(--ink-2);
          border: 1px solid var(--ink-line);
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          color: var(--text-hi);
        }
        .dark-input:focus {
          border-color: var(--teal-hi);
        }
      `}</style>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-ink text-text-hi">
      <header className="max-w-2xl mx-auto px-6 md:px-0 pt-8">
        <Link href="/" className="font-display text-lg tracking-tight">
          ALX <span className="text-teal-hi">ProConnect</span>
        </Link>
      </header>
      <div className="max-w-2xl mx-auto px-6 md:px-0 pt-12 pb-24">{children}</div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="dark-label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type={type} required={required} className="dark-input" />
    </div>
  );
}
