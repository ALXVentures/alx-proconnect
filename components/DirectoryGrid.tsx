"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ScoreMeter } from "./ScoreMeter";

export type Talent = {
  id: string;
  full_name: string;
  country: string;
  city: string | null;
  program: string;
  skill_tags: string[];
  one_liner: string;
  portfolio_url: string | null;
  linkedin_url: string | null;
  headshot_url: string | null;
  showcase_score: number | null;
};

export function DirectoryGrid({
  talents,
  requestedIds,
}: {
  talents: Talent[];
  requestedIds: Set<string>;
}) {
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("all");

  const allSkills = useMemo(() => {
    const s = new Set<string>();
    talents.forEach((t) => t.skill_tags.forEach((tag) => s.add(tag)));
    return Array.from(s).sort();
  }, [talents]);

  const filtered = talents.filter((t) => {
    const matchesQuery =
      query.trim() === "" ||
      t.full_name.toLowerCase().includes(query.toLowerCase()) ||
      t.one_liner.toLowerCase().includes(query.toLowerCase()) ||
      t.skill_tags.some((s) => s.toLowerCase().includes(query.toLowerCase()));
    const matchesSkill = skill === "all" || t.skill_tags.includes(skill);
    return matchesQuery && matchesSkill;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, skill, or pitch…"
          className="flex-1 bg-ink-2 border border-ink-line rounded-md px-4 py-2.5 text-sm focus:border-teal-hi"
        />
        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="bg-ink-2 border border-ink-line rounded-md px-4 py-2.5 text-sm font-mono focus:border-teal-hi"
        >
          <option value="all">All skills</option>
          {allSkills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="font-mono text-sm text-text-lo py-16 text-center border border-dashed border-ink-line rounded-lg">
          No profiles match that search yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <TalentCard key={t.id} talent={t} alreadyRequested={requestedIds.has(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TalentCard({
  talent,
  alreadyRequested,
}: {
  talent: Talent;
  alreadyRequested: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    alreadyRequested ? "sent" : "idle"
  );

  async function requestIntro() {
    setStatus("sending");
    try {
      const res = await fetch("/api/intro-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talent_id: talent.id }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="bg-ink-2 border border-ink-line rounded-xl p-5 flex flex-col">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-ink-3 shrink-0">
          {talent.headshot_url && (
            <Image
              src={talent.headshot_url}
              alt={talent.full_name}
              fill
              sizes="48px"
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-display text-lg leading-tight truncate">
            {talent.full_name}
          </div>
          <div className="font-mono text-[11px] text-text-lo truncate">
            {[talent.city, talent.country].filter(Boolean).join(", ")} ·{" "}
            {talent.program}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-text-lo leading-snug">{talent.one_liner}</p>

      {talent.skill_tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {talent.skill_tags.slice(0, 4).map((s) => (
            <span
              key={s}
              className="font-mono text-[10px] uppercase tracking-wide bg-ink px-2 py-1 rounded text-text-lo"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        <ScoreMeter value={talent.showcase_score} tone="teal" compact />
      </div>

      <div className="mt-4 flex items-center gap-3">
        {talent.portfolio_url && (
          <a
            href={talent.portfolio_url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] underline underline-offset-2 text-text-lo hover:text-teal-hi"
          >
            Portfolio
          </a>
        )}
        {talent.linkedin_url && (
          <a
            href={talent.linkedin_url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] underline underline-offset-2 text-text-lo hover:text-teal-hi"
          >
            LinkedIn
          </a>
        )}
      </div>

      <button
        onClick={requestIntro}
        disabled={status === "sending" || status === "sent"}
        className="mt-5 w-full font-mono text-xs uppercase tracking-wide rounded-md py-2.5 transition-colors bg-teal text-text-hi hover:bg-teal-hi disabled:opacity-60 disabled:cursor-default"
      >
        {status === "sent"
          ? "Intro requested ✓"
          : status === "sending"
          ? "Sending…"
          : status === "error"
          ? "Try again"
          : "Request intro"}
      </button>
    </div>
  );
}
