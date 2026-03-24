"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminHeaders } from "@/lib/admin-auth";
import type { Course } from "@/types/admin";
import { AdminPageHeader, AdminFormSection, AdminFormActions, AdminThumbnailField } from "@/components/admin";

const inputCls = "w-full rounded-[8px] border border-zinc-300 px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]";

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AdminOfferPageNewPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    thumbnail_url: "",
    headline: "",
    subheadline: "",
    body: "",
    cta_text: "",
    course_id: "",
    status: "draft",
  });

  useEffect(() => {
    getAdminHeaders()
      .then((headers) => fetch("/api/admin/courses", { headers }))
      .then((r) => r.json().catch(() => []))
      .then((rows) => setCourses(Array.isArray(rows) ? rows : []))
      .finally(() => setLoadingOptions(false));
  }, []);

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug || slugFromTitle(title) || f.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/offer-pages", {
        method: "POST",
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

  return (
    <>
      <AdminPageHeader
        title="New Offer Page"
        description="옵트인 이후 보여줄 브릿지 오퍼 페이지를 생성합니다."
        action={
          <Link
            href="/admin/offer-pages"
            className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50"
          >
            ← 목록
          </Link>
        }
      />
      <AdminFormSection title="오퍼 페이지 정보">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">제목 *</label>
              <input className={inputCls} value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">슬러그 *</label>
              <input className={inputCls} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required />
            </div>
            <div>
              <AdminThumbnailField
                label="썸네일"
                value={form.thumbnail_url}
                entity="offer-page"
                onChange={(url) => setForm((f) => ({ ...f, thumbnail_url: url }))}
              />
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
              <select
                className={inputCls}
                value={form.course_id}
                onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
                disabled={loadingOptions}
              >
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
