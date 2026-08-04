import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Schema = z.object({ talent_id: z.string().uuid() });

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // RLS (auth.uid() = recruiter_id) enforces that this insert can only ever
  // be attributed to the signed-in recruiter — no need to trust the client.
  const { error } = await supabase.from("intro_requests").insert({
    recruiter_id: user.id,
    talent_id: parsed.data.talent_id,
  });

  if (error) {
    if (error.code === "23505") {
      // Already requested — treat as success, it's idempotent from the UI's view.
      return NextResponse.json({ ok: true, already: true });
    }
    return NextResponse.json({ error: "Could not send request." }, { status: 500 });
  }

  // Roadmap (V2): trigger an automated email to the recruiter with the
  // talent's contact details once the FLA team approves the request, per
  // the ProConnect data-flow doc. V1 logs the request for manual follow-up.

  return NextResponse.json({ ok: true });
}
