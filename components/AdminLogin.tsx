"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not sign in.");
      setSubmitting(false);
      return;
    }
    router.refresh();
  }

  return (
    <main className="flex-1 bg-ink text-text-hi flex items-center">
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto px-6 w-full space-y-5">
        <div>
          <span className="font-display text-lg">
            ALX <span className="text-brass-hi">ProConnect</span>
          </span>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-text-lo">
            Moderation queue
          </p>
        </div>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Admin passcode"
          autoFocus
          className="w-full bg-ink-2 border border-ink-line rounded-md px-4 py-2.5 text-sm focus:border-brass-hi"
        />
        {error && (
          <p className="font-mono text-sm text-rose bg-rose/10 border border-rose/30 rounded-md px-4 py-3">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full font-mono text-sm tracking-wide uppercase bg-brass text-ink px-8 py-3 rounded-md hover:bg-brass-hi transition-colors disabled:opacity-50"
        >
          {submitting ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
