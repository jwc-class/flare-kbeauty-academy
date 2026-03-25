import { NextResponse } from "next/server";
import { listContactIdsForEmail } from "@/lib/contacts-resolve";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../../../guard";

type Params = { params: Promise<{ id: string }> };

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function relOne<T>(rel: T | T[] | null | undefined): T | null {
  if (rel == null) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}

/**
 * GET /api/admin/members/[id]/leads
 * 프로필 이메일과 동일한 contacts(제출마다 별도 행)에 연결된 lead_submissions 전부.
 */
export async function GET(req: Request, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", id)
      .maybeSingle();

    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
    if (!profile?.email?.trim()) {
      return NextResponse.json({ error: "프로필을 찾을 수 없거나 이메일이 없습니다." }, { status: 404 });
    }

    const email = profile.email.trim();
    const contactIds = await listContactIdsForEmail(supabase, email);

    if (contactIds.length === 0) {
      return NextResponse.json({
        profile: { id: profile.id, email: profile.email, full_name: profile.full_name },
        submissions: [],
      });
    }

    const raw: Record<string, unknown>[] = [];
    for (const part of chunk(contactIds, 120)) {
      const { data: batch, error: bErr } = await supabase
        .from("lead_submissions")
        .select(
          `
          id,
          submitted_at,
          contacts (
            first_name,
            last_name,
            email,
            phone_country_code,
            phone_number,
            marketing_consent,
            source,
            created_at
          )
        `
        )
        .in("contact_id", part);
      if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });
      raw.push(...((batch ?? []) as Record<string, unknown>[]));
    }

    const submissions = raw
      .map((row) => {
        const c = relOne(row.contacts as Record<string, unknown> | Record<string, unknown>[] | null);
        const contact = c && typeof c === "object" && !Array.isArray(c) ? c : null;
        return {
          id: String(row.id),
          submitted_at: String(row.submitted_at),
          first_name: contact ? (contact.first_name as string | null) ?? null : null,
          last_name: contact ? (contact.last_name as string | null) ?? null : null,
          email: contact ? String(contact.email ?? "") : "",
          phone_country_code: contact ? (contact.phone_country_code as string | null) ?? null : null,
          phone_number: contact ? (contact.phone_number as string | null) ?? null : null,
          marketing_consent: Boolean(contact?.marketing_consent),
          source: contact ? (contact.source as string | null) ?? null : null,
        };
      })
      .sort((a, b) => {
        const tb = new Date(b.submitted_at).getTime();
        const ta = new Date(a.submitted_at).getTime();
        if (tb !== ta) return tb - ta;
        return String(b.id).localeCompare(String(a.id));
      });

    return NextResponse.json({
      profile: { id: profile.id, email: profile.email, full_name: profile.full_name },
      submissions,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
