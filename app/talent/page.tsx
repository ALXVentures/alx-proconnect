import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";

export default function TalentLoginPage() {
  return (
    <main className="paper flex-1 bg-paper text-text-ink flex flex-col">
      <header className="max-w-2xl mx-auto w-full px-6 md:px-0 pt-8">
        <BrandMark theme="light" />
      </header>

      <div className="max-w-2xl mx-auto w-full px-6 md:px-0 pt-12 pb-24 flex-1">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass mb-4">
          Talent dashboard
        </p>
        <h1 className="font-display text-3xl md:text-4xl leading-tight text-text-ink">
          Coming soon
        </h1>
        <p className="mt-4 text-text-ink-lo max-w-lg">
          Soon you'll be able to log in with just your email to see how many
          recruiters have viewed your profile and update your details
          yourself. For now, submit or edit your profile through the FLA
          team.
        </p>
        <Link
          href="/apply"
          className="inline-block mt-10 font-mono text-sm uppercase tracking-wide border border-text-ink px-6 py-3 rounded-md hover:bg-ink hover:text-text-hi hover:border-ink transition-colors"
        >
          Submit your profile
        </Link>
      </div>

      <Footer theme="light" />
    </main>
  );
}
