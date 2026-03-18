/**
 * Admin auth – session key and header name. All /admin/* routes and API use this.
 * Prompt 2: replace with proper auth (e.g. Supabase Auth, JWT) if needed.
 */

export const ADMIN_SESSION_KEY = "admin_authenticated";

export function getAdminPassword(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_SESSION_KEY);
}

export function getAdminHeaders(): Record<string, string> {
  const pwd = typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_SESSION_KEY) : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (pwd) headers["x-admin-password"] = pwd;
  return headers;
}
