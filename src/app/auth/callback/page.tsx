"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * OAuth callback: Supabase redirects here after Google sign-in.
 * Exchanges hash params for session, then redirects to app.
 */
function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const run = async () => {
      const hashParams = typeof window !== "undefined" ? window.location.hash : "";
      let next = searchParams.get("next") ?? null;
      try {
        const stored = typeof window !== "undefined" ? sessionStorage.getItem("auth_return_path") : null;
        if (stored) {
          next = next || stored;
          sessionStorage.removeItem("auth_return_path");
        }
      } catch {
        /* ignore */
      }
      next = next || "/";

      if (hashParams) {
        const params = new URLSearchParams(hashParams.slice(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const type = params.get("type");

        if (type === "recovery") {
          router.replace(next);
          return;
        }

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) {
            setStatus("error");
            return;
          }
          await fetch("/api/profile/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token }),
          }).catch(() => {});
        }
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          setStatus("error");
          return;
        }
        const token = data.session.access_token;
        if (token) {
          await fetch("/api/profile/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: token }),
          }).catch(() => {});
        }
      }

      setStatus("done");
      window.location.replace(next);
    };

    run();
  }, [router, searchParams]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <div className="text-center">
          <p className="text-body-lg text-[var(--foreground)]">Sign-in could not be completed.</p>
          <a href="/" className="mt-4 inline-block text-body text-[var(--flare-support-1)] hover:underline">
            Return home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <p className="text-body text-[var(--muted)]">Completing sign-in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <p className="text-body text-[var(--muted)]">Loading…</p>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
