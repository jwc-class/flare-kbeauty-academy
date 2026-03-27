"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminHeaders } from "@/lib/admin-auth";
import {
  AdminPageHeader,
  AdminTable,
  AdminTableBody,
  AdminTableHead,
  AdminTd,
  AdminTh,
  AdminTr,
} from "@/components/admin";

type EnrollmentRow = {
  id: string;
  status: string;
  source: string | null;
  granted_at: string;
  profile: { id: string | null; email: string | null; full_name: string | null };
  course: { id: string | null; title: string | null; slug: string | null };
  purchase: { id: string | null; amount: number; currency: string };
};

export default function AdminEnrollmentsPage() {
  const [list, setList] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/enrollments?status=active", { headers });
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

  const formatAmount = (currency: string, amount: number) => {
    const n = Number(amount);
    if (Number.isNaN(n)) return "0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  const handleRevoke = async (row: EnrollmentRow) => {
    if (!confirm("이 수강 권한을 삭제(회수)하시겠습니까?")) return;
    setRevokingId(row.id);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/enrollments/${row.id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "수강 권한 삭제에 실패했습니다.");
        return;
      }
      setList((prev) => prev.filter((x) => x.id !== row.id));
    } catch {
      setError("수강 권한 삭제에 실패했습니다.");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Enrollment List"
        description="수강 현황 목록입니다. 결제 연동이 없는 수동 등록 건은 금액이 0으로 표시됩니다."
        action={
          <button
            type="button"
            onClick={fetchList}
            disabled={loading}
            className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50 disabled:opacity-50"
          >
            새로고침
          </button>
        }
      />

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <AdminTable aria-label="Enrollments">
        <AdminTableHead>
          <AdminTh>Member</AdminTh>
          <AdminTh>Course</AdminTh>
          <AdminTh>Source</AdminTh>
          <AdminTh>Amount</AdminTh>
          <AdminTh>Granted At</AdminTh>
          <AdminTh>Action</AdminTh>
        </AdminTableHead>
        <AdminTableBody>
          {!loading && list.length === 0 && (
            <AdminTr>
              <AdminTd colSpan={6} className="p-8 text-center text-[var(--muted)]">
                활성 수강 권한이 없습니다.
              </AdminTd>
            </AdminTr>
          )}
          {list.map((row) => {
            const amount = row.source === "manual" ? 0 : Number(row.purchase?.amount ?? 0);
            const currency = row.purchase?.currency || "USD";
            return (
              <AdminTr key={row.id}>
                <AdminTd>
                  <div className="text-[var(--foreground)] font-medium">{row.profile.full_name || "—"}</div>
                  <div className="text-sm text-zinc-600">{row.profile.email || "—"}</div>
                </AdminTd>
                <AdminTd>
                  <div className="text-[var(--foreground)] font-medium">{row.course.title || "—"}</div>
                  <div className="text-sm text-zinc-600">{row.course.slug || "—"}</div>
                </AdminTd>
                <AdminTd className="text-zinc-600">{row.source || "—"}</AdminTd>
                <AdminTd className="font-medium text-[var(--foreground)]">{formatAmount(currency, amount)}</AdminTd>
                <AdminTd className="text-zinc-600 text-sm">{formatDate(row.granted_at)}</AdminTd>
                <AdminTd>
                  <button
                    type="button"
                    onClick={() => handleRevoke(row)}
                    disabled={revokingId === row.id}
                    className="rounded-[10px] border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {revokingId === row.id ? "처리중..." : "권한 삭제"}
                  </button>
                </AdminTd>
              </AdminTr>
            );
          })}
        </AdminTableBody>
      </AdminTable>
    </>
  );
}