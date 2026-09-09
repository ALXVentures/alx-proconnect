"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "501+"];

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
      company_website: String(form.get("company_website") || ""),
      industry: String(form.get("industry") || ""),
      company_size: String(form.get("company_size") || ""),
      role_title: String(form.get("role_title") || ""),
      linkedin_url: String(form.get("linkedin_url") || ""),
      hiring_focus: String(form.get("hiring_focus") || ""),
    });
  }

  if (needsDetails) {
    return (
      <form onSubmit={handleDetailsSubmit} className="mt-10 space-y-8 max-w-md">
        <p className="font-mono text-[11px] text-text-lo -mt-2">
          First time here — takes about a minute, then straight into the
          directory. Return anytime with just your email.
        </p>

        <fieldset className="space-y-5">
          <legend className="font-display text-lg mb-1">Company</legend>
          <Field label="Company name" name="company" required />
          <Field
            label="Company website"
            name="company_website"
            type="url"
            placeholder="https://"
          />
          <Row>
            <Field label="Industry" name="industry" />
            <div>
              <label className="dark-label" htmlFor="company_size">
                Company size
              </label>
              <select id="company_size" name="company_size" className="dark-input">
                <option value="">Select…</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} employees
                  </option>
                ))}
              </select>
            </div>
          </Row>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-display text-lg mb-1">You</legend>
          <Field label="Full name" name="full_name" required />
          <Row>
            <Field label="Current position" name="role_title" />
            <Field label="LinkedIn (optional)" name="linkedin_url" type="url" placeholder="https://" />
          </Row>
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
        </fieldset>

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

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-5">{children}</div>;
}

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="dark-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="dark-input"
      />
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
