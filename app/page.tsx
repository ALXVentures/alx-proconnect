import Link from "next/link";
import { ScoreMeter } from "@/components/ScoreMeter";
import { BrandMark } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";

const STATS = [
  { value: "5+", label: "Recruiters engaged" },
  { value: "4.0", label: "Out of 5 Min. panel score" },
  { value: "0", label: "Cost to recruiters" },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="max-w-6xl mx-auto w-full px-6 md:px-10 pt-8 flex items-center justify-between">
        <BrandMark theme="dark" href={null} />
        <nav className="font-mono text-xs tracking-wide text-text-lo flex items-center gap-6">
          <Link
            href="/recruiters"
            className="text-text-hi hover:text-teal-hi transition-colors"
          >
            Browse talent
          </Link>
          <Link
            href="/talent"
            className="text-text-hi hover:text-brass-hi transition-colors"
          >
            Talent Log in
          </Link>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto w-full px-6 md:px-10 pt-16 pb-14">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-brass-hi mb-5">
          An ALX Venture Freelancer Academy Program initiative
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] max-w-3xl">
          Top Talents Trained to Deliver{" "}
          <span className="italic text-teal-hi">Excellent Client Work.</span>
        </h1>
        <p className="mt-6 max-w-xl text-text-lo text-base md:text-lg leading-relaxed">
          Every profile here cleared a judged pitch session against a fixed
          rubric before it was invited onto the platform. Recruiters skip the
          sourcing grind; graduates skip the cold outreach.
        </p>

        <div className="mt-10 max-w-sm">
          <ScoreMeter value={4.0} />
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
          <div className="relative px-6 md:px-10 py-16 flex flex-col justify-between">
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
            <Link
              href="/recruiters"
              className="cta-bounce mt-10 inline-flex w-fit items-center gap-2 font-mono text-sm font-medium uppercase tracking-wide bg-twilight text-white px-7 py-3.5 rounded-full shadow-lg shadow-twilight/20 hover:bg-twilight-hi transition-colors"
            >
              Search Vetted Talent
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="hidden md:block ledger-rule" />

          {/* Applicant door */}
          <div className="relative px-6 md:px-10 py-16 flex flex-col justify-between border-t md:border-t-0 border-ink-line">
            <div>
              <span className="font-mono text-[11px] tracking-widest uppercase text-brass-hi">
                For Only Shortlisted Freelancers
              </span>
              <h2 className="font-display text-3xl md:text-[2.5rem] mt-4 leading-tight">
                Invited? Submit your profile
              </h2>
              <p className="mt-4 text-text-lo max-w-md">
                All Profile Submissions are reviewed and verified before getting published
                Cleared the pitch panel? Only shortlisted talents are approved. 
              </p>
            </div>
            <Link
              href="/apply"
              className="cta-bounce mt-10 inline-flex w-fit items-center gap-2 font-mono text-sm font-medium uppercase tracking-wide bg-brass-hi text-ink px-7 py-3.5 rounded-full shadow-lg shadow-brass-hi/20 hover:bg-brass transition-colors"
            >
              Submit Your Profile
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer theme="dark" showRemoveMeLink />
    </main>
  );
}
