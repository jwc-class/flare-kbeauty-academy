import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

/**
 * POST /api/paypal/create-order
 * Creates a PayPal order server-side. Returns { orderId } for the client SDK.
 */
export async function POST() {
  try {
    const orderId = await createPayPalOrder();
    // Return both for SDK compatibility (some clients expect orderID)
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
