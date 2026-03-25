import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../guard";

export type MemberListItem = {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  has_contact: boolean;
  purchase_count: number;
};

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  try {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, auth_user_id, email, full_name, avatar_url, provider, status, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const list = profiles ?? [];
    const contactsByEmailLower = new Map<string, string[]>();
    const purchaseCountByContactId = new Map<string, number>();

    const { data: allContacts, error: contactsErr } = await supabase
      .from("contacts")
      .select("id, email")
      .order("created_at", { ascending: false })
      .limit(15000);

    if (contactsErr) {
      return NextResponse.json({ error: contactsErr.message }, { status: 500 });
    }

    (allContacts ?? []).forEach((c: { id: string; email: string }) => {
      const k = c.email?.trim().toLowerCase();
      if (!k) return;
      if (!contactsByEmailLower.has(k)) contactsByEmailLower.set(k, []);
      contactsByEmailLower.get(k)!.push(c.id);
    });

    const uniqContactIds = [...new Set((allContacts ?? []).map((c: { id: string }) => c.id))];
    const chunkSize = 200;
    for (let i = 0; i < uniqContactIds.length; i += chunkSize) {
      const slice = uniqContactIds.slice(i, i + chunkSize);
      const { data: purchases } = await supabase.from("purchases").select("contact_id").in("contact_id", slice);
      (purchases ?? []).forEach((p: { contact_id: string }) => {
        purchaseCountByContactId.set(p.contact_id, (purchaseCountByContactId.get(p.contact_id) ?? 0) + 1);
      });
    }

    const members: MemberListItem[] = list.map((p) => {
      const emailKey = p.email?.trim().toLowerCase() ?? "";
      const ids = emailKey ? contactsByEmailLower.get(emailKey) ?? [] : [];
      const purchaseCount = ids.reduce((sum, cid) => sum + (purchaseCountByContactId.get(cid) ?? 0), 0);
      return {
        id: p.id,
        auth_user_id: p.auth_user_id,
        email: p.email ?? null,
        full_name: p.full_name ?? null,
        avatar_url: p.avatar_url ?? null,
        provider: p.provider ?? null,
        status: p.status ?? "active",
        created_at: p.created_at,
        updated_at: p.updated_at,
        has_contact: ids.length > 0,
        purchase_count: purchaseCount,
      };
    });

    return NextResponse.json(members);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
