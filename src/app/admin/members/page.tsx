"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminHeaders } from "@/lib/admin-auth";
import {
  AdminPageHeader,
  AdminTable,
  AdminTableHead,
  AdminTh,
  AdminTableBody,
  AdminTr,
  AdminTd,
} from "@/components/admin";
import Image from "next/image";

type MemberRow = {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  has_contact: boolean;
  purchase_count: number;
};

export default function AdminMembersPage() {
  const [list, setList] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/members", { headers });
      if (res.status === 401) return;
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "목록을 불러오지 못했습니다.");
        return;
      }
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString("ko-KR");
    } catch {
      return s;
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Members"
        description="Google 로그인으로 가입한 멤버(profiles) 목록. 연락처 매칭 및 구매 수는 이메일 기준입니다."
        action={
          <button
            type="button"
            onClick={() => fetchList()}
            disabled={loading}
            className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50 disabled:opacity-50"
          >
            새로고침
          </button>
        }
      />
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <AdminTable aria-label="Members">
        <AdminTableHead>
          <AdminTh>Avatar</AdminTh>
          <AdminTh>Name</AdminTh>
          <AdminTh>Email</AdminTh>
          <AdminTh>Provider</AdminTh>
          <AdminTh>Status</AdminTh>
          <AdminTh>Contact</AdminTh>
          <AdminTh>Purchases</AdminTh>
          <AdminTh>Joined</AdminTh>
        </AdminTableHead>
        <AdminTableBody>
          {!loading && list.length === 0 && (
            <AdminTr>
              <AdminTd colSpan={8} className="p-8 text-center text-[var(--muted)]">
                멤버가 없습니다. Google 로그인으로 가입한 사용자가 여기에 표시됩니다.
              </AdminTd>
            </AdminTr>
          )}
          {list.map((row) => (
            <AdminTr key={row.id}>
              <AdminTd>
                {row.avatar_url ? (
                  <Image
                    src={row.avatar_url}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-[var(--muted)]">—</span>
                )}
              </AdminTd>
              <AdminTd className="font-medium text-[var(--foreground)]">
                {row.full_name || "—"}
              </AdminTd>
              <AdminTd className="text-zinc-600">{row.email || "—"}</AdminTd>
              <AdminTd className="text-zinc-600">{row.provider || "—"}</AdminTd>
              <AdminTd>
                <span
                  className={
                    row.status === "active"
                      ? "text-green-700"
                      : "text-zinc-600"
                  }
                >
                  {row.status}
                </span>
              </AdminTd>
              <AdminTd>
                {row.has_contact ? (
                  <span className="text-green-700">Linked</span>
                ) : (
                  <span className="text-[var(--muted)]">—</span>
                )}
              </AdminTd>
              <AdminTd className="font-medium text-[var(--foreground)]">
                {row.purchase_count}
              </AdminTd>
              <AdminTd className="text-zinc-600 text-sm">
                {formatDate(row.created_at)}
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTableBody>
      </AdminTable>
    </>
  );
}
