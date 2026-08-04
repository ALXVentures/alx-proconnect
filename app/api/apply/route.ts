import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const MAX_HEADSHOT_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const ApplicantSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  country: z.string().trim().min(2).max(80),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  program: z.enum(["FLA", "AiCE", "VA", "GD", "CC"]),
  one_liner: z.string().trim().min(10).max(140),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  portfolio_url: z.string().trim().url(),
  linkedin_url: z.string().trim().url().optional().or(z.literal("")),
  skill_tags: z.string().trim().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const parsed = ApplicantSchema.safeParse({
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      country: formData.get("country"),
      city: formData.get("city"),
      program: formData.get("program"),
      one_liner: formData.get("one_liner"),
      bio: formData.get("bio"),
      portfolio_url: formData.get("portfolio_url"),
      linkedin_url: formData.get("linkedin_url"),
      skill_tags: formData.get("skill_tags"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid submission." },
        { status: 400 }
      );
    }

    const headshot = formData.get("headshot");
    if (!(headshot instanceof File) || headshot.size === 0) {
      return NextResponse.json({ error: "A headshot is required." }, { status: 400 });
    }
    if (headshot.size > MAX_HEADSHOT_BYTES) {
      return NextResponse.json({ error: "Headshot must be under 5MB." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(headshot.type)) {
      return NextResponse.json(
        { error: "Headshot must be a JPG, PNG, or WebP file." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const data = parsed.data;

    const extension = headshot.name.split(".").pop() || "jpg";
    const objectPath = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("headshots")
      .upload(objectPath, headshot, {
        contentType: headshot.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Could not upload headshot. Please try again." },
        { status: 500 }
      );
    }

    const skillTags = (data.skill_tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase.from("talents").insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      country: data.country,
      city: data.city || null,
      program: data.program,
      one_liner: data.one_liner,
      bio: data.bio || null,
      portfolio_url: data.portfolio_url,
      linkedin_url: data.linkedin_url || null,
      skill_tags: skillTags,
      headshot_path: objectPath,
      status: "pending",
    });

    if (insertError) {
      // Roll back the uploaded file if the row insert failed, so the bucket
      // doesn't accumulate orphaned images.
      await supabase.storage.from("headshots").remove([objectPath]);

      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "A profile with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Could not save your profile. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unexpected error. Please try again." }, { status: 500 });
  }
}
