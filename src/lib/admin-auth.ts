/**
 * Admin auth – client-side. Use Supabase session to build headers for /api/admin/*.
 * All admin API routes expect Authorization: Bearer <access_token>.
 */

import { supabase } from "@/lib/supabase";

/**
 * Returns headers for admin API requests. Call from client (admin pages) after ensuring user is logged in.
 * Resolves session from Supabase and adds Bearer token. Returns empty/minimal headers if no session.
 */
export async function getAdminHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window === "undefined") return headers;

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
