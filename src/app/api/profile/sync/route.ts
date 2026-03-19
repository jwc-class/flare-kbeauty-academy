import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { upsertProfileFromAuthUser } from "@/lib/profiles";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

/**
 * POST /api/profile/sync
 * Ensures the authenticated user has a profile row. Call after login.
 * Body: { access_token: string } or Authorization: Bearer <access_token>
 */
export async function POST(req: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Server config error" }, { status: 503 });
  }

  let accessToken: string | null = null;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    accessToken = authHeader.slice(7).trim();
  }
  if (!accessToken) {
    try {
      const body = await req.json();
      accessToken = typeof body?.access_token === "string" ? body.access_token.trim() : null;
    } catch {
      // no body
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access_token or Authorization header" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const profile = await upsertProfileFromAuthUser({
    id: user.id,
    email: user.email ?? null,
    user_metadata: user.user_metadata,
    app_metadata: user.app_metadata,
  });

  if (!profile) {
    return NextResponse.json({ error: "Failed to sync profile" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: { id: profile.id, auth_user_id: profile.auth_user_id, email: profile.email, full_name: profile.full_name, status: profile.status } });
}
