import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../guard";

export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("courses")
      .select("*")
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
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin.from("courses").insert({
      title: body.title ?? "",
      slug: body.slug ?? "",
      thumbnail_url: body.thumbnail_url ?? null,
      price: Number(body.price) ?? 0,
      currency: body.currency ?? "USD",
      short_description: body.short_description ?? null,
      sales_page_content: body.sales_page_content ?? null,
      instructor_name: body.instructor_name ?? null,
      status: body.status ?? "draft",
      paypal_link: body.paypal_link ?? null,
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
