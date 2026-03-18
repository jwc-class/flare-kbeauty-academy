"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminHeaders } from "@/lib/admin-auth";
/** API 목록 응답 (contacts + 기존 leads, origin으로 구분) */
type ContactListItem = import("@/types/admin").Contact & { origin?: "contacts" | "legacy" };
import {
  AdminPageHeader,
  AdminTable,
  AdminTableHead,
  AdminTh,
  AdminTableBody,
  AdminTr,
  AdminTd,
  AdminFormSection,
  AdminFormActions,
} from "@/components/admin";

export default function AdminContactsPage() {
  const [list, setList] = useState<ContactListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_country_code: "",
    phone_number: "",
    marketing_consent: false,
    source: "",
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/contacts", { headers: getAdminHeaders() });
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "저장 실패");
      }
      setForm({ first_name: "", last_name: "", email: "", phone_country_code: "", phone_number: "", marketing_consent: false, source: "" });
      setShowForm(false);
      fetchList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString("ko-KR");
    } catch {
      return s;
    }
  };

  const inputCls = "w-full rounded-[8px] border border-zinc-300 px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]";

  return (
    <>
      <AdminPageHeader
        title="Contacts"
        description="연락처(contacts)와 기존 리드(leads) 통합 목록입니다."
        action={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-[10px] bg-[var(--flare-support-1)] px-4 py-2 text-body font-medium text-white hover:bg-[var(--flare-support-2)]"
          >
            {showForm ? "취소" : "추가"}
          </button>
        }
      />

      {showForm && (
        <AdminFormSection title="연락처 추가">
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body font-medium text-[var(--foreground)] mb-1">이름 (first_name)</label>
                <input className={inputCls} value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-body font-medium text-[var(--foreground)] mb-1">성 (last_name)</label>
                <input className={inputCls} value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-body font-medium text-[var(--foreground)] mb-1">이메일 *</label>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-body font-medium text-[var(--foreground)] mb-1">전화 국가코드</label>
                <input className={inputCls} value={form.phone_country_code} onChange={(e) => setForm((f) => ({ ...f, phone_country_code: e.target.value }))} placeholder="+82" />
              </div>
              <div>
                <label className="block text-body font-medium text-[var(--foreground)] mb-1">전화번호</label>
                <input className={inputCls} value={form.phone_number} onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))} />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="mc" checked={form.marketing_consent} onChange={(e) => setForm((f) => ({ ...f, marketing_consent: e.target.checked }))} />
                <label htmlFor="mc" className="text-body text-[var(--foreground)]">마케팅 동의</label>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-body font-medium text-[var(--foreground)] mb-1">유입 경로 (source)</label>
                <input className={inputCls} value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <AdminFormActions>
              <button type="submit" disabled={saving} className="rounded-[10px] bg-[var(--flare-support-1)] px-4 py-2 text-body font-medium text-white hover:bg-[var(--flare-support-2)] disabled:opacity-50">
                저장
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50">
                취소
              </button>
            </AdminFormActions>
          </form>
        </AdminFormSection>
      )}

      {error && !showForm && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <AdminTable aria-label="Contacts">
        <AdminTableHead>
          <AdminTh>구분</AdminTh>
          <AdminTh>이름</AdminTh>
          <AdminTh>이메일</AdminTh>
          <AdminTh>전화</AdminTh>
          <AdminTh>마케팅 동의</AdminTh>
          <AdminTh>유입경로</AdminTh>
          <AdminTh>등록일</AdminTh>
        </AdminTableHead>
        <AdminTableBody>
          {!loading && list.length === 0 && (
            <AdminTr>
              <AdminTd colSpan={7} className="p-8 text-center text-[var(--muted)]">
                연락처가 없습니다. 리드 폼 제출 시 자동 생성되며, &quot;추가&quot;로 직접 생성할 수 있습니다.
              </AdminTd>
            </AdminTr>
          )}
          {list.map((row) => (
            <AdminTr key={row.id}>
              <AdminTd>
                {row.origin === "legacy" ? (
                  <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">기존 리드</span>
                ) : (
                  <span className="text-[var(--muted)]">—</span>
                )}
              </AdminTd>
              <AdminTd>{(row.first_name || "") + (row.last_name ? " " + row.last_name : "") || "—"}</AdminTd>
              <AdminTd>{row.email}</AdminTd>
              <AdminTd>{(row.phone_country_code || row.phone_number) ? [row.phone_country_code, row.phone_number].filter(Boolean).join(" ") : "—"}</AdminTd>
              <AdminTd>{row.marketing_consent ? "예" : "아니오"}</AdminTd>
              <AdminTd>{row.source ?? "—"}</AdminTd>
              <AdminTd>{formatDate(row.created_at)}</AdminTd>
            </AdminTr>
          ))}
        </AdminTableBody>
      </AdminTable>
    </>
  );
}
