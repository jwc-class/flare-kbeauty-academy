"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin";
import { getSession, signInWithGoogle, signOut } from "@/lib/auth";
import { getAdminHeaders } from "@/lib/admin-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const validateAdmin = useCallback(async (): Promise<{ ok: boolean; hasSession: boolean }> => {
    const session = await getSession();
    if (!session?.access_token) return { ok: false, hasSession: false };
    const headers = await getAdminHeaders();
    const res = await fetch("/api/admin/stats", { headers });
    return { ok: res.ok, hasSession: true };
  }, []);

  useEffect(() => {
    let cancelled = false;
    validateAdmin()
      .then(({ ok, hasSession }) => {
        if (!cancelled) {
          setAuthenticated(ok);
          setError(ok ? null : hasSession ? "Access denied. You are not an admin." : null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthenticated(false);
          setError(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [validateAdmin]);

  const handleSignIn = useCallback(async () => {
    setError(null);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_return_path", "/admin");
      }
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent("/admin")}`;
      const { error: err } = await signInWithGoogle(callbackUrl);
      if (err) setError(err.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut();
    setAuthenticated(false);
    router.push("/admin");
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <p className="text-body text-[var(--muted)]">확인 중...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-section-title text-[var(--foreground)] mb-6 text-center">Admin</h1>
          <p className="text-body text-zinc-600 text-center mb-6">
            Sign in with Google to access the admin. Only authorized admins can enter.
          </p>
          <button
            type="button"
            onClick={handleSignIn}
            className="btn-cta w-full disabled:opacity-50"
          >
            Continue with Google
          </button>
          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
          )}
          <p className="mt-6 text-center">
            <Link href="/" className="text-body text-zinc-500 hover:text-zinc-700">
              ← 메인으로
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 border-b border-zinc-200 bg-white px-6 py-4 flex items-center justify-between">
          <span className="text-body text-[var(--muted)]">
            {pathname === "/admin" ? "Dashboard" : pathname.split("/").filter(Boolean).slice(1).join(" / ")}
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-[8px] border border-zinc-300 px-3 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50"
            >
              메인
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-[8px] bg-zinc-200 px-3 py-2 text-body text-[var(--foreground)] hover:bg-zinc-300"
            >
              로그아웃
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
