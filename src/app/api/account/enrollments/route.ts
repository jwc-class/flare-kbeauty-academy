import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUserFromBearer } from "@/lib/auth-server";
import { getProfileByAuthUserId } from "@/lib/profiles";
import type { EnrollmentWithCourse } from "@/types/enrollment";

/**
 * GET /api/account/enrollments
 * Lists active course enrollments for the authenticated member.
 */
export async function GET(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const user = await getUserFromBearer(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByAuthUserId(user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: rows, error } = await supabaseAdmin
    .from("enrollments")
    .select(
      `
      id,
      granted_at,
      expires_at,
      status,
      courses ( id, title, slug, thumbnail_url )
    `
    )
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .order("granted_at", { ascending: false });

  if (error) {
    console.error("[account/enrollments]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list: EnrollmentWithCourse[] = (rows ?? []).map((row: Record<string, unknown>) => {
    const c = row.courses as Record<string, unknown> | null | undefined;
    return {
      id: String(row.id),
      granted_at: String(row.granted_at ?? ""),
      expires_at: row.expires_at != null ? String(row.expires_at) : null,
      status: String(row.status ?? "active"),
      course: {
        id: String(c?.id ?? ""),
        title: c?.title != null ? String(c.title) : null,
        slug: c?.slug != null ? String(c.slug) : null,
        thumbnail_url: c?.thumbnail_url != null ? String(c.thumbnail_url) : null,
      },
    };
  });

  return NextResponse.json(list);
}
