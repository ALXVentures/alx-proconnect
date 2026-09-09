import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { AdminLogin } from "@/components/AdminLogin";
import {
  ModerationQueue,
  TakedownQueue,
  type PendingTalent,
  type TakedownRequest,
} from "@/components/ModerationQueue";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("alx_admin")?.value;
  const authed = !!cookie && !!process.env.ADMIN_PASSCODE && cookie === process.env.ADMIN_PASSCODE;

  if (!authed) {
    return <AdminLogin />;
  }

  const supabase = createServiceClient();
  const [{ data }, { data: takedowns }] = await Promise.all([
    supabase
      .from("talents")
      .select(
        "id, full_name, email, country, program, one_liner, bio, portfolio_url, linkedin_url, headshot_path, skill_tags"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("takedown_requests")
      .select("id, email, message, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ]);

  const talents: PendingTalent[] = (data || []).map((t) => ({
    ...t,
    headshot_url: t.headshot_path
      ? supabase.storage.from("headshots").getPublicUrl(t.headshot_path).data.publicUrl
      : null,
  }));
  const takedownRequests: TakedownRequest[] = takedowns || [];

  return (
    <main className="flex-1 bg-ink text-text-hi">
      <header className="max-w-4xl mx-auto px-6 md:px-10 pt-8">
        <span className="font-display text-lg">
          ALX <span className="text-brass-hi">ProConnect</span>
        </span>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-text-lo">
          Moderation queue · {talents.length} pending
        </p>
      </header>
      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-10 pb-24 space-y-16">
        <ModerationQueue talents={talents} />

        <section>
          <h2 className="font-display text-2xl mb-1">Removal requests</h2>
          <p className="font-mono text-[11px] uppercase tracking-widest text-text-lo mb-6">
            {takedownRequests.length} pending · 30-day SLA
          </p>
          <TakedownQueue requests={takedownRequests} />
        </section>
      </div>
    </main>
  );
}
