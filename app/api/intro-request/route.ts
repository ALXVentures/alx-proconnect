import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { RECRUITER_COOKIE } from "@/lib/constants";

const Schema = z.object({ talent_id: z.string().uuid() });

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const recruiterId = cookieStore.get(RECRUITER_COOKIE)?.value;

  if (!recruiterId) {
    return NextResponse.json({ error: "Please enter your email first." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: recruiter } = await supabase
    .from("recruiters")
    .select("id, work_email")
    .eq("id", recruiterId)
    .maybeSingle();

  if (!recruiter) {
    return NextResponse.json({ error: "Please enter your email again." }, { status: 401 });
  }

  const { error } = await supabase.from("intro_requests").insert({
    recruiter_id: recruiter.id,
    talent_id: parsed.data.talent_id,
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Could not send request." }, { status: 500 });
  }

  await logActivity({
    actorType: "recruiter",
    actorEmail: recruiter.work_email,
    action: "intro_request",
    metadata: { talent_id: parsed.data.talent_id },
  });

  // Roadmap (next step): this is where the on-screen profile view,
  // send-to-email / download-PDF options, and the immediate notification
  // email to the Talent get wired in.

  return NextResponse.json({ ok: true });
}
