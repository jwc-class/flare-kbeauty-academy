import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "../../guard";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, { params }: Params) {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return auth.error;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    // Guard: do not allow deleting profiles that are currently registered as admin users.
    const { data: adminUser } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("profile_id", id)
      .maybeSingle();
    if (adminUser?.id) {
      return NextResponse.json(
        { error: "이 멤버는 admin_users에 연결되어 있어 삭제할 수 없습니다. 먼저 Admin Users에서 권한을 해제하세요." },
        { status: 409 }
      );
    }

    const { error } = await supabaseAdmin.from("profiles").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
