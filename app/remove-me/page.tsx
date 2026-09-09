import Link from "next/link";
import { TakedownForm } from "@/components/TakedownForm";

export default function RemoveMePage() {
  return (
    <main className="paper flex-1 bg-paper text-text-ink">
      <header className="max-w-2xl mx-auto px-6 md:px-0 pt-8 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-tight text-text-ink">
          ALX <span className="text-brass">ProConnect</span>
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-widest text-text-ink-lo">
          Remove my profile
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-6 md:px-0 pt-12 pb-24">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass mb-4">
          Talent profile removal
        </p>
        <h1 className="font-display text-3xl md:text-4xl leading-tight text-text-ink">
          Ask us to take your profile down
        </h1>
        <p className="mt-4 text-text-ink-lo max-w-lg">
          Tell us the email your profile is under and we'll remove it from
          the directory and delete your personal data within 30 days.
        </p>

        <TakedownForm />
      </div>
    </main>
  );
}
