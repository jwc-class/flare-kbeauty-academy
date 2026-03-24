"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminHeaders } from "@/lib/admin-auth";
import {
  AdminPageHeader,
  AdminTable,
  AdminTableHead,
  AdminTh,
  AdminTableBody,
  AdminTr,
  AdminTd,
  AdminFormSection,
} from "@/components/admin";
import type { AdminUserListItem } from "@/app/api/admin/admin-users/route";

export default function AdminAdminUsersPage() {
  const [list, setList] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [grantEmail, setGrantEmail] = useState("");
  const [grantRole, setGrantRole] = useState<"admin" | "super_admin">("admin");
  const [granting, setGranting] = useState(false);
  const [grantMessage, setGrantMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/admin-users", { headers });
      if (res.status === 403) {
        setForbidden(true);
        setList([]);
        return;
      }
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

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = grantEmail.trim().toLowerCase();
    if (!email) return;
    setGranting(true);
    setGrantMessage(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/admin-users", {
        method: "POST",
        headers,
        body: JSON.stringify({ email, role: grantRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setGrantMessage({ type: "success", text: data?.message ?? "Admin access granted." });
        setGrantEmail("");
        fetchList();
      } else {
        setGrantMessage({ type: "error", text: data?.error ?? "Failed to grant access." });
      }
    } catch {
      setGrantMessage({ type: "error", text: "Failed to grant access." });
    } finally {
      setGranting(false);
    }
  };

  const handleStatusChange = async (id: string, status: "active" | "revoked") => {
    if (!isSuperAdmin) return;
    setUpdatingId(id);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/admin-users/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Update failed.");
        return;
      }
      fetchList();
    } catch {
      setError("Update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (id: string, role: "admin" | "super_admin") => {
    if (!isSuperAdmin) return;
    setUpdatingId(id);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/admin-users/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Update failed.");
        return;
      }
      fetchList();
    } catch {
      setError("Update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString("ko-KR");
    } catch {
      return s;
    }
  };

  if (forbidden) {
    return (
      <>
        <AdminPageHeader
          title="Admin Users"
          description="Manage who can access the admin."
        />
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-6 text-body text-amber-800">
          Access denied. Only super admins can manage admin users.
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Admin Users"
        description="Grant or revoke admin access. Only existing members (who have signed in with Google) can be made admins."
        action={
          <button
            type="button"
            onClick={() => fetchList()}
            disabled={loading}
            className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50 disabled:opacity-50"
          >
            새로고침
          </button>
        }
      />
      {error && (
        <p className="mb-4 text-body text-red-600">{error}</p>
      )}

      <AdminFormSection
        title="Grant admin access"
        description="Enter the email of an existing member (they must have signed in at least once)."
      >
        <form onSubmit={handleGrant} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-body font-medium text-[var(--foreground)] mb-1">Email</label>
            <input
              type="email"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              placeholder="member@example.com"
              className="rounded-[8px] border border-zinc-300 px-3 py-2 text-body min-w-[220px]"
              required
            />
          </div>
          <div>
            <label className="block text-body font-medium text-[var(--foreground)] mb-1">Role</label>
            <select
              value={grantRole}
              onChange={(e) => setGrantRole(e.target.value as "admin" | "super_admin")}
              className="rounded-[8px] border border-zinc-300 px-3 py-2 text-body"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={granting}
            className="btn-cta disabled:opacity-50"
          >
            {granting ? "Granting…" : "Grant access"}
          </button>
        </form>
        {grantMessage && (
          <p className={`mt-3 text-body ${grantMessage.type === "success" ? "text-green-700" : "text-red-600"}`}>
            {grantMessage.text}
          </p>
        )}
      </AdminFormSection>

      <section className="rounded-[10px] border border-zinc-200 bg-white overflow-hidden">
        <h2 className="text-card-title text-[var(--foreground)] p-4 border-b border-zinc-100">
          Current admin users
        </h2>
        <AdminTable aria-label="Admin users">
          <AdminTableHead>
            <AdminTh>Name</AdminTh>
            <AdminTh>Email</AdminTh>
            <AdminTh>Role</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Granted by</AdminTh>
            <AdminTh>Created</AdminTh>
            {isSuperAdmin && <AdminTh>Actions</AdminTh>}
          </AdminTableHead>
          <AdminTableBody>
            {!loading && list.length === 0 && (
              <AdminTr>
                <AdminTd colSpan={isSuperAdmin ? 7 : 6} className="p-8 text-center text-[var(--muted)]">
                  No admin users yet. Grant access above.
                </AdminTd>
              </AdminTr>
            )}
            {list.map((row) => (
              <AdminTr key={row.id}>
                <AdminTd className="font-medium text-[var(--foreground)]">
                  {row.full_name || "—"}
                </AdminTd>
                <AdminTd className="text-zinc-600">{row.email}</AdminTd>
                <AdminTd>
                  <span className={`rounded px-2 py-0.5 text-sm font-medium ${
                    row.role === "super_admin" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700"
                  }`}>
                    {row.role}
                  </span>
                </AdminTd>
                <AdminTd>
                  <span className={`rounded px-2 py-0.5 text-sm ${
                    row.status === "active" ? "bg-green-100 text-green-800" : "bg-zinc-200 text-zinc-600"
                  }`}>
                    {row.status}
                  </span>
                </AdminTd>
                <AdminTd className="text-zinc-600 text-sm">
                  {row.granted_by_name || row.granted_by_email || "—"}
                </AdminTd>
                <AdminTd className="text-zinc-600 text-sm">{formatDate(row.created_at)}</AdminTd>
                {isSuperAdmin && (
                  <AdminTd>
                    <div className="flex flex-wrap items-center gap-2">
                      {row.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => window.confirm("Revoke admin access for this user?") && handleStatusChange(row.id, "revoked")}
                          disabled={updatingId === row.id}
                          className="rounded px-2 py-1 text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.id, "active")}
                          disabled={updatingId === row.id}
                          className="rounded px-2 py-1 text-sm text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      )}
                      {row.role === "admin" ? (
                        <button
                          type="button"
                          onClick={() => window.confirm("Promote to Super Admin?") && handleRoleChange(row.id, "super_admin")}
                          disabled={updatingId === row.id}
                          className="rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                        >
                          Set Super Admin
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => window.confirm("Demote to Admin? You cannot demote yourself if you are the only super admin.") && handleRoleChange(row.id, "admin")}
                          disabled={updatingId === row.id}
                          className="rounded px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                        >
                          Set Admin
                        </button>
                      )}
                    </div>
                  </AdminTd>
                )}
              </AdminTr>
            ))}
          </AdminTableBody>
        </AdminTable>
      </section>
    </>
  );
}
