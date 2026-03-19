import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "@/lib/admin-guard";

/**
 * PATCH /api/admin/admin-users/[id]
 * Update admin status (revoke/reactivate) or role. Super_admin only.
 * Body: { status?: "active" | "revoked", role?: "admin" | "super_admin" }
 * Safety: prevent removing the last active super_admin (block self-demotion when alone).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireSuperAdmin(req);
  if ("error" in result) return result.error;
  const { admin: currentAdmin } = result;

  const { id } = await params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const status = body.status === "revoked" ? "revoked" : body.status === "active" ? "active" : undefined;
    const role = body.role === "super_admin" ? "super_admin" : body.role === "admin" ? "admin" : undefined;

    if (!status && !role) {
      return NextResponse.json({ error: "Provide status or role to update" }, { status: 400 });
    }

    const { data: target, error: fetchErr } = await supabase
      .from("admin_users")
      .select("id, profile_id, role, status")
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (fetchErr || !target) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    const isSelf = target.profile_id === currentAdmin.profile_id;
    const newRole = role ?? target.role;
    const newStatus = status ?? target.status;

    if (isSelf && newRole === "admin" && target.role === "super_admin") {
      const { count } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin")
        .eq("status", "active");
      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: "Cannot demote yourself: you are the only active super admin." },
          { status: 400 }
        );
      }
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (role !== undefined) updates.role = role;

    const { error: updateErr } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
