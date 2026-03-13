"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Lead = {
  id: number;
  email: string;
  first_name: string | null;
  country_code: string | null;
  phone_number: string | null;
  marketing_consent: boolean;
  source: string | null;
  created_at: string;
};

const ADMIN_SESSION_KEY = "admin_authenticated";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (pwd: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads", {
        headers: { "x-admin-password": pwd },
      });
      if (res.status === 401) {
        setError("비밀번호가 올바르지 않습니다.");
        return false;
      }
      if (!res.ok) {
        setError("데이터를 불러오지 못했습니다.");
        return false;
      }
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
      return true;
    } catch {
      setError("오류가 발생했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_SESSION_KEY) : null;
    if (stored && stored.length > 0) {
      fetchLeads(stored).then((ok) => {
        if (ok) {
          setAuthenticated(true);
          setPassword(stored);
        } else {
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
        }
      });
    }
  }, [fetchLeads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await fetchLeads(password);
    if (ok) {
      setAuthenticated(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, password);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthenticated(false);
    setLeads([]);
    setPassword("");
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString("ko-KR");
    } catch {
      return s;
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-section-title text-[var(--foreground)] mb-6 text-center">Admin</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={loading}
              className="w-full rounded-[10px] bg-[var(--flare-support-1)] py-3 font-semibold text-body text-white hover:bg-[var(--flare-support-2)] disabled:opacity-50"
            >
              {loading ? "확인 중..." : "로그인"}
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
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-section-title text-[var(--foreground)]">리드 목록</h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fetchLeads(password)}
              disabled={loading}
              className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-100 disabled:opacity-50"
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-[10px] bg-zinc-200 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-300"
            >
              로그아웃
            </button>
            <Link
              href="/"
              className="rounded-[10px] bg-[var(--flare-support-1)] px-4 py-2 text-body font-medium text-white hover:bg-[var(--flare-support-2)]"
            >
              메인으로
            </Link>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <div className="overflow-x-auto rounded-[10px] border border-zinc-200 bg-white">
          {leads.length === 0 && !loading ? (
            <p className="p-8 text-center text-body text-zinc-500">등록된 리드가 없습니다.</p>
          ) : (
            <table className="w-full text-left text-body">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="p-4 font-semibold text-[var(--foreground)]">ID</th>
                  <th className="p-4 font-semibold text-[var(--foreground)]">이메일</th>
                  <th className="p-4 font-semibold text-[var(--foreground)]">이름</th>
                  <th className="p-4 font-semibold text-[var(--foreground)]">국가코드</th>
                  <th className="p-4 font-semibold text-[var(--foreground)]">전화번호</th>
                  <th className="p-4 font-semibold text-[var(--foreground)]">마케팅 동의</th>
                  <th className="p-4 font-semibold text-[var(--foreground)]">유입경로</th>
                  <th className="p-4 font-semibold text-[var(--foreground)]">등록일시</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="p-4 text-zinc-600">{row.id}</td>
                    <td className="p-4 text-zinc-800">{row.email}</td>
                    <td className="p-4 text-zinc-600">{row.first_name ?? "—"}</td>
                    <td className="p-4 text-zinc-600">{row.country_code ?? "—"}</td>
                    <td className="p-4 text-zinc-600">{row.phone_number ?? "—"}</td>
                    <td className="p-4 text-zinc-600">{row.marketing_consent ? "예" : "아니오"}</td>
                    <td className="p-4 text-zinc-600">{row.source ?? "—"}</td>
                    <td className="p-4 text-zinc-600">{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
