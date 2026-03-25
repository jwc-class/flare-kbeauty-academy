"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminHeaders } from "@/lib/admin-auth";
import type { AdminLeadListRow } from "@/types/admin";
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
  DeleteConfirmModal,
} from "@/components/admin";

type ListResponse = {
  rows: AdminLeadListRow[];
  total: number;
  page: number;
  pageSize: number;
};

export default function AdminLeadsPage() {
  const [list, setList] = useState<AdminLeadListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<50 | 100>(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminLeadListRow | null>(null);
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
      const headers = await getAdminHeaders();
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      const res = await fetch(`/api/admin/lead-submissions?${qs}`, { headers });
      if (res.status === 401) return;
      const data = (await res.json().catch(() => ({}))) as ListResponse & { error?: string };
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "목록을 불러오지 못했습니다.");
        return;
      }
      setList(Array.isArray(data.rows) ? data.rows : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch {
      setError("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const headers = await getAdminHeaders();
        const res = await fetch("/api/auth/admin-status", { headers });
        const data = await res.json().catch(() => ({}));
        setIsSuperAdmin(data?.role === "super_admin");
      } catch {
        setIsSuperAdmin(false);
      }
    };
    fetchRole();
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/contacts", {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "저장 실패");
      }
      setForm({ first_name: "", last_name: "", email: "", phone_country_code: "", phone_number: "", marketing_consent: false, source: "" });
      setShowForm(false);
      setPage(1);
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

  const deleteUrlForRow = (row: AdminLeadListRow) =>
    row.origin === "legacy" ? `/api/admin/contacts/${row.id}` : `/api/admin/lead-submissions/${row.id}`;

  const deleteLabelForRow = (row: AdminLeadListRow) =>
    row.origin === "legacy" ? row.email || row.id : `${row.email} · ${formatDate(row.submitted_at)}`;

  const handleDelete = async (): Promise<void> => {
    if (!isSuperAdmin) return;
    if (!pendingDelete) return;
    const row = pendingDelete;
    setDeletingId(row.id);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(deleteUrlForRow(row), {
        method: "DELETE",
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "삭제에 실패했습니다.");
        return;
      }
      setPendingDelete(null);
      await fetchList();
    } catch {
      setError("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const colCount = isSuperAdmin ? 8 : 7;

  const pageButtons = () => {
    const maxBtn = 7;
    const startInitial = Math.max(1, page - Math.floor(maxBtn / 2));
    const end = Math.min(totalPages, startInitial + maxBtn - 1);
    const start = Math.max(1, end - maxBtn + 1);
    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  return (
    <>
      <AdminPageHeader
        title="Leads"
        description="리드 폼 제출은 한 번마다 한 줄입니다. 멤버는 프로필 이메일과 같은 주소로 제출된 모든 줄이 연결됩니다."
        action={
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-cta">
            {showForm ? "취소" : "연락처 추가"}
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-[var(--foreground)]">
        <span className="text-zinc-500">페이지당</span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPage(1);
            setPageSize(Number(e.target.value) === 100 ? 100 : 50);
          }}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5"
        >
          <option value={50}>50개</option>
          <option value={100}>100개</option>
        </select>
        <span className="text-zinc-500">
          전체 <strong>{total}</strong>건 · {page}/{totalPages}페이지
        </span>
      </div>

      {showForm && (
        <AdminFormSection title="연락처만 추가 (제출 이력 없음)">
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
              <button type="submit" disabled={saving} className="btn-cta disabled:opacity-50">
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
      <div className="overflow-x-auto rounded-[10px] border border-zinc-200">
        <AdminTable aria-label="Leads">
          <AdminTableHead>
            <AdminTh>구분</AdminTh>
            <AdminTh>이름</AdminTh>
            <AdminTh>이메일</AdminTh>
            <AdminTh>전화</AdminTh>
            <AdminTh>마케팅 동의</AdminTh>
            <AdminTh>유입경로</AdminTh>
            <AdminTh>등록일</AdminTh>
            {isSuperAdmin && <AdminTh>액션</AdminTh>}
          </AdminTableHead>
          <AdminTableBody>
            {!loading && list.length === 0 && (
              <AdminTr>
                <AdminTd colSpan={colCount} className="p-8 text-center text-[var(--muted)]">
                  리드가 없습니다. 리드 폼 제출 시 한 줄씩 표시됩니다.
                </AdminTd>
              </AdminTr>
            )}
            {list.map((row) => (
              <AdminTr key={row.id}>
                <AdminTd>
                  {row.origin === "legacy" ? (
                    <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">기존 리드</span>
                  ) : (
                    <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">폼 제출</span>
                  )}
                </AdminTd>
                <AdminTd>{[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}</AdminTd>
                <AdminTd className="max-w-[200px] break-all text-sm">{row.email}</AdminTd>
                <AdminTd className="whitespace-nowrap text-sm">
                  {[row.phone_country_code, row.phone_number].filter(Boolean).join(" ") || "—"}
                </AdminTd>
                <AdminTd>{row.marketing_consent ? "예" : "아니오"}</AdminTd>
                <AdminTd className="max-w-[140px] truncate text-sm">{row.source ?? "—"}</AdminTd>
                <AdminTd className="whitespace-nowrap text-sm">{formatDate(row.submitted_at)}</AdminTd>
                {isSuperAdmin && (
                  <AdminTd>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(row)}
                      disabled={deletingId === row.id}
                      className="rounded-[10px] border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === row.id ? "삭제중..." : "삭제"}
                    </button>
                  </AdminTd>
                )}
              </AdminTr>
            ))}
          </AdminTableBody>
        </AdminTable>
      </div>

      {!loading && totalPages > 1 && (
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-2" aria-label="페이지">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            이전
          </button>
          {pageButtons().map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={
                n === page
                  ? "min-w-[2.25rem] rounded-lg bg-[var(--flare-support-1)] px-3 py-1.5 text-sm font-medium text-white"
                  : "min-w-[2.25rem] rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-zinc-50"
              }
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            다음
          </button>
        </nav>
      )}

      <DeleteConfirmModal
        open={isSuperAdmin && !!pendingDelete}
        targetLabel={pendingDelete ? deleteLabelForRow(pendingDelete) : "-"}
        loading={!!pendingDelete && deletingId === pendingDelete.id}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
