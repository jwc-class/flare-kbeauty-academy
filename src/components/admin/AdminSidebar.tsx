"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getSession } from "@/lib/auth";

const nav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Members", href: "/admin/members" },
  { label: "Contacts", href: "/admin/contacts" },
  { label: "Lead Magnets", href: "/admin/lead-magnets" },
  { label: "Landing Pages", href: "/admin/landing-pages" },
  { label: "Offer Pages", href: "/admin/offer-pages" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Purchases", href: "/admin/purchases" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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

  const links = [
    ...nav,
    ...(isSuperAdmin ? [{ label: "Admin Users", href: "/admin/admin-users" }] : []),
    { label: "Settings", href: "/admin/settings" },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white flex flex-col">
      <div className="p-4 border-b border-zinc-100">
        <Link href="/admin" className="text-body font-semibold text-[var(--foreground)]">
          Admin
        </Link>
      </div>
      <nav className="p-2 flex-1">
        <ul className="space-y-0.5">
          {links.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-[8px] px-3 py-2 text-body text-[var(--foreground)] ${
                    isActive ? "bg-[var(--gradient-flare-subtle)] font-medium" : "hover:bg-zinc-100"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
