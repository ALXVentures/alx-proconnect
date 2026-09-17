"use client";

import { useState } from "react";

export function TalentProfileActions({ talentId }: { talentId: string }) {
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendToEmail() {
    setEmailStatus("sending");
    try {
      const res = await fetch(`/api/directory/${talentId}/send-email`, { method: "POST" });
      if (!res.ok) throw new Error();
      setEmailStatus("sent");
    } catch {
      setEmailStatus("error");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={sendToEmail}
        disabled={emailStatus === "sending" || emailStatus === "sent"}
        className="font-mono text-xs uppercase tracking-wide rounded-md px-6 py-3 bg-teal text-ink hover:bg-teal-hi transition-colors disabled:opacity-60"
      >
        {emailStatus === "sent"
          ? "Sent to your email ✓"
          : emailStatus === "sending"
          ? "Sending…"
          : emailStatus === "error"
          ? "Try again"
          : "Send to my email"}
      </button>
      <a
        href={`/api/directory/${talentId}/pdf`}
        className="font-mono text-xs uppercase tracking-wide rounded-md px-6 py-3 border border-ink-line hover:border-teal-hi hover:text-teal-hi transition-colors text-center"
      >
        Download as PDF
      </a>
    </div>
  );
}
