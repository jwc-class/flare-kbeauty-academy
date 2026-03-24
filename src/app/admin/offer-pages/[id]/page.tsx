"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getAdminHeaders } from "@/lib/admin-auth";
import type { Course } from "@/types/admin";
import { AdminPageHeader, AdminFormSection, AdminFormActions } from "@/components/admin";

const inputCls = "w-full rounded-[8px] border border-zinc-300 px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]";

export default function AdminOfferPageEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(!!id);
  const [courses, setCourses] = useState<Course[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    headline: "",
    subheadline: "",
    body: "",
    cta_text: "",
    course_id: "",
    status: "draft",
  });
  const publicHref = form.slug.trim() ? `/offers/${encodeURIComponent(form.slug.trim())}` : null;

  const fetchOne = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const headers = await getAdminHeaders();
      const [resOffer, resCourses] = await Promise.all([
        fetch(`/api/admin/offer-pages/${id}`, { headers }),
        fetch("/api/admin/courses", { headers }),
      ]);
      const data = await resOffer.json().catch(() => ({}));
      if (resOffer.status === 404) {
        setNotFound(true);
        return;
      }
      if (!resOffer.ok) {
        setError(typeof data?.error === "string" ? data.error : "불러오기 실패");
        return;
      }
      setForm({
        title: data.title ?? "",
        slug: data.slug ?? "",
        headline: data.headline ?? "",
        subheadline: data.subheadline ?? "",
        body: data.body ?? "",
        cta_text: data.cta_text ?? "",
        course_id: data.course_id ?? "",
        status: data.status ?? "draft",
      });
      const c = await resCourses.json().catch(() => []);
      setCourses(Array.isArray(c) ? c : []);
    } catch {
      setError("불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOne();
  }, [fetchOne]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/offer-pages/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          ...form,
          course_id: form.course_id || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "저장 실패");
        return;
      }
      router.push("/admin/offer-pages");
    } catch {
      setError("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!id || !confirm("이 오퍼 페이지를 비활성화(archived)하시겠습니까?")) return;
    setSaving(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/offer-pages/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data?.error === "string" ? data.error : "비활성화 실패");
        return;
      }
      router.push("/admin/offer-pages");
    } catch {
      setError("비활성화 실패");
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <div>
        <p className="text-body text-red-600">Invalid ID.</p>
        <Link href="/admin/offer-pages" className="text-body text-[var(--flare-support-1)] underline mt-2 inline-block">
          ← 목록
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-body text-[var(--muted)]">로딩 중...</p>;
  }

  if (notFound) {
    return (
      <div>
        <p className="text-body text-red-600">오퍼 페이지를 찾을 수 없습니다.</p>
        <Link href="/admin/offer-pages" className="text-body text-[var(--flare-support-1)] underline mt-2 inline-block">
          ← 목록
        </Link>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Edit Offer Page"
        description={form.title || "오퍼 페이지 수정"}
        action={
          <div className="flex items-center gap-2">
            {publicHref ? (
              <Link
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50"
              >
                페이지 바로가기 ↗
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="rounded-[10px] border border-zinc-200 px-4 py-2 text-body text-zinc-400"
                title="슬러그를 입력하면 활성화됩니다."
              >
                페이지 바로가기 ↗
              </button>
            )}
            <Link
              href="/admin/offer-pages"
              className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50"
            >
              ← 목록
            </Link>
            <button
              type="button"
              onClick={handleArchive}
              disabled={saving}
              className="rounded-[10px] border border-red-300 px-4 py-2 text-body text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              비활성화
            </button>
          </div>
        }
      />
      <AdminFormSection title="오퍼 페이지 정보">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">제목 *</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">슬러그 *</label>
              <input className={inputCls} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">헤드라인</label>
              <input className={inputCls} value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">서브헤드라인</label>
              <input className={inputCls} value={form.subheadline} onChange={(e) => setForm((f) => ({ ...f, subheadline: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">본문</label>
              <textarea className={inputCls} rows={6} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">CTA 문구</label>
              <input className={inputCls} value={form.cta_text} onChange={(e) => setForm((f) => ({ ...f, cta_text: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">연결 강의</label>
              <select className={inputCls} value={form.course_id} onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}>
                <option value="">— 선택 안 함 —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.slug})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">상태</label>
              <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <AdminFormActions>
            <button type="submit" disabled={saving} className="btn-cta disabled:opacity-50">
              저장
            </button>
            <Link href="/admin/offer-pages" className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50">
              취소
            </Link>
          </AdminFormActions>
        </form>
      </AdminFormSection>
    </>
  );
}
