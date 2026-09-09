import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { RECRUITER_COOKIE } from "@/lib/constants";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(RECRUITER_COOKIE);
  return NextResponse.json({ ok: true });
}
