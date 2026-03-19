import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "@/lib/admin-guard";

export type AdminUserListItem = {
  id: string;
  profile_id: string;
  email: string;
  role: string;
  status: string;
  granted_by_profile_id: string | null;
  created_at: string;
  updated_at: string;
  /** Resolved from profiles */
  full_name: string | null;
  /** Resolved from granter profile */
  granted_by_name: string | null;
  granted_by_email: string | null;
};

/**
 * GET /api/admin/admin-users
 * List all admin_users with resolved profile and granter names. Super_admin only.
 */
export async function GET(req: Request) {
  const result = await requireSuperAdmin(req);
  if ("error" in result) return result.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  try {
    const { data: rows, error } = await supabase
      .from("admin_users")
      .select("id, profile_id, email, role, status, granted_by_profile_id, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = rows ?? [];
    if (list.length === 0) {
      return NextResponse.json([]);
    }

    const profileIds = [...new Set(list.map((r) => r.profile_id))];
    const granterIds = [...new Set(list.map((r) => r.granted_by_profile_id).filter(Boolean))] as string[];

    const allIds = [...new Set([...profileIds, ...granterIds])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", allIds);

    const profileMap = new Map<string | null, { full_name: string | null; email: string | null }>();
    (profiles ?? []).forEach((p: { id: string; full_name: string | null; email: string | null }) => {
      profileMap.set(p.id, { full_name: p.full_name ?? null, email: p.email ?? null });
    });

    const items: AdminUserListItem[] = list.map((r) => {
      const profile = profileMap.get(r.profile_id);
      const granter = r.granted_by_profile_id ? profileMap.get(r.granted_by_profile_id) : null;
      return {
        id: r.id,
        profile_id: r.profile_id,
        email: r.email,
        role: r.role,
        status: r.status,
        granted_by_profile_id: r.granted_by_profile_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
        full_name: profile?.full_name ?? null,
        granted_by_name: granter?.full_name ?? null,
        granted_by_email: granter?.email ?? null,
      };
    });

    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/admin-users
 * Grant admin access to an existing member (by email). Super_admin only.
 * Body: { email: string, role: "admin" | "super_admin" }
 */
export async function POST(req: Request) {
  const result = await requireSuperAdmin(req);
  if ("error" in result) return result.error;
  const { admin: currentAdmin } = result;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = body.role === "super_admin" ? "super_admin" : "admin";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();

    if (profileError || !profile?.id) {
      return NextResponse.json(
        { error: "This user has not signed in yet." },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("admin_users")
      .select("id, status, role")
      .eq("profile_id", profile.id)
      .limit(1)
      .maybeSingle();

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { error: "This user already has admin access." },
          { status: 409 }
        );
      }
      const { error: updateErr } = await supabase
        .from("admin_users")
        .update({
          status: "active",
          role,
          granted_by_profile_id: currentAdmin.profile_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Admin access reactivated." });
    }

    const { error: insertErr } = await supabase.from("admin_users").insert({
      profile_id: profile.id,
      email: profile.email ?? email,
      role,
      status: "active",
      granted_by_profile_id: currentAdmin.profile_id,
    });

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: "Admin access granted." });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
