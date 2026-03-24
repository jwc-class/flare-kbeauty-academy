"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getAdminHeaders } from "@/lib/admin-auth";
import type { Course } from "@/types/admin";
import type { OfferPage } from "@/types/admin";
import { AdminPageHeader, AdminFormSection, AdminFormActions } from "@/components/admin";

const inputCls = "w-full rounded-[8px] border border-zinc-300 px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]";

export default function AdminLandingPageEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(!!id);
  const [courses, setCourses] = useState<Course[]>([]);
  const [offerPages, setOfferPages] = useState<OfferPage[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    hero_title: "",
    hero_subtitle: "",
    cta_text: "",
    primary_course_id: "",
    offer_page_id: "",
    channel: "",
    status: "draft",
  });
  const publicHref = form.slug.trim() ? `/lp/${encodeURIComponent(form.slug.trim())}` : null;

  const fetchOne = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const headers = await getAdminHeaders();
      const [resPage, resC, resO] = await Promise.all([
        fetch(`/api/admin/landing-pages/${id}`, { headers }),
        fetch("/api/admin/courses", { headers }),
        fetch("/api/admin/offer-pages", { headers }),
      ]);
      const data = await resPage.json().catch(() => ({}));
      if (resPage.status === 404) {
        setNotFound(true);
        return;
      }
      if (!resPage.ok) {
        setError(typeof data?.error === "string" ? data.error : "불러오기 실패");
        return;
      }
      setForm({
        title: data.title ?? "",
        slug: data.slug ?? "",
        hero_title: data.hero_title ?? "",
        hero_subtitle: data.hero_subtitle ?? "",
        cta_text: data.cta_text ?? "",
        primary_course_id: data.primary_course_id ?? "",
        offer_page_id: data.offer_page_id ?? "",
        channel: data.channel ?? "",
        status: data.status ?? "draft",
      });
      const c = await resC.json().catch(() => []);
      const o = await resO.json().catch(() => []);
      setCourses(Array.isArray(c) ? c : []);
      setOfferPages(Array.isArray(o) ? o : []);
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
      const res = await fetch(`/api/admin/landing-pages/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          ...form,
          primary_course_id: form.primary_course_id || null,
          offer_page_id: form.offer_page_id || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "저장 실패");
        return;
      }
      router.push("/admin/landing-pages");
    } catch {
      setError("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!id || !confirm("이 랜딩 페이지를 비활성화(archived)하시겠습니까?")) return;
    setSaving(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/landing-pages/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data?.error === "string" ? data.error : "비활성화 실패");
        return;
      }
      router.push("/admin/landing-pages");
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
        <Link href="/admin/landing-pages" className="text-body text-[var(--flare-support-1)] underline mt-2 inline-block">← 목록</Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-body text-[var(--muted)]">로딩 중...</p>;
  }

  if (notFound) {
    return (
      <div>
        <p className="text-body text-red-600">랜딩 페이지를 찾을 수 없습니다.</p>
        <Link href="/admin/landing-pages" className="text-body text-[var(--flare-support-1)] underline mt-2 inline-block">← 목록</Link>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Edit Landing Page"
        description={form.title || "랜딩 페이지 수정"}
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
              href="/admin/landing-pages"
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
      <AdminFormSection title="랜딩 페이지 정보">
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
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">히어로 제목</label>
              <input className={inputCls} value={form.hero_title} onChange={(e) => setForm((f) => ({ ...f, hero_title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">히어로 부제목</label>
              <input className={inputCls} value={form.hero_subtitle} onChange={(e) => setForm((f) => ({ ...f, hero_subtitle: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">CTA 문구</label>
              <input className={inputCls} value={form.cta_text} onChange={(e) => setForm((f) => ({ ...f, cta_text: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">연결 주요 강의</label>
              <select className={inputCls} value={form.primary_course_id} onChange={(e) => setForm((f) => ({ ...f, primary_course_id: e.target.value }))}>
                <option value="">— 선택 안 함 —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title} ({c.slug})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">연결 오퍼 페이지</label>
              <select className={inputCls} value={form.offer_page_id} onChange={(e) => setForm((f) => ({ ...f, offer_page_id: e.target.value }))}>
                <option value="">— 선택 안 함 —</option>
                {offerPages.map((o) => (
                  <option key={o.id} value={o.id}>{o.title} ({o.slug})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">채널</label>
              <input className={inputCls} value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))} />
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
            <Link href="/admin/landing-pages" className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50">
              취소
            </Link>
          </AdminFormActions>
        </form>
      </AdminFormSection>
    </>
  );
}
