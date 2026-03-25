import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Normalize incoming lead form payload to a single shape.
 * Tolerates: country_code vs phone_country_code, phone vs phone_number, etc.
 */
function normalizeLeadPayload(body: Record<string, unknown>) {
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const first_name = typeof body.first_name === "string" ? body.first_name.trim() || null : null;
  const last_name = typeof body.last_name === "string" ? body.last_name.trim() || null : null;
  const phone_country_code =
    (typeof body.phone_country_code === "string" && body.phone_country_code.trim()) ||
    (typeof body.country_code === "string" && body.country_code.trim()) ||
    null;
  const phone_number =
    (typeof body.phone_number === "string" && body.phone_number.trim()) ||
    (typeof body.phone === "string" && body.phone.trim()) ||
    null;
  const marketing_consent = Boolean(body.marketing_consent);
  const source =
    typeof body.source === "string" && body.source.trim()
      ? body.source.trim()
      : "main";
  const landing_page_id =
    typeof body.landing_page_id === "string" && body.landing_page_id.trim()
      ? body.landing_page_id.trim()
      : null;
  const utm_source = typeof body.utm_source === "string" ? body.utm_source.trim() || null : null;
  const utm_medium = typeof body.utm_medium === "string" ? body.utm_medium.trim() || null : null;
  const utm_campaign = typeof body.utm_campaign === "string" ? body.utm_campaign.trim() || null : null;
  const referrer = typeof body.referrer === "string" ? body.referrer.trim() || null : null;

  return {
    email,
    first_name,
    last_name,
    phone_country_code,
    phone_number,
    marketing_consent,
    source,
    landing_page_id,
    utm_source,
    utm_medium,
    utm_campaign,
    referrer,
  };
}

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const payload = normalizeLeadPayload(body);

    if (!payload.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // 매 제출마다 새 contacts 행 (이메일이 같아도 전화·이름 등은 제출 시점 스냅샷으로 독립)
    const emailCanonical = payload.email.trim().toLowerCase();
    const { data: newContact, error: contactError } = await supabaseAdmin
      .from("contacts")
      .insert({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: emailCanonical,
        phone_country_code: payload.phone_country_code,
        phone_number: payload.phone_number,
        marketing_consent: payload.marketing_consent,
        source: payload.source,
      })
      .select("id")
      .maybeSingle();

    if (contactError) {
      return NextResponse.json(
        { error: contactError.message || "Failed to create contact" },
        { status: 500 }
      );
    }
    if (!newContact?.id) {
      return NextResponse.json(
        { error: "Failed to create contact" },
        { status: 500 }
      );
    }

    const submissionRow = {
      contact_id: newContact.id,
      landing_page_id: payload.landing_page_id || null,
      utm_source: payload.utm_source,
      utm_medium: payload.utm_medium,
      utm_campaign: payload.utm_campaign,
      referrer: payload.referrer,
    };

    let { error: submissionError, data: insertedSub } = await supabaseAdmin
      .from("lead_submissions")
      .insert(submissionRow)
      .select("id")
      .maybeSingle();

    if (submissionError) {
      const fkFail =
        submissionError.code === "23503" ||
        /foreign key|violates foreign key/i.test(submissionError.message || "");
      if (fkFail && submissionRow.landing_page_id) {
        const retry = await supabaseAdmin
          .from("lead_submissions")
          .insert({ ...submissionRow, landing_page_id: null })
          .select("id")
          .maybeSingle();
        submissionError = retry.error;
        insertedSub = retry.data;
      }
    }

    if (submissionError) {
      return NextResponse.json(
        { error: submissionError.message || "Failed to record submission" },
        { status: 500 }
      );
    }
    if (!insertedSub?.id) {
      return NextResponse.json(
        { error: "Failed to record submission" },
        { status: 500 }
      );
    }

    let redirect_to = "/thank-you";
    if (payload.landing_page_id) {
      const { data: lp } = await supabaseAdmin
        .from("landing_pages")
        .select("offer_page_id, offer_pages(slug, status)")
        .eq("id", payload.landing_page_id)
        .maybeSingle();
      const rel = (lp as { offer_pages?: { slug?: string | null; status?: string | null } | null } | null)?.offer_pages;
      if (rel?.slug && rel.status === "published") {
        redirect_to = `/offers/${rel.slug}`;
      }
    }

    return NextResponse.json({ success: true, redirect_to });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
