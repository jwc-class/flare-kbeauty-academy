"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminHeaders } from "@/lib/admin-auth";
import type { Course } from "@/types/admin";
import type { LeadMagnet } from "@/types/admin";
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
  lead_magnet_id: string | null;
  primary_course_id: string | null;
  channel: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  lead_magnets?: RelationRow | RelationRow[] | null;
  courses?: RelationRow | RelationRow[] | null;
};

function getRelationTitle(rel: RelationRow | RelationRow[] | null | undefined): string {
  if (!rel) return "—";
  const one = Array.isArray(rel) ? rel[0] : rel;
  return one?.title ?? "—";
}

export default function AdminLandingPagesPage() {
  const [list, setList] = useState<LandingPageRow[]>([]);
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = getAdminHeaders();

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resLP, resLM, resC] = await Promise.all([
        fetch("/api/admin/landing-pages", { headers }),
        fetch("/api/admin/lead-magnets", { headers }),
        fetch("/api/admin/courses", { headers }),
      ]);
      if (resLP.status === 401) return;
      const data = await resLP.json().catch(() => ({}));
      if (!resLP.ok) {
        setError(typeof data?.error === "string" ? data.error : "목록을 불러오지 못했습니다.");
        return;
      }
      setList(Array.isArray(data) ? data : []);
      const lm = await resLM.json().catch(() => []);
      setLeadMagnets(Array.isArray(lm) ? lm : []);
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

  return (
    <>
      <AdminPageHeader
        title="Landing Pages"
        description="랜딩 페이지 목록. 새로 만들기 또는 행 클릭하여 수정."
        action={
          <Link
            href="/admin/landing-pages/new"
            className="rounded-[10px] bg-[var(--flare-support-1)] px-4 py-2 text-body font-medium text-white hover:bg-[var(--flare-support-2)]"
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
          <AdminTh>리드 매그넷</AdminTh>
          <AdminTh>주요 강의</AdminTh>
          <AdminTh>상태</AdminTh>
          <AdminTh>등록일</AdminTh>
        </AdminTableHead>
        <AdminTableBody>
          {!loading && list.length === 0 && (
            <AdminTr>
              <AdminTd colSpan={7} className="p-8 text-center text-[var(--muted)]">No landing pages yet. Use &quot;추가&quot; to create one.</AdminTd>
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
              <AdminTd>{getRelationTitle(row.lead_magnets)}</AdminTd>
              <AdminTd>{getRelationTitle(row.courses)}</AdminTd>
              <AdminTd>{row.status}</AdminTd>
              <AdminTd>{formatDate(row.created_at)}</AdminTd>
            </AdminTr>
          ))}
        </AdminTableBody>
      </AdminTable>
    </>
  );
}
