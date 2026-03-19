/**
 * Server-side profile helpers. Use with getSupabaseAdmin for upsert; use anon/client for RLS-bound reads.
 */

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Profile } from "@/types/profile";

export type AuthUserForProfile = {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string; name?: string; avatar_url?: string };
  app_metadata?: { provider?: string };
};

/**
 * Upsert a profile from auth user data. Idempotent; safe for sync on every login.
 * Call from API or trigger; uses admin client.
 */
export async function upsertProfileFromAuthUser(authUser: AuthUserForProfile): Promise<Profile | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const fullName =
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    "";
  const avatarUrl = authUser.user_metadata?.avatar_url ?? null;
  const provider = authUser.app_metadata?.provider ?? "google";

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        auth_user_id: authUser.id,
        email: authUser.email ?? null,
        full_name: fullName || null,
        avatar_url: avatarUrl,
        provider,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "auth_user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("[profiles] upsert error:", error.message);
    return null;
  }
  return data as Profile;
}

/**
 * Get profile by auth user id. Uses admin client (bypasses RLS).
 */
export async function getProfileByAuthUserId(authUserId: string): Promise<Profile | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("[profiles] get error:", error.message);
    return null;
  }
  return data as Profile | null;
}
