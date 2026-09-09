import { Suspense } from "react";
import Link from "next/link";
import { RecruiterEntryForm } from "@/components/RecruiterEntryForm";

export default function RecruitersPage() {
  return (
    <main className="flex-1 bg-ink text-text-hi">
      <header className="max-w-2xl mx-auto px-6 md:px-0 pt-8">
        <Link href="/" className="font-display text-lg tracking-tight">
          ALX <span className="text-teal-hi">ProConnect</span>
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 md:px-0 pt-12 pb-24">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal-hi mb-4">
          For recruiters &amp; founders
        </p>
        <h1 className="font-display text-3xl md:text-4xl leading-tight">
          Enter your email to browse the directory
        </h1>
        <p className="mt-4 text-text-lo max-w-md">
          Free, always. We ask once — after that, just your email gets you
          straight back in.
        </p>

        <Suspense fallback={null}>
          <RecruiterEntryForm />
        </Suspense>
      </div>
    </main>
  );
}
