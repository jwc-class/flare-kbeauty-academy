import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createPayPalOrder } from "@/lib/paypal";

/**
 * POST /api/paypal/create-order
 * Body: { course_slug?: string } — 강의 slug가 있으면 해당 강의의 가격/제목으로 주문 생성.
 * Creates a PayPal order server-side. Returns { orderId } for the client SDK.
 */
export async function POST(req: Request) {
  try {
    let options: { amount: string; currency: string; description: string } | null = null;
    const body = await req.json().catch(() => ({}));
    const courseSlug = typeof body?.course_slug === "string" ? body.course_slug.trim() : null;

    if (courseSlug) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data: course } = await supabase
          .from("courses")
          .select("price, currency, title")
          .eq("slug", courseSlug)
          .eq("status", "published")
          .maybeSingle();
        if (course) {
          const price = Number(course.price);
          const value = Number.isFinite(price) && price >= 0 ? price.toFixed(2) : "0.00";
          options = {
            amount: value,
            currency: (course.currency ?? "USD").toUpperCase(),
            description: (course.title ?? "Course").slice(0, 127),
          };
        }
      }
    }

    const orderId = await createPayPalOrder(options);
    return NextResponse.json({ orderId, orderID: orderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    console.error("[PayPal create-order]", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
