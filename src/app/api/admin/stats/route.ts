import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../guard";

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Server not configured for admin (SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 503 }
    );
  }

  try {
    const [contacts, leadSubmissions, purchases, courses, landingPages] = await Promise.all([
      supabaseAdmin.from("contacts").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("lead_submissions").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("purchases").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("courses").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("landing_pages").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      contacts: contacts.count ?? 0,
      lead_submissions: leadSubmissions.count ?? 0,
      purchases: purchases.count ?? 0,
      courses: courses.count ?? 0,
      landing_pages: landingPages.count ?? 0,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
