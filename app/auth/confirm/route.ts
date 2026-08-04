import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/directory";

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/recruiters/login?error=missing_token`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/recruiters/login?error=invalid_link`);
  }

  // First sign-in for this recruiter: create their profile row from the
  // metadata captured at registration time.
  const meta = data.user.user_metadata as Record<string, string | undefined>;
  if (meta?.full_name && meta?.company) {
    await supabase.from("recruiters").upsert(
      {
        id: data.user.id,
        full_name: meta.full_name,
        company: meta.company,
        role_title: meta.role_title || null,
        work_email: meta.work_email || data.user.email!,
        hiring_focus: meta.hiring_focus || null,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
