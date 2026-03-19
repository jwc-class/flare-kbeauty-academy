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
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
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
    if (body.thumbnail_url !== undefined) payload.thumbnail_url = body.thumbnail_url ?? null;
    if (body.price !== undefined) payload.price = Number(body.price) ?? 0;
    if (body.currency !== undefined) payload.currency = body.currency ?? "USD";
    if (body.short_description !== undefined) payload.short_description = body.short_description ?? null;
    if (body.sales_page_content !== undefined) payload.sales_page_content = body.sales_page_content ?? null;
    if (body.instructor_name !== undefined) payload.instructor_name = body.instructor_name ?? null;
    if (body.status !== undefined) payload.status = body.status ?? "draft";
    if (body.paypal_link !== undefined) payload.paypal_link = body.paypal_link ?? null;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("courses")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
      }
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
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
      .from("courses")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
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
