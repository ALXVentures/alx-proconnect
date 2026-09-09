import Link from "next/link";
import { ApplyForm } from "@/components/ApplyForm";

export default function ApplyPage() {
  return (
    <main className="paper flex-1 bg-paper text-text-ink">
      <header className="max-w-2xl mx-auto px-6 md:px-0 pt-8 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-tight text-text-ink">
          ALX <span className="text-brass">ProConnect</span>
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-widest text-text-ink-lo">
          Applicant profile
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-6 md:px-0 pt-12 pb-24">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass mb-4">
          Portfolio Showcase graduates only
        </p>
        <h1 className="font-display text-3xl md:text-4xl leading-tight text-text-ink">
          Set up your recruiter-facing profile
        </h1>
        <p className="mt-4 text-text-ink-lo max-w-lg">
          This is separate from your original Showcase application — tell us
          how you want to be introduced to recruiters. A team member reviews
          every submission before it goes live.
        </p>

        <div className="mt-12">
          <ApplyForm />
        </div>
      </div>
    </main>
  );
}
