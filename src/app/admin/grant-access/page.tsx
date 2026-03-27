"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { getAdminHeaders } from "@/lib/admin-auth";
import { AdminPageHeader, AdminFormSection } from "@/components/admin";

type MemberRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  status: string;
};

type CourseOption = {
  id: string;
  title: string | null;
  slug: string | null;
  status: string | null;
};

type EnrollmentRow = {
  id: string;
  status: string;
  granted_at: string;
  source: string | null;
  courses: { id: string; title: string | null; slug: string | null; status: string | null } | null;
};

export default function AdminGrantAccessPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searching, setSearching] = useState(false);
  const [hits, setHits] = useState<MemberRow[]>([]);
  const [selected, setSelected] = useState<MemberRow | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseId, setCourseId] = useState("");
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCourses(true);
      setError(null);
      try {
        const headers = await getAdminHeaders();
        const res = await fetch("/api/admin/courses", { headers });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          if (!cancelled) setError(typeof data?.error === "string" ? data.error : "코스 목록을 불러오지 못했습니다.");
          return;
        }
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setCourses(
            list
              .filter((c: CourseOption) => c.status !== "archived")
              .map((c: Record<string, unknown>) => ({
                id: String(c.id ?? ""),
                title: c.title != null ? String(c.title) : null,
                slug: c.slug != null ? String(c.slug) : null,
                status: c.status != null ? String(c.status) : null,
              }))
          );
        }
      } catch {
        if (!cancelled) setError("코스 목록을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (debounced.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setSearching(true);
      setError(null);
      try {
        const headers = await getAdminHeaders();
        const res = await fetch(`/api/admin/members?q=${encodeURIComponent(debounced)}`, { headers });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          if (!cancelled) setError(typeof data?.error === "string" ? data.error : "검색에 실패했습니다.");
          return;
        }
        if (!cancelled) setHits(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError("검색에 실패했습니다.");
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const loadEnrollments = useCallback(async (profileId: string) => {
    setLoadingEnrollments(true);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/members/${profileId}/enrollments`, { headers });
      const data = await res.json().catch(() => []);
      if (res.ok) {
        setEnrollments(Array.isArray(data) ? data : []);
      } else {
        setEnrollments([]);
      }
    } catch {
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  }, []);

  const selectMember = (m: MemberRow) => {
    setSelected(m);
    setMessage(null);
    setError(null);
    loadEnrollments(m.id);
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !courseId) return;
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers,
        body: JSON.stringify({ profile_id: selected.id, course_id: courseId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "수강 부여에 실패했습니다.");
        return;
      }
      if (data?.alreadyActive) {
        setMessage("이미 해당 강의에 수강 중입니다.");
      } else {
        setMessage("수강 권한이 부여되었습니다.");
      }
      await loadEnrollments(selected.id);
    } catch {
      setError("수강 부여에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-[8px] border border-zinc-300 px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]";

  return (
    <>
      <AdminPageHeader
        title="수강 부여"
        description="멤버를 검색한 뒤 강의를 선택해 수동으로 수강 권한을 부여합니다. 결제 없이 등록할 때 사용합니다."
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-4 text-sm text-green-700">{message}</p>}

      <AdminFormSection title="1. 멤버 검색">
        <p className="mb-2 text-sm text-zinc-600">이메일 또는 이름 일부를 입력하세요 (2글자 이상).</p>
        <input
          type="search"
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
          placeholder="예: gmail.com 또는 Hong"
          className={inputCls}
          autoComplete="off"
        />
        {searching && <p className="mt-2 text-sm text-zinc-500">검색 중…</p>}
        {debounced.length >= 2 && !searching && hits.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500">검색 결과가 없습니다.</p>
        )}
        {hits.length > 0 && (
          <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto rounded-[8px] border border-zinc-200 bg-zinc-50 p-2">
            {hits.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => selectMember(m)}
                  className={`flex w-full items-center gap-3 rounded-[6px] px-2 py-2 text-left text-body hover:bg-white ${
                    selected?.id === m.id ? "bg-white ring-1 ring-[var(--flare-support-2)]" : ""
                  }`}
                >
                  {m.avatar_url ? (
                    <Image
                      src={m.avatar_url}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-xs text-zinc-500">
                      —
                    </span>
                  )}
                  <span>
                    <span className="font-medium text-[var(--foreground)]">{m.full_name || "이름 없음"}</span>
                    <span className="block text-sm text-zinc-600">{m.email || "—"}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminFormSection>

      {selected && (
        <AdminFormSection title="선택된 멤버">
          <p className="text-body text-[var(--foreground)]">
            {selected.full_name || "—"} <span className="text-zinc-600">({selected.email || "이메일 없음"})</span>
          </p>
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-700">현재 수강</p>
            {loadingEnrollments ? (
              <p className="mt-1 text-sm text-zinc-500">불러오는 중…</p>
            ) : enrollments.length === 0 ? (
              <p className="mt-1 text-sm text-zinc-500">등록된 수강이 없습니다.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                {enrollments.map((row) => {
                  const c = row.courses;
                  const title = c?.title ?? "—";
                  const src = row.source ?? "—";
                  return (
                    <li key={row.id}>
                      {title}{" "}
                      <span className="text-zinc-500">
                        ({c?.slug ?? "—"}) · {row.status} · {src}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </AdminFormSection>
      )}

      <AdminFormSection title="2. 강의 선택 후 부여">
        <form onSubmit={handleGrant} className="space-y-4">
          <div>
            <label htmlFor="course" className="mb-1 block text-sm font-medium text-zinc-700">
              강의
            </label>
            <select
              id="course"
              required
              value={courseId}
              onChange={(ev) => setCourseId(ev.target.value)}
              disabled={loadingCourses || !selected}
              className={inputCls}
            >
              <option value="">{loadingCourses ? "코스 불러오는 중…" : "강의를 선택하세요"}</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.slug || c.id}
                  {c.status === "draft" ? " (draft)" : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!selected || !courseId || submitting}
            className="rounded-[10px] bg-[var(--foreground)] px-5 py-2.5 text-body font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "처리 중…" : "수강 권한 부여"}
          </button>
        </form>
      </AdminFormSection>
    </>
  );
}