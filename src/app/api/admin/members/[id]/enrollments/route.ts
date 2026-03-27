import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../../../guard";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  const { id: profileId } = await params;
  if (!profileId?.trim()) {
    return NextResponse.json({ error: "Invalid profile id" }, { status: 400 });
  }

  try {
    const { data: rows, error } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        status,
        granted_at,
        source,
        courses ( id, title, slug, status )
      `
      )
      .eq("profile_id", profileId.trim())
      .order("granted_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(rows ?? []);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}