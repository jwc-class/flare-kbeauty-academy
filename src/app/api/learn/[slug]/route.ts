import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUserFromBearer } from "@/lib/auth-server";
import { getProfileByAuthUserId } from "@/lib/profiles";
import type { CourseLessonPublic } from "@/types/enrollment";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Params) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const { slug } = await params;
  const slugTrim = decodeURIComponent(slug).trim();
  if (!slugTrim) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const user = await getUserFromBearer(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByAuthUserId(user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: course, error: courseErr } = await supabaseAdmin
    .from("courses")
    .select("id, title, slug, thumbnail_url, short_description")
    .eq("slug", slugTrim)
    .maybeSingle();

  if (courseErr || !course?.id) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { data: enrollment } = await supabaseAdmin
    .from("enrollments")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("course_id", course.id)
    .eq("status", "active")
    .maybeSingle();

  const hasAccess = !!enrollment?.id;

  const { data: allLessons, error: lessonsErr } = await supabaseAdmin
    .from("course_lessons")
    .select("id, course_id, sort_order, title, description, video_provider, video_ref, is_free_preview")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  if (lessonsErr) {
    console.error("[api/learn]", lessonsErr.message);
    return NextResponse.json({ error: lessonsErr.message }, { status: 500 });
  }

  const rawLessons = allLessons ?? [];
  const lessons = rawLessons.filter((l) => {
    const row = l as CourseLessonPublic & { is_free_preview: boolean };
    if (hasAccess) return true;
    return row.is_free_preview === true;
  });

  if (!hasAccess && lessons.length === 0) {
    return NextResponse.json(
      { error: "No access", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    hasFullAccess: hasAccess,
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail_url: course.thumbnail_url,
      short_description: course.short_description,
    },
    lessons,
  });
}