"use client";

import { useState } from "react";

export function TakedownForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/takedown-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        message: form.get("message"),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-10">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass mb-3">
          Request received
        </p>
        <h2 className="font-display text-2xl text-text-ink">
          We'll act on this within 30 days
        </h2>
        <p className="mt-3 text-text-ink-lo">
          The FLA team will remove your profile and confirm once it's done.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-5 max-w-md">
      <div>
        <label className="field-label" htmlFor="email">
          Email you used on your profile
        </label>
        <input id="email" name="email" type="email" required className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="message">
          Anything else we should know? (optional)
        </label>
        <textarea id="message" name="message" rows={3} className="field-input resize-none" />
      </div>

      {error && (
        <p className="font-mono text-sm text-rose bg-rose/10 border border-rose/30 rounded-md px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto font-mono text-sm tracking-wide uppercase bg-ink text-text-hi px-8 py-3.5 rounded-md hover:bg-ink-2 transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Request removal"}
      </button>

      <style jsx global>{`
        .field-label {
          display: block;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-ink-lo);
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          background: var(--paper);
          border: 1px solid var(--paper-line);
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          color: var(--text-ink);
        }
        .field-input:focus {
          border-color: var(--brass);
        }
      `}</style>
    </form>
  );
}
