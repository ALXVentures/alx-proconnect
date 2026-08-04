import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { passcode } = await req.json().catch(() => ({ passcode: "" }));

  if (!process.env.ADMIN_PASSCODE) {
    return NextResponse.json(
      { error: "ADMIN_PASSCODE is not configured on the server." },
      { status: 500 }
    );
  }

  if (passcode !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("alx_admin", passcode, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
