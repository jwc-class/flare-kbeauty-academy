import { NextResponse } from "next/server";
import type { AdminLeadListRow } from "@/types/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../guard";

function mapViewRow(r: Record<string, unknown>): AdminLeadListRow {
  return {
    id: String(r.list_id),
    origin: r.origin === "legacy" ? "legacy" : "submission",
    submitted_at: String(r.sort_at),
    first_name: r.first_name != null ? String(r.first_name) : null,
    last_name: r.last_name != null ? String(r.last_name) : null,
    email: String(r.email ?? ""),
    phone_country_code: r.phone_country_code != null ? String(r.phone_country_code) : null,
    phone_number: r.phone_number != null ? String(r.phone_number) : null,
    marketing_consent: Boolean(r.marketing_consent),
    source: r.source != null ? String(r.source) : null,
    contact_created_at: r.contact_row_created_at != null ? String(r.contact_row_created_at) : null,
  };
}

/**
 * GET — 제출 1건 = 1행, 페이지네이션 (?page=1&pageSize=50|100)
 */
export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const rawSize = parseInt(url.searchParams.get("pageSize") || "50", 10) || 50;
    const pageSize = rawSize >= 100 ? 100 : 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("admin_lead_rows")
      .select("*", { count: "exact" })
      .order("sort_at", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows: AdminLeadListRow[] = (data ?? []).map((row) => mapViewRow(row as Record<string, unknown>));

    return NextResponse.json({
      rows,
      total: count ?? rows.length,
      page,
      pageSize,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
