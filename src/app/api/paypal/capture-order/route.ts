import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

/**
 * POST /api/paypal/capture-order
 * Body: { orderId: string }
 * Captures the order after client-side approval. Returns capture result.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body?.orderId ?? body?.orderID;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const result = await capturePayPalOrder(orderId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to capture order";
    console.error("[PayPal capture-order]", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
