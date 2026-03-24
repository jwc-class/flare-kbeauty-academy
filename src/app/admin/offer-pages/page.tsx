"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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

type RelationRow = { id: string; title: string; slug: string };

type OfferPageRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  courses?: RelationRow | RelationRow[] | null;
};

function getRelationTitle(rel: RelationRow | RelationRow[] | null | undefined): string {
  if (!rel) return "—";
  const one = Array.isArray(rel) ? rel[0] : rel;
  return one?.title ?? "—";
}

export default function AdminOfferPagesPage() {
  const [list, setList] = useState<OfferPageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/offer-pages", { headers });
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

  const handleDuplicate = async (id: string) => {
    if (!confirm("이 오퍼 페이지를 복제하시겠습니까?")) return;
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/offer-pages/${id}/duplicate`, {
        method: "POST",
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "복제 실패");
        return;
      }
      fetchList();
    } catch {
      setError("복제 실패");
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Offer Pages"
        description="옵트인 이후 브릿지 오퍼 페이지 목록입니다."
        action={
          <Link href="/admin/offer-pages/new" className="btn-cta">
            New
          </Link>
        }
      />

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <AdminTable aria-label="Offer Pages">
        <AdminTableHead>
          <AdminTh>제목</AdminTh>
          <AdminTh>슬러그</AdminTh>
          <AdminTh>연결 강의</AdminTh>
          <AdminTh>상태</AdminTh>
          <AdminTh>등록일</AdminTh>
          <AdminTh>액션</AdminTh>
        </AdminTableHead>
        <AdminTableBody>
          {!loading && list.length === 0 && (
            <AdminTr>
              <AdminTd colSpan={6} className="p-8 text-center text-[var(--muted)]">
                No offer pages yet. Use "New" to create one.
              </AdminTd>
            </AdminTr>
          )}
          {list.map((row) => (
            <AdminTr key={row.id}>
              <AdminTd>
                <Link href={`/admin/offer-pages/${row.id}`} className="text-[var(--flare-support-1)] hover:underline font-medium">
                  {row.title}
                </Link>
              </AdminTd>
              <AdminTd>{row.slug}</AdminTd>
              <AdminTd>{getRelationTitle(row.courses)}</AdminTd>
              <AdminTd>{row.status}</AdminTd>
              <AdminTd>{formatDate(row.created_at)}</AdminTd>
              <AdminTd>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/offers/${row.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[8px] border border-zinc-300 px-2.5 py-1 text-sm text-[var(--foreground)] hover:bg-zinc-50"
                  >
                    OPEN ↗
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(row.id)}
                    className="rounded-[8px] border border-zinc-300 px-2.5 py-1 text-sm text-[var(--foreground)] hover:bg-zinc-50"
                  >
                    복제
                  </button>
                </div>
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTableBody>
      </AdminTable>
    </>
  );
}
