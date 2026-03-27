import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getPayPalOrderDetails } from "@/lib/paypal";
import { getUserFromBearer } from "@/lib/auth-server";
import { getProfileByAuthUserId, upsertProfileFromAuthUser } from "@/lib/profiles";
import { grantEnrollmentForPurchase } from "@/lib/enrollments";

const DEFAULT_COURSE_SLUG = "glass-skin-masterclass";

/**
 * POST /api/purchase
 * Records a completed purchase after PayPal capture.
 * Body: { external_order_id (required), course_id?, course_slug? }
 * If Authorization: Bearer <token> is present, purchase is linked to user profile and enrollment is granted.
 */
export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Server not configured (SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const external_order_id =
      typeof body.external_order_id === "string" && body.external_order_id.trim()
        ? body.external_order_id.trim()
        : null;
    const course_id =
      typeof body.course_id === "string" && body.course_id.trim()
        ? body.course_id.trim()
        : null;
    const course_slug =
      typeof body.course_slug === "string" && body.course_slug.trim()
        ? body.course_slug.trim()
        : DEFAULT_COURSE_SLUG;

    if (!external_order_id) {
      return NextResponse.json({ error: "external_order_id is required" }, { status: 400 });
    }

    const authUser = await getUserFromBearer(req);
    let profileId: string | null = null;
    if (authUser) {
      await upsertProfileFromAuthUser({
        id: authUser.id,
        email: authUser.email ?? null,
        user_metadata: authUser.user_metadata,
        app_metadata: authUser.app_metadata,
      });
      const profile = await getProfileByAuthUserId(authUser.id);
      profileId = profile?.id ?? null;
    }

    // Idempotent path: if purchase already exists, ensure enrollment is also present/recovered.
    const { data: existing } = await supabaseAdmin
      .from("purchases")
      .select("id, course_id, profile_id")
      .eq("external_order_id", external_order_id)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      if (profileId) {
        if (!existing.profile_id) {
          await supabaseAdmin
            .from("purchases")
            .update({ profile_id: profileId })
            .eq("id", existing.id);
        }

        const enr = await grantEnrollmentForPurchase(
          supabaseAdmin,
          profileId,
          existing.course_id,
          existing.id
        );
        if (!enr.ok) {
          return NextResponse.json(
            { error: `Purchase exists but enrollment recovery failed: ${enr.message}` },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: profileId
          ? "Purchase already recorded; enrollment ensured"
          : "Purchase already recorded",
      });
    }

    let resolvedCourseId = course_id;
    if (!resolvedCourseId) {
      const { data: course } = await supabaseAdmin
        .from("courses")
        .select("id")
        .eq("slug", course_slug)
        .limit(1)
        .maybeSingle();
      if (!course?.id) {
        return NextResponse.json({ error: `Course not found: ${course_slug}` }, { status: 400 });
      }
      resolvedCourseId = course.id;
    }

    const orderDetails = await getPayPalOrderDetails(external_order_id);
    const payerEmail = orderDetails.payerEmail;
    if (!payerEmail) {
      return NextResponse.json(
        { error: "Could not determine payer email from order" },
        { status: 400 }
      );
    }

    const amount = parseFloat(orderDetails.amount);
    if (Number.isNaN(amount) || amount < 0) {
      return NextResponse.json({ error: "Invalid amount from order" }, { status: 400 });
    }
    const currency = orderDetails.currency || "USD";

    const contactEmail = (authUser?.email?.trim() || payerEmail).toLowerCase();

    const { data: existingContact } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("email", contactEmail)
      .limit(1)
      .maybeSingle();

    let contactId: string;
    if (existingContact?.id) {
      contactId = existingContact.id;
    } else {
      const { data: newContact, error: insertErr } = await supabaseAdmin
        .from("contacts")
        .insert({
          email: contactEmail,
          first_name: null,
          last_name: null,
          phone_country_code: null,
          phone_number: null,
          marketing_consent: false,
          source: "paypal_purchase",
        })
        .select("id")
        .single();

      if (insertErr || !newContact?.id) {
        console.error("[purchase] contact insert failed", insertErr);
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
      }
      contactId = newContact.id;
    }

    const { data: newPurchase, error: purchaseErr } = await supabaseAdmin
      .from("purchases")
      .insert({
        contact_id: contactId,
        course_id: resolvedCourseId,
        amount,
        currency,
        payment_provider: "paypal",
        payment_status: "completed",
        external_order_id,
        profile_id: profileId,
      })
      .select("id")
      .single();

    if (purchaseErr) {
      if (purchaseErr.code === "23505") {
        return NextResponse.json({ success: true, message: "Purchase already recorded" });
      }
      console.error("[purchase] insert failed", purchaseErr);
      return NextResponse.json(
        { error: purchaseErr.message || "Failed to record purchase" },
        { status: 500 }
      );
    }

    if (profileId && newPurchase?.id) {
      const enr = await grantEnrollmentForPurchase(
        supabaseAdmin,
        profileId,
        resolvedCourseId,
        newPurchase.id
      );
      if (!enr.ok) {
        return NextResponse.json(
          { error: `Purchase recorded but enrollment failed: ${enr.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record purchase";
    console.error("[purchase]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
