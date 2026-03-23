"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminHeaders } from "@/lib/admin-auth";
import { AdminPageHeader, AdminFormSection, AdminFormActions } from "@/components/admin";

const inputCls = "w-full rounded-[8px] border border-zinc-300 px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]";

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AdminCourseNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    thumbnail_url: "",
    price: "",
    currency: "USD",
    short_description: "",
    sales_page_content: "",
    instructor_name: "",
    status: "draft",
    paypal_link: "",
  });

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
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers,
        body: JSON.stringify({ ...form, price: Number(form.price) || 0 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "저장 실패");
        return;
      }
      router.push("/admin/courses");
    } catch {
      setError("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="New Course"
        description="강의를 새로 만듭니다."
        action={
          <Link
            href="/admin/courses"
            className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50"
          >
            ← 목록
          </Link>
        }
      />
      <AdminFormSection title="강의 정보">
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
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">썸네일 URL</label>
              <input className={inputCls} value={form.thumbnail_url} onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body font-medium text-[var(--foreground)] mb-1">가격</label>
                <input type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <label className="block text-body font-medium text-[var(--foreground)] mb-1">통화</label>
                <select className={inputCls} value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
                  <option value="USD">USD</option>
                  <option value="KRW">KRW</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">짧은 설명</label>
              <textarea className={inputCls} rows={2} value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">판매 페이지 내용 (HTML 등)</label>
              <textarea className={inputCls} rows={6} value={form.sales_page_content} onChange={(e) => setForm((f) => ({ ...f, sales_page_content: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">강사명</label>
              <input className={inputCls} value={form.instructor_name} onChange={(e) => setForm((f) => ({ ...f, instructor_name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">상태</label>
              <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">PayPal 링크 (선택)</label>
              <input className={inputCls} value={form.paypal_link} onChange={(e) => setForm((f) => ({ ...f, paypal_link: e.target.value }))} placeholder="https://paypal.me/yourname" />
              <p className="mt-1 text-sm text-[var(--muted)]">참고용. 실제 결제는 강의 페이지 버튼으로 진행되며, 가격(price)이 결제 금액으로 사용됩니다.</p>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <AdminFormActions>
            <button type="submit" disabled={saving} className="btn-cta disabled:opacity-50">
              저장
            </button>
            <Link href="/admin/courses" className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50">
              취소
            </Link>
          </AdminFormActions>
        </form>
      </AdminFormSection>
    </>
  );
}
