/**
 * PayPal server-side utilities.
 * Used only in API routes. Never expose PAYPAL_CLIENT_SECRET to the client.
 */

const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE ||
  (process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com");

const COURSE_AMOUNT = "199.00";
const CURRENCY = "USD";

export interface CreateOrderPayload {
  intent: "CAPTURE";
  purchase_units: Array<{
    amount: { currency_code: string; value: string };
    description?: string;
  }>;
}

/**
 * Get PayPal OAuth2 access token using client credentials.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing PayPal credentials: NEXT_PUBLIC_PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET"
    );
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Create a PayPal order (intent CAPTURE).
 * Returns the order ID for the client to use in the SDK.
 */
export async function createPayPalOrder(): Promise<string> {
  const token = await getPayPalAccessToken();

  const payload: CreateOrderPayload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: { currency_code: CURRENCY, value: COURSE_AMOUNT },
        description: "K-Beauty Glass Skin Masterclass",
      },
    ],
  };

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

/**
 * Capture a PayPal order by ID.
 * Call after client-side approval (PayPal button or card fields).
 */
export async function capturePayPalOrder(orderId: string): Promise<{
  id: string;
  status: string;
}> {
  if (!orderId) {
    throw new Error("Order ID is required for capture");
  }

  const token = await getPayPalAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { id: string; status: string };
  return data;
}

/**
 * Get order details from PayPal (after capture) for payer email and amount.
 * Used server-side for purchase recording.
 */
export async function getPayPalOrderDetails(orderId: string): Promise<{
  payerEmail: string | null;
  amount: string;
  currency: string;
}> {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const token = await getPayPalAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal get order failed: ${res.status} ${text}`);
  }

  const order = (await res.json()) as {
    payer?: { email_address?: string };
    purchase_units?: Array<{
      amount?: { currency_code?: string; value?: string };
    }>;
  };

  const email = order.payer?.email_address?.trim() || null;
  const unit = order.purchase_units?.[0];
  const amount = unit?.amount?.value ?? "0";
  const currency = unit?.amount?.currency_code ?? "USD";

  return { payerEmail: email, amount, currency };
}
