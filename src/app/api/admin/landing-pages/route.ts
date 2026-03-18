import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../guard";

export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("landing_pages")
      .select(`
        *,
        lead_magnets(id, title, slug),
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
  const err = requireAdmin(req);
  if (err) return err;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin.from("landing_pages").insert({
      title: body.title ?? "",
      slug: body.slug ?? "",
      hero_title: body.hero_title ?? null,
      hero_subtitle: body.hero_subtitle ?? null,
      cta_text: body.cta_text ?? null,
      lead_magnet_id: body.lead_magnet_id || null,
      primary_course_id: body.primary_course_id || null,
      channel: body.channel ?? null,
      status: body.status ?? "draft",
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
