"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminHeaders } from "@/lib/admin-auth";
import type { Course } from "@/types/admin";
import Link from "next/link";
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

type LandingPageRow = {
  id: string;
  title: string;
  slug: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  cta_text: string | null;
  primary_course_id: string | null;
  offer_page_id: string | null;
  channel: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  courses?: RelationRow | RelationRow[] | null;
  offer_pages?: RelationRow | RelationRow[] | null;
};

function getRelationTitle(rel: RelationRow | RelationRow[] | null | undefined): string {
  if (!rel) return "—";
  const one = Array.isArray(rel) ? rel[0] : rel;
  return one?.title ?? "—";
}

export default function AdminLandingPagesPage() {
  const [list, setList] = useState<LandingPageRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const [resLP, resC] = await Promise.all([
        fetch("/api/admin/landing-pages", { headers }),
        fetch("/api/admin/courses", { headers }),
      ]);
      if (resLP.status === 401) return;
      const data = await resLP.json().catch(() => ({}));
      if (!resLP.ok) {
        setError(typeof data?.error === "string" ? data.error : "목록을 불러오지 못했습니다.");
        return;
      }
      setList(Array.isArray(data) ? data : []);
      const c = await resC.json().catch(() => []);
      setCourses(Array.isArray(c) ? c : []);
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
    if (!confirm("이 랜딩 페이지를 복제하시겠습니까?")) return;
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/landing-pages/${id}/duplicate`, {
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
        title="Landing Pages"
        description="랜딩 페이지 목록. 새로 만들기 또는 행 클릭하여 수정."
        action={
          <Link
            href="/admin/landing-pages/new"
            className="btn-cta"
          >
            New
          </Link>
        }
      />

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <AdminTable aria-label="Landing Pages">
        <AdminTableHead>
          <AdminTh>제목</AdminTh>
          <AdminTh>슬러그</AdminTh>
          <AdminTh>채널</AdminTh>
          <AdminTh>주요 강의</AdminTh>
          <AdminTh>오퍼 페이지</AdminTh>
          <AdminTh>상태</AdminTh>
          <AdminTh>등록일</AdminTh>
          <AdminTh>액션</AdminTh>
        </AdminTableHead>
        <AdminTableBody>
          {!loading && list.length === 0 && (
            <AdminTr>
              <AdminTd colSpan={8} className="p-8 text-center text-[var(--muted)]">No landing pages yet. Use &quot;추가&quot; to create one.</AdminTd>
            </AdminTr>
          )}
          {list.map((row) => (
            <AdminTr key={row.id}>
              <AdminTd>
                <Link href={`/admin/landing-pages/${row.id}`} className="text-[var(--flare-support-1)] hover:underline font-medium">
                  {row.title}
                </Link>
              </AdminTd>
              <AdminTd>{row.slug}</AdminTd>
              <AdminTd>{row.channel ?? "—"}</AdminTd>
              <AdminTd>{getRelationTitle(row.courses)}</AdminTd>
              <AdminTd>{getRelationTitle(row.offer_pages)}</AdminTd>
              <AdminTd>{row.status}</AdminTd>
              <AdminTd>{formatDate(row.created_at)}</AdminTd>
              <AdminTd>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/lp/${row.slug}`}
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
