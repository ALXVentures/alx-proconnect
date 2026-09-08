import { NextResponse, type NextRequest } from "next/server";
import { RECRUITER_COOKIE } from "@/lib/constants";

// Cheap presence check only — this runs on the edge, so it doesn't hit the
// database. The real check (does this recruiter id still exist in
// Postgres?) happens server-side in app/directory/page.tsx, which redirects
// back here if the cookie turns out to be stale.
export function proxy(request: NextRequest) {
  const hasRecruiterCookie = request.cookies.has(RECRUITER_COOKIE);

  if (!hasRecruiterCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/recruiters";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/directory/:path*"],
};
