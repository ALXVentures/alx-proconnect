import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const Schema = z.object({
  email: z.string().trim().email(),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("takedown_requests").insert({
    email: parsed.data.email,
    message: parsed.data.message || null,
  });

  if (error) {
    return NextResponse.json({ error: "Could not submit your request." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
