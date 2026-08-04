"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export type PendingTalent = {
  id: string;
  full_name: string;
  email: string;
  country: string;
  program: string;
  one_liner: string;
  bio: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  headshot_url: string | null;
  skill_tags: string[];
};

export function ModerationQueue({ talents }: { talents: PendingTalent[] }) {
  if (talents.length === 0) {
    return (
      <p className="font-mono text-sm text-text-lo py-16 text-center border border-dashed border-ink-line rounded-lg">
        Nothing waiting for review.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {talents.map((t) => (
        <QueueCard key={t.id} talent={t} />
      ))}
    </div>
  );
}

function QueueCard({ talent }: { talent: PendingTalent }) {
  const router = useRouter();
  const [score, setScore] = useState("4.6");
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        talent_id: talent.id,
        action,
        showcase_score: action === "approve" ? parseFloat(score) : undefined,
      }),
    });
    router.refresh();
  }

  return (
    <div className="bg-ink-2 border border-ink-line rounded-xl p-6 flex flex-col md:flex-row gap-6">
      <div className="flex gap-4 flex-1 min-w-0">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-ink-3 shrink-0">
          {talent.headshot_url && (
            <Image
              src={talent.headshot_url}
              alt={talent.full_name}
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-display text-xl">{talent.full_name}</div>
          <div className="font-mono text-[11px] text-text-lo">
            {talent.email} · {talent.country} · {talent.program}
          </div>
          <p className="mt-2 text-sm text-text-lo">{talent.one_liner}</p>
          {talent.bio && <p className="mt-2 text-sm text-text-lo">{talent.bio}</p>}
          {talent.skill_tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {talent.skill_tags.map((s) => (
                <span
                  key={s}
                  className="font-mono text-[10px] uppercase bg-ink px-2 py-1 rounded text-text-lo"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-4">
            {talent.portfolio_url && (
              <a
                href={talent.portfolio_url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] underline text-text-lo hover:text-brass-hi"
              >
                Portfolio ↗
              </a>
            )}
            {talent.linkedin_url && (
              <a
                href={talent.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] underline text-text-lo hover:text-brass-hi"
              >
                LinkedIn ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex md:flex-col gap-3 md:w-44 shrink-0">
        <div>
          <label className="font-mono text-[10px] uppercase text-text-lo block mb-1">
            Showcase score
          </label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full bg-ink border border-ink-line rounded-md px-3 py-2 text-sm font-mono"
          />
        </div>
        <button
          onClick={() => act("approve")}
          disabled={busy}
          className="font-mono text-xs uppercase tracking-wide rounded-md py-2.5 bg-teal hover:bg-teal-hi transition-colors disabled:opacity-50"
        >
          Publish
        </button>
        <button
          onClick={() => act("reject")}
          disabled={busy}
          className="font-mono text-xs uppercase tracking-wide rounded-md py-2.5 border border-ink-line hover:border-rose hover:text-rose transition-colors disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
