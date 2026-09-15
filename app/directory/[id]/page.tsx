import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { sendTalentSelectedEmail } from "@/lib/email";
import { RECRUITER_COOKIE } from "@/lib/constants";
import { ScoreMeter } from "@/components/ScoreMeter";
import { TalentProfileActions } from "@/components/TalentProfileActions";

export default async function TalentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const recruiterId = cookieStore.get(RECRUITER_COOKIE)?.value;

  if (!recruiterId) {
    redirect(`/recruiters?next=/directory/${id}`);
  }

  const supabase = createServiceClient();

  const [{ data: recruiter }, { data: talent }] = await Promise.all([
    supabase
      .from("recruiters")
      .select("id, full_name, company, role_title, hiring_focus, work_email")
      .eq("id", recruiterId)
      .maybeSingle(),
    supabase
      .from("talents")
      .select(
        "id, full_name, email, phone, country, city, program, one_liner, bio, skill_tags, portfolio_url, linkedin_url, headshot_path, showcase_score"
      )
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle(),
  ]);

  if (!recruiter) {
    redirect(`/recruiters?next=/directory/${id}`);
  }
  if (!talent) {
    notFound();
  }

  // Idempotent "select" — insert succeeds only the first time this
  // recruiter views this talent. On success, notify the Talent
  // immediately; on a duplicate-key conflict, they've already been
  // notified, so skip re-sending.
  const { error: insertError } = await supabase.from("intro_requests").insert({
    recruiter_id: recruiter.id,
    talent_id: talent.id,
  });

  const isFirstView = !insertError;

  if (isFirstView) {
    await sendTalentSelectedEmail({
      talentEmail: talent.email,
      talentName: talent.full_name,
      recruiterName: recruiter.full_name,
      recruiterCompany: recruiter.company,
      recruiterRole: recruiter.role_title,
      hiringFocus: recruiter.hiring_focus,
    });
    await logActivity({
      actorType: "recruiter",
      actorEmail: recruiter.work_email,
      action: "profile_selected",
      metadata: { talent_id: talent.id },
    });
  }

  const headshotUrl = talent.headshot_path
    ? supabase.storage.from("headshots").getPublicUrl(talent.headshot_path).data.publicUrl
    : null;

  return (
    <main className="flex-1 bg-ink text-text-hi">
      <header className="max-w-3xl mx-auto px-6 md:px-10 pt-8 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-tight">
          ALX <span className="text-teal-hi">ProConnect</span>
        </Link>
        <Link
          href="/directory"
          className="font-mono text-xs text-text-lo hover:text-teal-hi transition-colors"
        >
          ← Back to directory
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-10 pb-24">
        <div className="flex items-start gap-5">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-ink-3 shrink-0">
            {headshotUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={headshotUrl} alt={talent.full_name} className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <h1 className="font-display text-3xl">{talent.full_name}</h1>
            <p className="font-mono text-xs text-text-lo mt-1">
              {[talent.city, talent.country].filter(Boolean).join(", ")} · {talent.program}
            </p>
          </div>
        </div>

        <p className="mt-6 text-lg text-text-lo leading-relaxed">{talent.one_liner}</p>

        {talent.bio && <p className="mt-4 text-text-lo leading-relaxed">{talent.bio}</p>}

        {talent.skill_tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {talent.skill_tags.map((s: string) => (
              <span
                key={s}
                className="font-mono text-[10px] uppercase tracking-wide bg-ink-2 border border-ink-line px-2 py-1 rounded text-text-lo"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 max-w-xs">
          <ScoreMeter value={talent.showcase_score} tone="teal" compact />
        </div>

        <div className="mt-8 bg-ink-2 border border-ink-line rounded-xl p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal-hi mb-4">
            Contact
          </p>
          <dl className="space-y-2 font-mono text-sm">
            <div className="flex gap-3">
              <dt className="w-16 text-text-lo shrink-0">Email</dt>
              <dd className="truncate">{talent.email}</dd>
            </div>
            {talent.phone && (
              <div className="flex gap-3">
                <dt className="w-16 text-text-lo shrink-0">Phone</dt>
                <dd>{talent.phone}</dd>
              </div>
            )}
            {talent.portfolio_url && (
              <div className="flex gap-3">
                <dt className="w-16 text-text-lo shrink-0">Portfolio</dt>
                <dd className="truncate">
                  <a
                    href={talent.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-hi hover:underline"
                  >
                    {talent.portfolio_url}
                  </a>
                </dd>
              </div>
            )}
            {talent.linkedin_url && (
              <div className="flex gap-3">
                <dt className="w-16 text-text-lo shrink-0">LinkedIn</dt>
                <dd className="truncate">
                  <a
                    href={talent.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-hi hover:underline"
                  >
                    {talent.linkedin_url}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-4 font-mono text-[11px] text-text-lo">
            Please use this contact information for recruitment purposes only.
            {talent.full_name.split(" ")[0]} has been notified that you viewed
            their profile.
          </p>
        </div>

        <div className="mt-8">
          <TalentProfileActions talentId={talent.id} />
        </div>
      </div>
    </main>
  );
}
