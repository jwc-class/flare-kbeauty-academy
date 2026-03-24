import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../guard";

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("offer_pages")
      .select(`
        *,
        courses(id, title, slug)
      `)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin
      .from("offer_pages")
      .insert({
        title: body.title ?? "",
        slug: body.slug ?? "",
        headline: body.headline ?? null,
        subheadline: body.subheadline ?? null,
        body: body.body ?? null,
        cta_text: body.cta_text ?? null,
        course_id: body.course_id || null,
        status: body.status ?? "draft",
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
