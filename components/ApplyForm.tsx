"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";
import { SKILL_OPTIONS } from "@/lib/skills";

export function ApplyForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headshotName, setHeadshotName] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set("skill_tags", skills.join(","));

    try {
      const res = await fetch("/api/apply", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      router.push("/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-8"
      encType="multipart/form-data"
    >
      <div className="bg-brass/10 border border-brass/30 rounded-md px-4 py-3.5">
        <p className="font-mono text-[11px] uppercase tracking-wide text-brass mb-1">
          Invite-only
        </p>
        <p className="text-sm text-text-ink-lo">
          ProConnect profiles are by invitation only. If you weren't
          specifically invited by the FLA team to submit a profile, it
          won't be approved — reach out to your program team first if
          you're not sure.
        </p>
      </div>

      <Fieldset legend="About you">
        <Field label="Full name" name="full_name" required autoComplete="name" />
        <Row>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="the email you used to register for your ALX program"
              className="field-input"
            />
            <p className="mt-1.5 font-mono text-[11px] text-text-ink-lo">
              Use the same email you registered with ALX — the FLA team
              matches it against your program record to approve you.
            </p>
          </div>
          <Field label="Phone / WhatsApp" name="phone" autoComplete="tel" />
        </Row>
        <Row>
          <Field label="Country" name="country" required autoComplete="country-name" />
          <Field label="City" name="city" />
        </Row>
      </Fieldset>

      <Fieldset legend="Your pitch">
        <Field
          label="One-line value proposition"
          name="one_liner"
          required
          placeholder="e.g. Frontend developer turning Figma files into fast, accessible React apps"
          maxLength={140}
        />
        <MultiSelectDropdown
          label="Skills"
          theme="light"
          options={SKILL_OPTIONS}
          selected={skills}
          onChange={setSkills}
          placeholder="Select all that apply"
        />
        <div>
          <label className="field-label" htmlFor="bio">
            Short bio (optional)
          </label>
          <textarea id="bio" name="bio" rows={4} className="field-input resize-none" />
        </div>
      </Fieldset>

      <Fieldset legend="Links & photo">
        <Row>
          <Field label="Portfolio link" name="portfolio_url" type="url" required />
          <Field label="LinkedIn link" name="linkedin_url" type="url" />
        </Row>
        <div>
          <label className="field-label" htmlFor="headshot">
            Headshot
          </label>
          <input
            id="headshot"
            name="headshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            onChange={(e) => setHeadshotName(e.target.files?.[0]?.name ?? null)}
            className="block w-full font-mono text-xs text-text-ink-lo file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-ink file:text-text-hi file:font-mono file:text-xs hover:file:bg-ink-2 file:cursor-pointer cursor-pointer"
          />
          <p className="mt-1.5 font-mono text-[11px] text-text-ink-lo">
            {headshotName ? `Selected: ${headshotName}` : "JPG, PNG or WebP — under 5MB"}
          </p>
        </div>
      </Fieldset>

      {error && (
        <p className="font-mono text-sm text-rose bg-rose/10 border border-rose/30 rounded-md px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto font-mono text-sm tracking-wide uppercase bg-ink text-text-hi px-8 py-3.5 rounded-md hover:bg-ink-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit for review"}
      </button>
      <p className="font-mono text-[11px] text-text-ink-lo">
        The FLA team reviews every submission before it's published to
        recruiters.
      </p>

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

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-5">
      <legend className="font-display text-xl mb-1 text-text-ink">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-5">{children}</div>;
}

function Field({
  label,
  name,
  type = "text",
  required,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="field-input"
        {...rest}
      />
    </div>
  );
}
