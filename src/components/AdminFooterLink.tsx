"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSession } from "@/lib/auth";

/**
 * Renders Admin link only when the current user is an active admin.
 * Uses /api/auth/admin-status with Bearer token.
 */
export default function AdminFooterLink() {
  const [show, setShow] = useState(false);

  const check = useCallback(async () => {
    const session = await getSession();
    if (!session?.access_token) {
      setShow(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/admin-status", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      setShow(!!data?.isAdmin);
    } catch {
      setShow(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  if (!show) return null;

  return (
    <p className="mt-3">
      <Link
        href="/admin"
        className="text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        Admin
      </Link>
    </p>
  );
}
