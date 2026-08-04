import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="paper flex-1 bg-paper text-text-ink flex items-center">
      <div className="max-w-lg mx-auto px-6 text-center">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass mb-4">
          Submitted
        </p>
        <h1 className="font-display text-3xl md:text-4xl leading-tight">
          Your profile is in review
        </h1>
        <p className="mt-4 text-text-ink-lo">
          The FLA team checks every submission before it's published to
          recruiters. You'll hear from us once it's live.
        </p>
        <Link
          href="/"
          className="inline-block mt-10 font-mono text-sm uppercase tracking-wide border border-text-ink px-6 py-3 rounded-md hover:bg-ink hover:text-text-hi hover:border-ink transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
