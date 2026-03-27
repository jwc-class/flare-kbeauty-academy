import type { AccountPurchaseRow } from "@/types/account";

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUserFromBearer } from "@/lib/auth-server";
import { getProfileByAuthUserId } from "@/lib/profiles";

export async function GET(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const user = await getUserFromBearer(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByAuthUserId(user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: rows, error } = await supabaseAdmin
    .from("purchases")
    .select(
      `
      id,
      amount,
      currency,
      purchased_at,
      external_order_id,
      payment_provider,
      courses ( title, slug )
    `
    )
    .eq("profile_id", profile.id)
    .order("purchased_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[account/purchases]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list: AccountPurchaseRow[] = (rows ?? []).map((row: Record<string, unknown>) => {
    const c = row.courses as Record<string, unknown> | null | undefined;
    return {
      id: String(row.id),
      amount: Number(row.amount),
      currency: String(row.currency ?? "USD"),
      purchased_at: String(row.purchased_at ?? ""),
      external_order_id: row.external_order_id != null ? String(row.external_order_id) : null,
      payment_provider: row.payment_provider != null ? String(row.payment_provider) : null,
      course_title: c?.title != null ? String(c.title) : null,
      course_slug: c?.slug != null ? String(c.slug) : null,
    };
  });

  return NextResponse.json(list);
}