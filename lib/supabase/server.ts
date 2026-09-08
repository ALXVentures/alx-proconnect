import { createClient as createRawClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. This is the ONLY way the app talks to
// Supabase now: recruiters and talents never hold a Supabase session, so
// every read/write happens server-side (route handlers, server components)
// using this client. Never import this in client ("use client") code, and
// never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createServiceClient() {
  return createRawClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
