import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const Schema = z.object({
  request_id: z.string().uuid(),
  email: z.string().trim().email(),
});

async function isAdmin() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("alx_admin")?.value;
  return !!cookie && !!process.env.ADMIN_PASSCODE && cookie === process.env.ADMIN_PASSCODE;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { request_id, email } = parsed.data;

  // Find the matching talent profile, if one exists, and anonymize it rather
  // than hard-deleting: this satisfies the right-to-erasure request while
  // preserving the intro_requests audit trail (which references talent_id
  // and is retained separately for 3 years per the retention policy).
  const { data: talent } = await supabase
    .from("talents")
    .select("id, headshot_path")
    .eq("email", email)
    .maybeSingle();

  if (talent) {
    if (talent.headshot_path) {
      await supabase.storage.from("headshots").remove([talent.headshot_path]);
    }
    await supabase
      .from("talents")
      .update({
        status: "removed",
        full_name: "Removed at user request",
        email: `removed-${talent.id}@deleted.alxproconnect`,
        phone: null,
        city: null,
        bio: null,
        portfolio_url: null,
        linkedin_url: null,
        headshot_path: null,
        skill_tags: [],
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", talent.id);
  }

  const { error } = await supabase
    .from("takedown_requests")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", request_id);

  if (error) {
    return NextResponse.json({ error: "Could not resolve request." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, talentFound: !!talent });
}
