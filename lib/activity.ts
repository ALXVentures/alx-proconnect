import { createServiceClient } from "@/lib/supabase/server";

type ActorType = "recruiter" | "talent";

export async function logActivity({
  actorType,
  actorEmail,
  action,
  metadata,
}: {
  actorType: ActorType;
  actorEmail: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createServiceClient();
  // Best-effort: a logging failure should never block the actual request.
  const { error } = await supabase.from("activity_log").insert({
    actor_type: actorType,
    actor_email: actorEmail,
    action,
    metadata: metadata ?? null,
  });
  if (error) {
    console.error("activity_log insert failed:", error.message);
  }
}
