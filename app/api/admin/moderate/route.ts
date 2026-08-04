import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const Schema = z.object({
  talent_id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  showcase_score: z.number().min(0).max(5).nullable().optional(),
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
  const { talent_id, action, showcase_score } = parsed.data;

  const { error } = await supabase
    .from("talents")
    .update({
      status: action === "approve" ? "published" : "rejected",
      showcase_score: showcase_score ?? undefined,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", talent_id);

  if (error) {
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
