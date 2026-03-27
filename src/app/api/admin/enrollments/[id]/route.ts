import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../../guard";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  const { id } = await params;
  const enrollmentId = id?.trim();
  if (!enrollmentId) {
    return NextResponse.json({ error: "Invalid enrollment id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("enrollments")
    .update({ status: "revoked", updated_at: new Date().toISOString() })
    .eq("id", enrollmentId)
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}