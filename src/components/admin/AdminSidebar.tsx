"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getSession } from "@/lib/auth";

const dbLinks = [
  { label: "Members", href: "/admin/members" },
  { label: "Leads", href: "/admin/leads" },
];

const pageLinks = [
  { label: "Overview", href: "/admin/pages/overview" },
  { label: "#1 Landing Pages", href: "/admin/landing-pages" },
  { label: "#2 Offer Pages", href: "/admin/offer-pages" },
  { label: "#3 Courses", href: "/admin/courses" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [dbOpen, setDbOpen] = useState(true);
  const [pagesOpen, setPagesOpen] = useState(true);

  const isLinkActive = useCallback(
    (href: string) => pathname === href || (href !== "/admin" && pathname.startsWith(href)),
    [pathname]
  );

  const checkRole = useCallback(async () => {
    const session = await getSession();
    if (!session?.access_token) return;
    try {
      const res = await fetch("/api/auth/admin-status", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      setIsSuperAdmin(data?.role === "super_admin");
    } catch {
      setIsSuperAdmin(false);
    }
  }, []);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  useEffect(() => {
    if (dbLinks.some((item) => isLinkActive(item.href))) setDbOpen(true);
    if (pageLinks.some((item) => isLinkActive(item.href))) setPagesOpen(true);
  }, [isLinkActive]);

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white flex flex-col">
      <div className="p-4 border-b border-zinc-100">
        <Link href="/admin" className="text-body font-semibold text-[var(--foreground)]">
          Admin
        </Link>
      </div>
      <nav className="p-2 flex-1">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin"
              className={`block rounded-[8px] px-3 py-2 text-body text-[var(--foreground)] ${
                isLinkActive("/admin") ? "bg-[var(--gradient-flare-subtle)] font-medium" : "hover:bg-zinc-100"
              }`}
            >
              Dashboard
            </Link>
          </li>

          <li>
            <button
              type="button"
              onClick={() => setDbOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-body text-[var(--foreground)] hover:bg-zinc-100"
            >
              <span>DB</span>
              <span className="text-xs text-zinc-500">{dbOpen ? "▾" : "▸"}</span>
            </button>
            {dbOpen && (
              <ul className="mt-1 space-y-0.5 pl-2">
                {dbLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-[8px] px-3 py-1.5 text-body text-[var(--foreground)] ${
                        isLinkActive(item.href) ? "bg-[var(--gradient-flare-subtle)] font-medium" : "hover:bg-zinc-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <button
              type="button"
              onClick={() => setPagesOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-body text-[var(--foreground)] hover:bg-zinc-100"
            >
              <span>Pages</span>
              <span className="text-xs text-zinc-500">{pagesOpen ? "▾" : "▸"}</span>
            </button>
            {pagesOpen && (
              <ul className="mt-1 space-y-0.5 pl-2">
                {pageLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-[8px] px-3 py-1.5 text-body text-[var(--foreground)] ${
                        isLinkActive(item.href) ? "bg-[var(--gradient-flare-subtle)] font-medium" : "hover:bg-zinc-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <Link
              href="/admin/purchases"
              className={`block rounded-[8px] px-3 py-2 text-body text-[var(--foreground)] ${
                isLinkActive("/admin/purchases") ? "bg-[var(--gradient-flare-subtle)] font-medium" : "hover:bg-zinc-100"
              }`}
            >
              Purchases
            </Link>
          </li>

          {isSuperAdmin && (
            <li>
              <Link
                href="/admin/admin-users"
                className={`block rounded-[8px] px-3 py-2 text-body text-[var(--foreground)] ${
                  isLinkActive("/admin/admin-users") ? "bg-[var(--gradient-flare-subtle)] font-medium" : "hover:bg-zinc-100"
                }`}
              >
                Admin Users
              </Link>
            </li>
          )}

          <li>
            <Link
              href="/admin/settings"
              className={`block rounded-[8px] px-3 py-2 text-body text-[var(--foreground)] ${
                isLinkActive("/admin/settings") ? "bg-[var(--gradient-flare-subtle)] font-medium" : "hover:bg-zinc-100"
              }`}
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
