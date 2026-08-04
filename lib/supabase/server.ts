import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Standard anon-key server client — respects Row Level Security.
// Use this for anything done on behalf of a signed-in recruiter.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request context — safe to ignore
            // because middleware refreshes the session on every request.
          }
        },
      },
    }
  );
}

// Service-role client — bypasses RLS. Only ever import this in server-only
// code (route handlers, server actions). Never expose SUPABASE_SERVICE_ROLE_KEY
// to the browser.
import { createClient as createRawClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
