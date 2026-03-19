/**
 * Supabase Auth helpers for the public site.
 * Use in client components only (session, OAuth redirect).
 *
 * Supabase Dashboard: Authentication → URL Configuration → Redirect URLs
 * Add: http://localhost:3001/auth/callback and https://yourdomain.com/auth/callback
 * Enable Google in Authentication → Providers → Google (Client ID + Secret from Google Cloud).
 */

import { supabase } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string; avatar_url?: string; name?: string };
};

export type AuthSession = {
  user: AuthUser;
  access_token: string;
  expires_at?: number;
};

/**
 * Start Google OAuth flow. Redirects to Google, then back to redirectTo (default /auth/callback).
 */
export async function signInWithGoogle(redirectTo?: string): Promise<{ error: Error | null }> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const callbackUrl = redirectTo ?? `${origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  return { error: error ? new Error(error.message) : null };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error ? new Error(error.message) : null };
}

/**
 * Get current session (use in client).
 */
export async function getSession(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getSession();
  const s = data?.session;
  if (!s?.user) return null;
  return {
    user: {
      id: s.user.id,
      email: s.user.email ?? null,
      user_metadata: s.user.user_metadata,
    },
    access_token: s.access_token ?? "",
    expires_at: s.expires_at,
  };
}

/**
 * Get current user (use in client).
 */
export async function getUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}
