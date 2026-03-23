"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getSession, signInWithGoogle } from "@/lib/auth";
import type { AuthSession } from "@/lib/auth";
import PayPalAdvancedCheckout from "@/components/PayPalAdvancedCheckout";

export const CHECKOUT_SECTION_ID = "checkout-section";

type CheckoutGateProps = {
  courseSlug?: string;
  paypalClientId?: string | null;
  courseTitle?: string | null;
  priceFormatted?: string | null;
  /** Return path after login (e.g. /glass-skin-masterclass or /courses/foo). Defaults to current pathname. */
  returnTo?: string;
};

export default function CheckoutGate({
  courseSlug,
  paypalClientId,
  courseTitle,
  priceFormatted,
  returnTo,
}: CheckoutGateProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const loadSession = useCallback(async () => {
    setAuthLoading(true);
    setLoginError(null);
    try {
      const s = await getSession();
      setSession(s);
    } catch {
      setSession(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // After login return: reload once so PayPal SDK/button load cleanly. Do NOT mount PayPal before replace or zoid will throw "destroyed all components".
  const intentBuy = searchParams.get("intent") === "buy";
  useEffect(() => {
    if (!session || authLoading || !intentBuy) return;
    const path = pathname ?? "/";
    window.location.replace(path);
  }, [session, authLoading, intentBuy, pathname]);

  const handleContinueWithGoogle = useCallback(async () => {
    setLoginError(null);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const path = returnTo ?? pathname ?? "/";
    const nextPath = path + (path.includes("?") ? "&" : "?") + "intent=buy";
    try {
      sessionStorage.setItem("auth_return_path", nextPath);
    } catch {
      /* ignore */
    }
    const callbackUrl = `${origin}/auth/callback`;
    const { error } = await signInWithGoogle(callbackUrl);
    if (error) {
      setLoginError(error.message);
    }
  }, [returnTo, pathname]);

  if (authLoading) {
    return (
      <div
        id={CHECKOUT_SECTION_ID}
        ref={(el) => { sectionRef.current = el; }}
        className="rounded-[10px] bg-white border border-zinc-100 p-8 flex items-center justify-center min-h-[180px]"
      >
        <p className="text-body text-zinc-500">Loading checkout…</p>
      </div>
    );
  }

  // Intent=buy: about to refresh — never mount PayPal (prevents zoid "destroyed all components")
  if (session && intentBuy) {
    return (
      <div
        id={CHECKOUT_SECTION_ID}
        className="rounded-[10px] bg-white border border-zinc-100 p-8 flex items-center justify-center min-h-[180px]"
      >
        <p className="text-body text-zinc-500">Loading checkout…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <section
        id={CHECKOUT_SECTION_ID}
        className="space-y-6"
        ref={(el) => { sectionRef.current = el; }}
      >
        <div className="rounded-[10px] bg-white border border-zinc-100 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Continue to checkout
          </h2>
          <p className="mt-2 text-body text-zinc-600">
            Sign in with Google first so we can attach your purchase and course access to your account.
          </p>
          <div className="mt-6 flex flex-col items-stretch gap-3">
            <button
              type="button"
              onClick={handleContinueWithGoogle}
              className="btn-cta w-full"
            >
              Continue with Google to purchase
            </button>
            {loginError && (
              <p className="text-body text-red-600">{loginError}</p>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <p className="text-card-title text-[var(--foreground)]">{courseTitle || "Course"}</p>
              <p className="text-body text-zinc-600">{priceFormatted ?? "—"} · One-time payment</p>
            </div>
            <p className="text-body text-zinc-500 shrink-0">Instant access after purchase</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      id={CHECKOUT_SECTION_ID}
      ref={(el) => {
        sectionRef.current = el;
      }}
    >
      {session.user.email && (
        <p className="text-body text-zinc-600 text-center mb-2">
          Signed in as <span className="font-medium text-[var(--foreground)]">{session.user.email}</span>
        </p>
      )}
      <PayPalAdvancedCheckout
        courseSlug={courseSlug}
        paypalClientId={paypalClientId}
        courseTitle={courseTitle}
        priceFormatted={priceFormatted}
        accessToken={session.access_token}
      />
    </div>
  );
}
