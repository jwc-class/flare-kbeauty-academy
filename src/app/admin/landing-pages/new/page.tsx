"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminHeaders } from "@/lib/admin-auth";
import type { LeadMagnet } from "@/types/admin";
import type { Course } from "@/types/admin";
import { AdminPageHeader, AdminFormSection, AdminFormActions } from "@/components/admin";

const inputCls = "w-full rounded-[8px] border border-zinc-300 px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]";

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AdminLandingPageNewPage() {
  const router = useRouter();
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    hero_title: "",
    hero_subtitle: "",
    cta_text: "",
    lead_magnet_id: "",
    primary_course_id: "",
    channel: "",
    status: "draft",
  });

  useEffect(() => {
    const headers = getAdminHeaders();
    Promise.all([
      fetch("/api/admin/lead-magnets", { headers }),
      fetch("/api/admin/courses", { headers }),
    ])
      .then(async ([rLM, rC]) => {
        const lm = await rLM.json().catch(() => []);
        const c = await rC.json().catch(() => []);
        setLeadMagnets(Array.isArray(lm) ? lm : []);
        setCourses(Array.isArray(c) ? c : []);
      })
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
      const res = await fetch("/api/admin/landing-pages", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          ...form,
          lead_magnet_id: form.lead_magnet_id || null,
          primary_course_id: form.primary_course_id || null,
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

  return (
    <>
      <AdminPageHeader
        title="New Landing Page"
        description="랜딩 페이지를 새로 만듭니다. 리드 매그넷·주요 강의를 연결할 수 있습니다."
        action={
          <Link
            href="/admin/landing-pages"
            className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50"
          >
            ← 목록
          </Link>
        }
      />
      <AdminFormSection title="랜딩 페이지 정보">
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
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">연결 리드 매그넷</label>
              <select className={inputCls} value={form.lead_magnet_id} onChange={(e) => setForm((f) => ({ ...f, lead_magnet_id: e.target.value }))}>
                <option value="">— 선택 안 함 —</option>
                {leadMagnets.map((lm) => (
                  <option key={lm.id} value={lm.id}>{lm.title} ({lm.slug})</option>
                ))}
              </select>
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
            <button type="submit" disabled={saving} className="rounded-[10px] bg-[var(--flare-support-1)] px-4 py-2 text-body font-medium text-white hover:bg-[var(--flare-support-2)] disabled:opacity-50">
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
