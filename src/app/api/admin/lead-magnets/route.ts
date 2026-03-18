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
      .from("lead_magnets")
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
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin.from("lead_magnets").insert({
      title: body.title ?? "",
      slug: body.slug ?? "",
      subtitle: body.subtitle ?? null,
      description: body.description ?? null,
      thumbnail_url: body.thumbnail_url ?? null,
      file_url: body.file_url ?? null,
      delivery_type: body.delivery_type ?? null,
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
