import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DirectoryGrid, type Talent } from "@/components/DirectoryGrid";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DirectoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/recruiters/login?next=/directory");
  }

  const [{ data: talents }, { data: recruiter }, { data: requests }] = await Promise.all([
    supabase
      .from("talents")
      .select(
        "id, full_name, country, city, program, skill_tags, one_liner, portfolio_url, linkedin_url, headshot_path, showcase_score"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    supabase.from("recruiters").select("full_name, company").eq("id", user.id).single(),
    supabase.from("intro_requests").select("talent_id").eq("recruiter_id", user.id),
  ]);

  const talentsWithUrls: Talent[] = (talents || []).map((t) => ({
    ...t,
    headshot_url: t.headshot_path
      ? supabase.storage.from("headshots").getPublicUrl(t.headshot_path).data.publicUrl
      : null,
  }));

  const requestedIds = new Set((requests || []).map((r) => r.talent_id));

  return (
    <main className="flex-1 bg-ink text-text-hi">
      <header className="max-w-6xl mx-auto px-6 md:px-10 pt-8 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-tight">
          ALX <span className="text-teal-hi">ProConnect</span>
        </Link>
        <div className="flex items-center gap-5 font-mono text-xs text-text-lo">
          {recruiter && (
            <span className="hidden sm:inline">
              {recruiter.full_name} · {recruiter.company}
            </span>
          )}
          <SignOutButton />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10 pb-6">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal-hi mb-3">
          Live directory
        </p>
        <h1 className="font-display text-3xl md:text-4xl">
          {talentsWithUrls.length} vetted profile
          {talentsWithUrls.length === 1 ? "" : "s"}, ready to talk
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-24">
        <DirectoryGrid talents={talentsWithUrls} requestedIds={requestedIds} />
      </div>
    </main>
  );
}
