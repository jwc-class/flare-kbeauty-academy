import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../guard";

/** 목록에 표시할 연락처 행 (contacts + 기존 leads 통합) */
type ContactListItem = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_country_code: string | null;
  phone_number: string | null;
  marketing_consent: boolean;
  source: string | null;
  created_at: string;
  updated_at?: string;
  origin: "contacts" | "legacy";
};

export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const [contactsRes, leadsRes] = await Promise.all([
      supabaseAdmin
        .from("contacts")
        .select("id, first_name, last_name, email, phone_country_code, phone_number, marketing_consent, source, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin
        .from("leads")
        .select("id, email, first_name, country_code, phone_number, marketing_consent, source, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    if (contactsRes.error) return NextResponse.json({ error: contactsRes.error.message }, { status: 500 });

    const contactRows: ContactListItem[] = (contactsRes.data ?? []).map((c: { id: string; first_name: string | null; last_name: string | null; email: string; phone_country_code: string | null; phone_number: string | null; marketing_consent: boolean; source: string | null; created_at: string; updated_at?: string }) => ({
      id: c.id,
      first_name: c.first_name ?? null,
      last_name: c.last_name ?? null,
      email: c.email ?? "",
      phone_country_code: c.phone_country_code ?? null,
      phone_number: c.phone_number ?? null,
      marketing_consent: Boolean(c.marketing_consent),
      source: c.source ?? null,
      created_at: c.created_at,
      updated_at: c.updated_at,
      origin: "contacts" as const,
    }));

    const legacyRows: ContactListItem[] = (leadsRes.error ? [] : leadsRes.data ?? []).map((l: { id: number; email: string; first_name: string | null; country_code: string | null; phone_number: string | null; marketing_consent: boolean; source: string | null; created_at: string }) => ({
      id: `legacy-${l.id}`,
      first_name: l.first_name ?? null,
      last_name: null,
      email: l.email ?? "",
      phone_country_code: l.country_code ?? null,
      phone_number: l.phone_number ?? null,
      marketing_consent: Boolean(l.marketing_consent),
      source: l.source ?? null,
      created_at: l.created_at,
      updated_at: l.created_at,
      origin: "legacy" as const,
    }));

    const merged = [...contactRows, ...legacyRows].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(merged);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin.from("contacts").insert({
      first_name: body.first_name ?? null,
      last_name: body.last_name ?? null,
      email: body.email ?? "",
      phone_country_code: body.phone_country_code ?? null,
      phone_number: body.phone_number ?? null,
      marketing_consent: Boolean(body.marketing_consent),
      source: body.source ?? null,
    }).select("id, first_name, last_name, email, phone_country_code, phone_number, marketing_consent, source, created_at, updated_at").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
