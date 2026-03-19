import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-authorization";
import type { AdminUser } from "@/lib/admin-authorization";

/**
 * Protects admin API routes: requires valid Supabase session + active admin_users row.
 * Client must send Authorization: Bearer <access_token> from Supabase auth.
 */
export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Protects admin API routes that only super_admin may access (e.g. admin user management).
 * Returns the current admin on success; use for granted_by_profile_id etc.
 */
export async function requireSuperAdmin(req: Request): Promise<{ error: NextResponse } | { admin: AdminUser }> {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (admin.role !== "super_admin") {
    return { error: NextResponse.json({ error: "Forbidden. Super admin only." }, { status: 403 }) };
  }
  return { admin };
}
