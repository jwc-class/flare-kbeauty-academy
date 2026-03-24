import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../../guard";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("offer_pages")
      .select(`
        *,
        courses(id, title, slug)
      `)
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Offer page not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const payload: Record<string, unknown> = {};
    if (body.title !== undefined) payload.title = body.title ?? "";
    if (body.slug !== undefined) payload.slug = body.slug ?? "";
    if (body.headline !== undefined) payload.headline = body.headline ?? null;
    if (body.subheadline !== undefined) payload.subheadline = body.subheadline ?? null;
    if (body.body !== undefined) payload.body = body.body ?? null;
    if (body.cta_text !== undefined) payload.cta_text = body.cta_text ?? null;
    if (body.course_id !== undefined) payload.course_id = body.course_id || null;
    if (body.status !== undefined) payload.status = body.status ?? "draft";
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("offer_pages")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
      }
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Offer page not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

/** Soft-delete: set status to archived. */
export async function DELETE(req: Request, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("offer_pages")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Offer page not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
