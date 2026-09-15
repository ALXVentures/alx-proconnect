import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { sendProfileToRecruiterEmail } from "@/lib/email";
import { RECRUITER_COOKIE } from "@/lib/constants";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const recruiterId = cookieStore.get(RECRUITER_COOKIE)?.value;

  if (!recruiterId) {
    return NextResponse.json({ error: "Please enter your email first." }, { status: 401 });
  }

  const supabase = createServiceClient();

  const [{ data: recruiter }, { data: talent }] = await Promise.all([
    supabase
      .from("recruiters")
      .select("id, full_name, work_email")
      .eq("id", recruiterId)
      .maybeSingle(),
    supabase
      .from("talents")
      .select("full_name, email, phone, one_liner, portfolio_url, linkedin_url")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle(),
  ]);

  if (!recruiter) {
    return NextResponse.json({ error: "Please enter your email again." }, { status: 401 });
  }
  if (!talent) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const result = await sendProfileToRecruiterEmail({
    recruiterEmail: recruiter.work_email,
    recruiterName: recruiter.full_name,
    talent,
  });

  await logActivity({
    actorType: "recruiter",
    actorEmail: recruiter.work_email,
    action: "profile_emailed",
    metadata: { talent_id: id },
  });

  if (result.error) {
    return NextResponse.json({ error: "Could not send the email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sentTo: recruiter.work_email });
}
