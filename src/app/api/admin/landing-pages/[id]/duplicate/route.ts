import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../../../guard";

type Params = { params: Promise<{ id: string }> };

async function getUniqueSlug(baseSlug: string): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return `${baseSlug}-copy`;
  const base = `${baseSlug}-copy`;
  for (let i = 0; i < 50; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const { data } = await supabaseAdmin
      .from("landing_pages")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(req: Request, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const { data: source, error: sourceErr } = await supabaseAdmin
      .from("landing_pages")
      .select("*")
      .eq("id", id)
      .single();
    if (sourceErr || !source) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
    }

    const slug = await getUniqueSlug(source.slug);
    const { data, error } = await supabaseAdmin
      .from("landing_pages")
      .insert({
        title: `${source.title} (Copy)`,
        slug,
        hero_title: source.hero_title ?? null,
        hero_subtitle: source.hero_subtitle ?? null,
        cta_text: source.cta_text ?? null,
        primary_course_id: source.primary_course_id ?? null,
        offer_page_id: source.offer_page_id ?? null,
        channel: source.channel ?? null,
        status: "draft",
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
