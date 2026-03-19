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
    const emails = list.map((p) => p.email).filter((e): e is string => !!e?.trim());
    const contactByEmail = new Map<string, { id: string }>();
    const purchaseCountByContactId = new Map<string, number>();

    if (emails.length > 0) {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("id, email")
        .in("email", emails);
      (contacts ?? []).forEach((c: { id: string; email: string }) => {
        contactByEmail.set(c.email.trim().toLowerCase(), { id: c.id });
      });

      const contactIds = Array.from(contactByEmail.values()).map((c) => c.id);
      if (contactIds.length > 0) {
        const { data: purchases } = await supabase
          .from("purchases")
          .select("contact_id");
        const countBy = new Map<string, number>();
        (purchases ?? []).forEach((p: { contact_id: string }) => {
          countBy.set(p.contact_id, (countBy.get(p.contact_id) ?? 0) + 1);
        });
        countBy.forEach((count, id) => purchaseCountByContactId.set(id, count));
      }
    }

    const members: MemberListItem[] = list.map((p) => {
      const emailKey = p.email?.trim().toLowerCase() ?? "";
      const contact = emailKey ? contactByEmail.get(emailKey) : null;
      const purchaseCount = contact ? purchaseCountByContactId.get(contact.id) ?? 0 : 0;
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
        has_contact: !!contact,
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
