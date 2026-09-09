import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { RECRUITER_COOKIE, RECRUITER_COOKIE_MAX_AGE } from "@/lib/constants";

const Schema = z.object({
  email: z.string().trim().email(),
  full_name: z.string().trim().min(2).max(120).optional(),
  company: z.string().trim().min(1).max(160).optional(),
  company_website: z.string().trim().url().optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  company_size: z.string().trim().max(40).optional().or(z.literal("")),
  role_title: z.string().trim().max(120).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url().optional().or(z.literal("")),
  hiring_focus: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const {
    email,
    full_name,
    company,
    company_website,
    industry,
    company_size,
    role_title,
    linkedin_url,
    hiring_focus,
  } = parsed.data;
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("recruiters")
    .select("id, full_name, company")
    .eq("work_email", email)
    .maybeSingle();

  let recruiterId: string;

  if (existing) {
    // Returning recruiter — email only, no re-capture of any field.
    recruiterId = existing.id;
    await supabase
      .from("recruiters")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    // First time — name and company are the only hard requirements;
    // everything else (website, industry, size, position, LinkedIn) is
    // optional but stored for analysis/reference when given.
    if (!full_name || !company) {
      return NextResponse.json(
        { error: "new_recruiter", needsDetails: true },
        { status: 200 }
      );
    }
    const { data: created, error: insertError } = await supabase
      .from("recruiters")
      .insert({
        work_email: email,
        full_name,
        company,
        company_website: company_website || null,
        industry: industry || null,
        company_size: company_size || null,
        role_title: role_title || null,
        linkedin_url: linkedin_url || null,
        hiring_focus: hiring_focus || null,
      })
      .select("id")
      .single();

    if (insertError || !created) {
      return NextResponse.json(
        { error: "Could not register. Please try again." },
        { status: 500 }
      );
    }
    recruiterId = created.id;
  }

  await logActivity({
    actorType: "recruiter",
    actorEmail: email,
    action: "search_directory",
  });

  const cookieStore = await cookies();
  cookieStore.set(RECRUITER_COOKIE, recruiterId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: RECRUITER_COOKIE_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
