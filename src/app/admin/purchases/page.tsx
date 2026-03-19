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

type PurchaseRow = {
  id: string;
  contact_id: string;
  course_id: string;
  amount: number;
  currency: string;
  payment_provider: string | null;
  payment_status: string | null;
  external_order_id: string | null;
  purchased_at: string;
  contacts?: { id: string; first_name: string | null; last_name: string | null; email: string } | null;
  courses?: { id: string; title: string; slug: string } | null;
};

export default function AdminPurchasesPage() {
  const [list, setList] = useState<PurchaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/purchases", { headers });
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

  const contactDisplay = (row: PurchaseRow) => {
    const c = row.contacts;
    if (!c) return "—";
    const name = [c.first_name, c.last_name].filter(Boolean).join(" ");
    return name ? `${name} (${c.email})` : c.email;
  };

  const formatAmount = (currency: string, amount: number) => {
    const n = Number(amount);
    if (Number.isNaN(n)) return "—";
    const formatted = n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${currency} ${formatted}`;
  };

  return (
    <>
      <AdminPageHeader
        title="Purchases"
        description="구매 내역. Prompt 2에서 수동 추가·상태 변경·필터 확장."
        action={
          <button
            type="button"
            onClick={() => fetchList()}
            disabled={loading}
            className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-100 disabled:opacity-50"
          >
            새로고침
          </button>
        }
      />
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <AdminTable aria-label="Purchases">
        <AdminTableHead>
          <AdminTh>연락처</AdminTh>
          <AdminTh>강의</AdminTh>
          <AdminTh>금액</AdminTh>
          <AdminTh>결제 수단</AdminTh>
          <AdminTh>상태</AdminTh>
          <AdminTh>구매일시</AdminTh>
        </AdminTableHead>
        <AdminTableBody>
          {!loading && list.length === 0 && (
            <AdminTr>
              <AdminTd colSpan={6} className="p-8 text-center text-[var(--muted)]">
                No purchases yet.
              </AdminTd>
            </AdminTr>
          )}
          {list.map((row) => (
            <AdminTr key={row.id}>
              <AdminTd>{contactDisplay(row)}</AdminTd>
              <AdminTd>{row.courses?.title ?? "—"}</AdminTd>
              <AdminTd>{formatAmount(row.currency, row.amount)}</AdminTd>
              <AdminTd>{row.payment_provider ?? "—"}</AdminTd>
              <AdminTd>{row.payment_status ?? "—"}</AdminTd>
              <AdminTd>{formatDate(row.purchased_at)}</AdminTd>
            </AdminTr>
          ))}
        </AdminTableBody>
      </AdminTable>
    </>
  );
}
