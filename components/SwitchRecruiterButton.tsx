"use client";

import { useRouter } from "next/navigation";

export function SwitchRecruiterButton() {
  const router = useRouter();

  async function handleClick() {
    await fetch("/api/recruiters/exit", { method: "POST" });
    router.push("/recruiters");
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      className="hover:text-teal-hi transition-colors underline underline-offset-2"
    >
      Not you? Switch email
    </button>
  );
}
