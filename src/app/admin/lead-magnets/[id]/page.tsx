"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getAdminHeaders } from "@/lib/admin-auth";
import { AdminPageHeader, AdminFormSection, AdminFormActions } from "@/components/admin";

const inputCls = "w-full rounded-[8px] border border-zinc-300 px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]";

export default function AdminLeadMagnetEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    thumbnail_url: "",
    file_url: "",
    delivery_type: "",
    status: "draft",
  });

  const fetchOne = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await fetch(`/api/admin/lead-magnets/${id}`, { headers: getAdminHeaders() });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "불러오기 실패");
        return;
      }
      setForm({
        title: data.title ?? "",
        slug: data.slug ?? "",
        subtitle: data.subtitle ?? "",
        description: data.description ?? "",
        thumbnail_url: data.thumbnail_url ?? "",
        file_url: data.file_url ?? "",
        delivery_type: data.delivery_type ?? "",
        status: data.status ?? "draft",
      });
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
      const res = await fetch(`/api/admin/lead-magnets/${id}`, {
        method: "PATCH",
        headers: getAdminHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "저장 실패");
        return;
      }
      router.push("/admin/lead-magnets");
    } catch {
      setError("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!id || !confirm("이 리드 매그넷을 비활성화(archived)하시겠습니까?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lead-magnets/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data?.error === "string" ? data.error : "비활성화 실패");
        return;
      }
      router.push("/admin/lead-magnets");
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
        <Link href="/admin/lead-magnets" className="text-body text-[var(--flare-support-1)] underline mt-2 inline-block">← 목록</Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-body text-[var(--muted)]">로딩 중...</p>;
  }

  if (notFound) {
    return (
      <div>
        <p className="text-body text-red-600">리드 매그넷을 찾을 수 없습니다.</p>
        <Link href="/admin/lead-magnets" className="text-body text-[var(--flare-support-1)] underline mt-2 inline-block">← 목록</Link>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Edit Lead Magnet"
        description={form.title || "리드 매그넷 수정"}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/lead-magnets"
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
      <AdminFormSection title="리드 매그넷 정보">
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
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">부제목</label>
              <input className={inputCls} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">설명</label>
              <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">썸네일 URL</label>
              <input className={inputCls} value={form.thumbnail_url} onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">파일 URL</label>
              <input className={inputCls} value={form.file_url} onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))} />
            </div>
            <div>
              <label className="block text-body font-medium text-[var(--foreground)] mb-1">배포 유형</label>
              <input className={inputCls} value={form.delivery_type} onChange={(e) => setForm((f) => ({ ...f, delivery_type: e.target.value }))} />
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
            <Link href="/admin/lead-magnets" className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50">
              취소
            </Link>
          </AdminFormActions>
        </form>
      </AdminFormSection>
    </>
  );
}
