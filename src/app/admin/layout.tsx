"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin";
import { ADMIN_SESSION_KEY } from "@/lib/admin-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const validate = useCallback(async (pwd: string) => {
    const res = await fetch("/api/admin/stats", {
      headers: { "x-admin-password": pwd },
    });
    return res.status !== 401;
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_SESSION_KEY) : null;
    if (!stored || stored.length === 0) {
      setLoading(false);
      return;
    }
    validate(stored).then((ok) => {
      setLoading(false);
      if (ok) {
        setAuthenticated(true);
        setPassword(stored);
      } else {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
    });
  }, [validate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = await validate(password);
    if (ok) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, password);
      setAuthenticated(true);
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthenticated(false);
    setPassword("");
    router.push("/admin");
  };

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
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full rounded-[10px] border border-zinc-300 px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-[10px] bg-[var(--flare-support-1)] py-3 font-semibold text-body text-white hover:bg-[var(--flare-support-2)] disabled:opacity-50"
            >
              로그인
            </button>
          </form>
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
