"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function RecruiterEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/directory";

  const [email, setEmail] = useState("");
  const [needsDetails, setNeedsDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: Record<string, string>) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/recruiters/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      if (data.needsDetails) {
        setNeedsDetails(true);
        setSubmitting(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit({ email });
  }

  function handleDetailsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    submit({
      email,
      full_name: String(form.get("full_name") || ""),
      company: String(form.get("company") || ""),
      role_title: String(form.get("role_title") || ""),
      hiring_focus: String(form.get("hiring_focus") || ""),
    });
  }

  if (needsDetails) {
    return (
      <form onSubmit={handleDetailsSubmit} className="mt-10 space-y-5 max-w-md">
        <p className="font-mono text-[11px] text-text-lo">
          First time here — takes 30 seconds, then straight into the directory.
        </p>
        <Field label="Full name" name="full_name" required />
        <Field label="Company" name="company" required />
        <Field label="Role / title" name="role_title" />
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

        {error && <ErrorBox message={error} />}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto font-mono text-sm tracking-wide uppercase bg-teal text-text-hi px-8 py-3.5 rounded-md hover:bg-teal-hi transition-colors disabled:opacity-50"
        >
          {submitting ? "Continuing…" : "Continue to directory"}
        </button>
        <style jsx global>{styles}</style>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="mt-10 space-y-5 max-w-md">
      <div>
        <label className="dark-label" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="dark-input"
          placeholder="you@company.com"
        />
      </div>

      {error && <ErrorBox message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto font-mono text-sm tracking-wide uppercase bg-teal text-text-hi px-8 py-3.5 rounded-md hover:bg-teal-hi transition-colors disabled:opacity-50"
      >
        {submitting ? "Checking…" : "Continue"}
      </button>
      <p className="font-mono text-[11px] text-text-lo">
        No password, no account — just this once. Return anytime with the
        same email.
      </p>
      <style jsx global>{styles}</style>
    </form>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="font-mono text-sm text-rose bg-rose/10 border border-rose/30 rounded-md px-4 py-3">
      {message}
    </p>
  );
}

function Field({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="dark-label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} required={required} className="dark-input" />
    </div>
  );
}

const styles = `
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
`;
