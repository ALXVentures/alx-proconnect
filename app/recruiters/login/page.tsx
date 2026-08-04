"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RecruiterLoginPage() {
  return (
    <Suspense fallback={null}>
      <RecruiterLoginForm />
    </Suspense>
  );
}

function RecruiterLoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/directory";
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const email = String(new FormData(e.currentTarget).get("email") || "").trim();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
        shouldCreateUser: false,
      },
    });

    if (error) {
      setError(
        error.message.includes("Signups not allowed")
          ? "We don't recognize that email yet — register first."
          : error.message
      );
      setSubmitting(false);
      return;
    }
    setSent(true);
    setSubmitting(false);
  }

  return (
    <main className="flex-1 bg-ink text-text-hi flex items-center">
      <div className="max-w-md mx-auto px-6 w-full">
        <Link href="/" className="font-display text-lg tracking-tight">
          ALX <span className="text-teal-hi">ProConnect</span>
        </Link>

        {sent ? (
          <div className="mt-10">
            <h1 className="font-display text-2xl">Check your inbox</h1>
            <p className="mt-3 text-text-lo">
              We sent a sign-in link to your email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <h1 className="font-display text-2xl">Recruiter sign in</h1>
            <div>
              <label className="dark-label" htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="dark-input"
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
              className="w-full font-mono text-sm tracking-wide uppercase bg-teal text-text-hi px-8 py-3.5 rounded-md hover:bg-teal-hi transition-colors disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send sign-in link"}
            </button>
            <p className="font-mono text-[11px] text-text-lo">
              New here?{" "}
              <Link href="/recruiters/register" className="underline hover:text-teal-hi">
                Register
              </Link>
            </p>
          </form>
        )}

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
      </div>
    </main>
  );
}
