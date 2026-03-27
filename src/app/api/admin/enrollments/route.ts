import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../guard";
import { getAdminFromRequest } from "@/lib/admin-authorization";
import { grantManualEnrollment } from "@/lib/enrollments";

type Body = {
  profile_id?: string;
  course_id?: string;
};

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "active").trim();

  const { data: rows, error } = await supabase
    .from("enrollments")
    .select("id, status, source, granted_at, profile_id, course_id, purchase_id")
    .eq("status", status)
    .order("granted_at", { ascending: false })
    .limit(1000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseRows = (rows ?? []) as Array<{
    id: string;
    status: string;
    source: string | null;
    granted_at: string;
    profile_id: string | null;
    course_id: string | null;
    purchase_id: string | null;
  }>;

  const profileIds = [...new Set(baseRows.map((r) => r.profile_id).filter(Boolean))] as string[];
  const courseIds = [...new Set(baseRows.map((r) => r.course_id).filter(Boolean))] as string[];
  const purchaseIds = [...new Set(baseRows.map((r) => r.purchase_id).filter(Boolean))] as string[];

  const [profilesRes, coursesRes, purchasesRes] = await Promise.all([
    profileIds.length
      ? supabase.from("profiles").select("id, email, full_name").in("id", profileIds)
      : Promise.resolve({ data: [], error: null }),
    courseIds.length
      ? supabase.from("courses").select("id, title, slug").in("id", courseIds)
      : Promise.resolve({ data: [], error: null }),
    purchaseIds.length
      ? supabase.from("purchases").select("id, amount, currency").in("id", purchaseIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profilesRes.error || coursesRes.error || purchasesRes.error) {
    return NextResponse.json(
      {
        error:
          profilesRes.error?.message ||
          coursesRes.error?.message ||
          purchasesRes.error?.message ||
          "Failed to load enrollment relations",
      },
      { status: 500 }
    );
  }

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, { id: p.id, email: p.email, full_name: p.full_name }])
  );
  const courseMap = new Map(
    (coursesRes.data ?? []).map((c) => [c.id, { id: c.id, title: c.title, slug: c.slug }])
  );
  const purchaseMap = new Map(
    (purchasesRes.data ?? []).map((p) => [p.id, { id: p.id, amount: p.amount, currency: p.currency }])
  );

  const list = baseRows.map((r) => {
    const p = (r.profile_id && profileMap.get(r.profile_id)) || null;
    const c = (r.course_id && courseMap.get(r.course_id)) || null;
    const pu = (r.purchase_id && purchaseMap.get(r.purchase_id)) || null;

    return {
      id: String(r.id),
      status: String(r.status ?? "active"),
      source: r.source != null ? String(r.source) : null,
      granted_at: String(r.granted_at ?? ""),
      profile: {
        id: p?.id ?? null,
        email: p?.email ?? null,
        full_name: p?.full_name ?? null,
      },
      course: {
        id: c?.id ?? null,
        title: c?.title ?? null,
        slug: c?.slug ?? null,
      },
      purchase: {
        id: pu?.id ?? null,
        amount: pu?.amount != null ? Number(pu.amount) : 0,
        currency: pu?.currency ?? "USD",
      },
    };
  });

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const profileId = typeof body.profile_id === "string" ? body.profile_id.trim() : "";
  const courseId = typeof body.course_id === "string" ? body.course_id.trim() : "";
  if (!profileId || !courseId) {
    return NextResponse.json({ error: "profile_id and course_id are required" }, { status: 400 });
  }

  const { data: profileRow } = await supabase.from("profiles").select("id").eq("id", profileId).maybeSingle();
  if (!profileRow?.id) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const { data: courseRow } = await supabase.from("courses").select("id, status").eq("id", courseId).maybeSingle();
  if (!courseRow?.id) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (courseRow.status === "archived") {
    return NextResponse.json({ error: "Cannot enroll in an archived course" }, { status: 400 });
  }

  const result = await grantManualEnrollment(supabase, profileId, courseId, admin.profile_id);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    alreadyActive: result.alreadyActive === true,
  });
}
