import Link from "next/link";
import { ScoreMeter } from "@/components/ScoreMeter";

const STATS = [
  { value: "250+", label: "Recruiters engaged" },
  { value: "4.6", label: "Min. panel score to publish" },
  { value: "0", label: "Cost to recruiters" },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="max-w-6xl mx-auto px-6 md:px-10 pt-8 flex items-center justify-between">
        <div className="font-display text-lg tracking-tight">
          ALX <span className="text-brass-hi">ProConnect</span>
        </div>
        <nav className="font-mono text-xs tracking-wide text-text-lo flex items-center gap-6">
          <span className="hidden sm:inline">Freelancer Academy</span>
          <Link
            href="/recruiters"
            className="text-text-hi hover:text-teal-hi transition-colors"
          >
            Browse talent
          </Link>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-14">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass-hi mb-5">
          A Portfolio Showcase initiative
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] max-w-3xl">
          Talent that already{" "}
          <span className="italic text-teal-hi">passed the panel.</span>
        </h1>
        <p className="mt-6 max-w-xl text-text-lo text-base md:text-lg leading-relaxed">
          Every profile here cleared a judged pitch session against a fixed
          rubric before it was invited onto the platform. Recruiters skip the
          sourcing grind; graduates skip the cold outreach.
        </p>

        <div className="mt-10 max-w-sm">
          <ScoreMeter value={4.6} />
        </div>

        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3">
          {STATS.map((s) => (
            <div key={s.label} className="font-mono">
              <div className="text-2xl text-text-hi">{s.value}</div>
              <div className="text-[11px] uppercase tracking-wide text-text-lo">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The fork: two doors, one ledger spine ─────────────── */}
      <section className="border-t border-ink-line">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1px_1fr]">
          {/* Recruiter door */}
          <Link
            href="/recruiters"
            className="group relative px-6 md:px-10 py-16 flex flex-col justify-between hover:bg-ink-2 transition-colors"
          >
            <div>
              <span className="font-mono text-[11px] tracking-widest uppercase text-teal-hi">
                For recruiters &amp; founders
              </span>
              <h2 className="font-display text-3xl md:text-[2.5rem] mt-4 leading-tight">
                Hire vetted talent, at no cost
              </h2>
              <p className="mt-4 text-text-lo max-w-md">
                Register once, then browse and search a live directory of
                showcased graduates. Request an intro and we route contact
                details to your inbox.
              </p>
            </div>
            <div className="mt-10 inline-flex items-center gap-2 font-mono text-sm text-teal-hi">
              Browse the directory
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>

          <div className="hidden md:block ledger-rule" />

          {/* Applicant door */}
          <Link
            href="/apply"
            className="group relative px-6 md:px-10 py-16 flex flex-col justify-between border-t md:border-t-0 border-ink-line hover:bg-ink-2 transition-colors"
          >
            <div>
              <span className="font-mono text-[11px] tracking-widest uppercase text-brass-hi">
                For Showcase graduates
              </span>
              <h2 className="font-display text-3xl md:text-[2.5rem] mt-4 leading-tight">
                Put your work in front of employers
              </h2>
              <p className="mt-4 text-text-lo max-w-md">
                Cleared the pitch panel? Submit your profile — headshot,
                portfolio, and a one-line pitch — for the FLA team to review
                and publish.
              </p>
            </div>
            <div className="mt-10 inline-flex items-center gap-2 font-mono text-sm text-brass-hi">
              Submit your profile
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-line mt-auto">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row gap-3 justify-between font-mono text-[11px] text-text-lo">
          <span>ALX ProConnect — built by the FLA program team</span>
          <Link href="/remove-me" className="hover:text-brass-hi transition-colors">
            Request profile removal
          </Link>
        </div>
      </footer>
    </main>
  );
}
