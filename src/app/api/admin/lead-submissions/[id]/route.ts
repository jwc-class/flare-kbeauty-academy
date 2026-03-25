import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "../../guard";

type Params = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** DELETE — lead_submissions 한 건만 삭제 (연락처는 유지). */
export async function DELETE(req: Request, { params }: Params) {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return auth.error;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  const { id } = await params;
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid submission id" }, { status: 400 });
  }

  try {
    const { error } = await supabase.from("lead_submissions").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
