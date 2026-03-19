/**
 * Server-only: resolve admin user from request using Bearer token + admin_users table.
 * Used by admin API guard and /api/auth/admin-status.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const INITIAL_SUPER_ADMIN_EMAIL = "jwchoi@classaround.co.kr";

export type AdminUser = {
  id: string;
  profile_id: string;
  email: string;
  role: string;
  status: string;
};

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

/**
 * Resolve current user from Bearer token (Supabase JWT).
 * Returns auth user or null.
 */
async function getAuthUserFromRequest(req: Request): Promise<{ id: string; email: string | null } | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? null };
}

/**
 * Ensure initial super admin exists for jwchoi@classaround.co.kr when they have a profile.
 * Idempotent: creates one row per profile, no duplicates.
 */
async function ensureSuperAdmin(profileId: string, email: string): Promise<AdminUser | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data: existing } = await admin
    .from("admin_users")
    .select("id, profile_id, email, role, status")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (existing) return existing as AdminUser;

  const { data: inserted, error } = await admin
    .from("admin_users")
    .insert({
      profile_id: profileId,
      email: email.toLowerCase().trim(),
      role: "super_admin",
      status: "active",
      granted_by_profile_id: null,
    })
    .select("id, profile_id, email, role, status")
    .single();

  if (error || !inserted) return null;
  return inserted as AdminUser;
}

/**
 * Get admin user for the current request.
 * Uses Bearer token -> auth user -> profile -> admin_users.
 * If email is jwchoi@classaround.co.kr and no row exists, creates one (initial super admin).
 */
export async function getAdminFromRequest(req: Request): Promise<AdminUser | null> {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) return null;

  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, email")
    .eq("auth_user_id", authUser.id)
    .limit(1)
    .maybeSingle();

  if (profileError || !profile?.id) return null;

  const email = (authUser.email ?? profile.email ?? "").trim().toLowerCase();
  if (!email) return null;

  const { data: adminRow } = await admin
    .from("admin_users")
    .select("id, profile_id, email, role, status")
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (adminRow) return adminRow as AdminUser;

  // Initial super admin: ensure row for jwchoi@classaround.co.kr
  if (email === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase()) {
    return ensureSuperAdmin(profile.id, email);
  }

  return null;
}
