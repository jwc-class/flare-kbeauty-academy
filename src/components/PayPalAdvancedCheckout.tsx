"use client";

import { useEffect, useRef, useState } from "react";

const PAYPAL_SCRIPT_URL = "https://www.paypal.com/sdk/js";
const CREATE_ORDER_URL = "/api/paypal/create-order";
const CAPTURE_ORDER_URL = "/api/paypal/capture-order";
const PURCHASE_RECORD_URL = "/api/purchase";
const SUCCESS_URL = "/purchase-complete";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: PayPalButtonsOptions) => { render: (el: HTMLElement) => Promise<unknown> };
      CardFields?: (options: PayPalCardFieldsOptions) => PayPalCardFieldsInstance;
    };
  }
}

interface PayPalButtonsOptions {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError: (err: unknown) => void;
  onCancel?: () => void;
  style?: { layout?: string; color?: string; shape?: string; borderRadius?: number };
}

interface PayPalCardFieldsOptions {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError: (err: unknown) => void;
  onCancel?: () => void;
  style?: Record<string, Record<string, string>>;
}

interface PayPalCardFieldsInstance {
  isEligible: () => boolean;
  NumberField: (opts?: object) => { render: (el: HTMLElement) => void };
  ExpiryField: (opts?: object) => { render: (el: HTMLElement) => void };
  CVVField: (opts?: object) => { render: (el: HTMLElement) => void };
  NameField: (opts?: object) => { render: (el: HTMLElement) => void };
  getState: () => Promise<{ isFormValid: boolean }>;
  submit: () => Promise<void>;
}

type PayPalAdvancedCheckoutProps = {
  /** Course slug for purchase tracking (e.g. "glass-skin-masterclass"). Default used if omitted. */
  courseSlug?: string;
  /** PayPal Client ID. 서버에서 전달하면 Vercel 등 빌드 시 env가 없어도 런타임에 버튼 표시 가능. */
  paypalClientId?: string | null;
  /** 강의 제목. 결제 요약 카드에 표시. */
  courseTitle?: string | null;
  /** 포맷된 가격 문자열 (예: "$100"). 어드민에서 설정한 가격과 동일하게 표시. */
  priceFormatted?: string | null;
  /** Optional Supabase access token so purchase is linked to the logged-in member. */
  accessToken?: string | null;
};

export default function PayPalAdvancedCheckout({ courseSlug, paypalClientId: paypalClientIdProp, courseTitle, priceFormatted, accessToken }: PayPalAdvancedCheckoutProps = {}) {
  const buttonsRef = useRef<HTMLDivElement>(null);
  const cardNameRef = useRef<HTMLDivElement>(null);
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const cardExpiryRef = useRef<HTMLDivElement>(null);
  const cardCvvRef = useRef<HTMLDivElement>(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardSubmitLoading, setCardSubmitLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardFieldsAvailable, setCardFieldsAvailable] = useState(false);
  const cardFieldsRef = useRef<PayPalCardFieldsInstance | null>(null);

  const clientId = (paypalClientIdProp ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)?.trim() || undefined;

  const createOrder = async (): Promise<string> => {
    const res = await fetch(CREATE_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: courseSlug ? JSON.stringify({ course_slug: courseSlug }) : "{}",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error || `Failed to create order (${res.status})`;
      throw new Error(msg);
    }
    return data.orderId || data.orderID;
  };

  const onApprove = async (data: { orderID: string }) => {
    const res = await fetch(CAPTURE_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: data.orderID }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to capture payment");
    }

    // Record purchase in DB; server uses session when accessToken present to link to logged-in member
    const purchaseHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken?.trim()) purchaseHeaders["Authorization"] = `Bearer ${accessToken.trim()}`;
    try {
      await fetch(PURCHASE_RECORD_URL, {
        method: "POST",
        headers: purchaseHeaders,
        body: JSON.stringify({
          external_order_id: data.orderID,
          ...(courseSlug && { course_slug: courseSlug }),
        }),
      });
    } catch (e) {
      console.error("[PayPal] Purchase record failed", e);
    }

    window.location.href = `${SUCCESS_URL}?orderId=${encodeURIComponent(data.orderID)}`;
  };

  const handleCardSubmit = async () => {
    const cardFields = cardFieldsRef.current;
    if (!cardFields) return;
    setCardError(null);
    try {
      const state = await cardFields.getState();
      if (!state.isFormValid) {
        setCardError("Please fill in all card fields correctly.");
        return;
      }
      setCardSubmitLoading(true);
      await cardFields.submit();
      // onApprove is called by SDK after successful card submission
      // We need to capture and redirect there; ensure onApprove runs
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setCardError(message);
    } finally {
      setCardSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) {
      setError("PayPal is not configured. Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID.");
      setLoading(false);
      return;
    }

    // 이미 다른 페이지에서 스크립트가 로드된 경우 (SPA 이동) 바로 준비 완료 처리
    if (typeof window !== "undefined" && window.paypal) {
      setSdkReady(true);
      return;
    }

    // 이미 같은 src의 스크립트가 있으면 onload 대신 타이머로 확인
    const existing = document.querySelector(`script[src^="${PAYPAL_SCRIPT_URL}"]`);
    if (existing) {
      const check = () => {
        if (window.paypal) setSdkReady(true);
        else requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
      return;
    }

    const script = document.createElement("script");
    script.src = `${PAYPAL_SCRIPT_URL}?client-id=${clientId}&components=buttons,card-fields&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => {
      setError("Failed to load PayPal.");
      setLoading(false);
    };
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [clientId]);

  useEffect(() => {
    if (!sdkReady || !window.paypal) return;

    setError(null);

    // ref 컨테이너가 DOM에 붙은 뒤 한 프레임 대기 후 버튼 렌더 (다른 페이지에서 진입 시 대비)
    const runRender = () => {
      const el = buttonsRef.current;
      if (!el || !window.paypal?.Buttons) {
        setLoading(false);
        return;
      }
      el.innerHTML = ""; // 이전 인스턴스가 남아 있으면 비움
      window.paypal
        .Buttons({
          createOrder,
          onApprove,
          onError: (err: unknown) => {
            console.error("[PayPal onError]", err);
            const msg =
              err instanceof Error
                ? err.message
                : typeof err === "string"
                  ? err
                  : "Something went wrong with PayPal. Please try again.";
            setError(msg);
          },
          onCancel: () => setError("Payment was cancelled."),
          style: { layout: "vertical", color: "gold", shape: "rect", borderRadius: 10 },
        })
        .render(el)
        .catch((err) => {
          console.error("[PayPal Buttons]", err);
          setError("Could not load PayPal buttons.");
        });
    };

    const scheduleRender = () => {
      if (buttonsRef.current) {
        runRender();
      } else {
        requestAnimationFrame(() => {
          if (buttonsRef.current) runRender();
          else setTimeout(runRender, 50);
        });
      }
    };

    scheduleRender();

    // Card fields (optional; only if component exists)
    if (window.paypal.CardFields && cardNumberRef.current && cardExpiryRef.current && cardCvvRef.current) {
      const cardStyle = {
        input: {
          "font-size": "16px",
          "font-family": "var(--font-inter), system-ui, sans-serif",
          color: "var(--foreground)",
        },
        ".invalid": { color: "var(--flare-support-1)" },
      };

      const cardFields = window.paypal.CardFields({
        createOrder,
        onApprove: async (data) => {
          await onApprove(data);
          setCardSubmitLoading(false);
        },
        onError: (err) => {
          console.error("[PayPal Card]", err);
          setCardError("Card payment failed. Please check your details.");
          setCardSubmitLoading(false);
        },
        onCancel: () => {
          setCardError("Payment was cancelled.");
          setCardSubmitLoading(false);
        },
        style: cardStyle,
      });

      if (cardFields.isEligible()) {
        cardFieldsRef.current = cardFields;
        setCardFieldsAvailable(true);
        if (cardNameRef.current) cardFields.NameField({ placeholder: "Name on card" }).render(cardNameRef.current);
        cardFields.NumberField().render(cardNumberRef.current);
        cardFields.ExpiryField().render(cardExpiryRef.current);
        cardFields.CVVField().render(cardCvvRef.current);
      }
    }

    setLoading(false);
  }, [sdkReady]);

  if (!clientId) {
    return (
      <section className="py-[120px] px-4 sm:px-6 bg-[var(--background)]">
        <div className="max-w-[720px] mx-auto text-center">
          <h2 className="text-section-title text-[var(--foreground)]">
            Complete Your Enrollment
          </h2>
          <p className="mt-4 text-body-lg text-zinc-600">
            Payment options will be available here soon. Thank you for your interest in the K-Beauty Glass Skin Masterclass.
          </p>
          <p className="mt-6 text-body text-zinc-500">
            In the meantime, check your email for the free guide. We&apos;ll be in touch with next steps.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-[120px] px-4 sm:px-6 bg-[var(--background)]">
      <div className="max-w-[900px] mx-auto">
        <h2 className="text-section-title text-[var(--foreground)] text-center">
          Complete Your Enrollment
        </h2>
        <p className="mt-4 text-body-lg text-zinc-600 text-center max-w-xl mx-auto">
          Choose PayPal or pay directly with card to start the {courseTitle || "K-Beauty Glass Skin Masterclass"}.
        </p>

        <div className="mt-12 grid md:grid-cols-2 gap-8 items-start">
          {/* Purchase summary */}
          <div className="rounded-[10px] bg-white border border-zinc-100 p-6 sm:p-8">
            <h3 className="text-card-title text-[var(--foreground)]">
              {courseTitle || "K-Beauty Glass Skin Masterclass"}
            </h3>
            <p className="mt-2 text-body text-zinc-600">One-time payment</p>
            <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">{priceFormatted ?? "$199"}</p>
            <p className="mt-2 text-body text-zinc-500">Instant access</p>
          </div>

          {/* Payment methods — ref용 div는 항상 DOM에 두어 SDK가 버튼을 붙일 수 있게 함 */}
          <div className="rounded-[10px] bg-white border border-zinc-100 p-6 sm:p-8 space-y-6">
            {loading && (
              <div className="flex items-center justify-center py-8 text-zinc-500">
                <span className="text-body">Loading checkout…</span>
              </div>
            )}

            {error && (
              <div className="rounded-[10px] bg-red-50 border border-red-200 px-4 py-3 text-body text-red-700">
                {error}
              </div>
            )}

            {/* PayPal 버튼이 렌더되는 컨테이너 — 항상 마운트되어 있어야 SDK가 정상 동작함 */}
            <div>
              <p className="text-body font-medium text-[var(--foreground)] mb-3">Pay with PayPal</p>
              <div ref={buttonsRef} className="min-h-[45px]" />
            </div>

            <div className={`border-t border-zinc-200 pt-6 ${!cardFieldsAvailable ? "hidden" : ""}`}>
              <p className="text-body font-medium text-[var(--foreground)] mb-3">Or pay with card</p>
              <div className="space-y-4">
                <div ref={cardNameRef} className="min-h-[44px] rounded-[10px] border border-zinc-300 px-3 py-2" />
                <div ref={cardNumberRef} className="min-h-[44px] rounded-[10px] border border-zinc-300 px-3 py-2" />
                <div className="grid grid-cols-2 gap-4">
                  <div ref={cardExpiryRef} className="min-h-[44px] rounded-[10px] border border-zinc-300 px-3 py-2" />
                  <div ref={cardCvvRef} className="min-h-[44px] rounded-[10px] border border-zinc-300 px-3 py-2" />
                </div>
              </div>
              {cardError && (
                <p className="mt-2 text-body text-red-600">{cardError}</p>
              )}
              <button
                type="button"
                onClick={handleCardSubmit}
                disabled={cardSubmitLoading}
                className="btn-cta mt-4 w-full py-4 disabled:opacity-60"
              >
                {cardSubmitLoading ? "Processing…" : `Pay ${priceFormatted ?? "$199"}`}
              </button>
            </div>

            <p className="text-body text-zinc-500 text-center pt-2">
              Secure checkout powered by PayPal
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
