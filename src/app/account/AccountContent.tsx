"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSession, signOut } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import type { Profile } from "@/types/profile";
import type { EnrollmentWithCourse } from "@/types/enrollment";
import type { AccountPurchaseRow } from "@/types/account";

const DEFAULT_THUMB = "https://placehold.co/400x225/FAF9F6/1a1a1a?text=Course";

export default function AccountContent() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [purchases, setPurchases] = useState<AccountPurchaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then(async (s) => {
      setUser(s?.user ?? null);
      const token = s?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [profileRes, enrRes, purRes] = await Promise.all([
          fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/account/enrollments", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/account/purchases", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data);
        }
        if (enrRes.ok) {
          const data = await enrRes.json();
          setEnrollments(Array.isArray(data) ? data : []);
        }
        if (purRes.ok) {
          const data = await purRes.json();
          setPurchases(Array.isArray(data) ? data : []);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-[720px] px-4">
        <p className="text-body text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-[720px] px-4 text-center">
        <h1 className="text-section-title text-[var(--foreground)]">Account</h1>
        <p className="mt-4 text-body text-zinc-600">Sign in to view your account.</p>
        <Link href="/" className="mt-6 inline-block text-body text-[var(--flare-support-1)] hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "Member";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return iso;
    }
  };

  const formatMoney = (currency: string, amount: number) => {
    const n = Number(amount);
    if (Number.isNaN(n)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  return (
    <div className="mx-auto max-w-[720px] px-4">
      <h1 className="text-section-title text-[var(--foreground)]">Account</h1>
      <div className="mt-6 flex items-center gap-4">
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
            unoptimized
          />
        )}
        <div>
          <p className="text-body font-medium text-[var(--foreground)]">{displayName}</p>
          <p className="text-body text-zinc-600">{profile?.email ?? user.email}</p>
          {profile && (
            <p className="mt-1 text-sm text-zinc-500">Status: {profile.status}</p>
          )}
        </div>
      </div>

      <p className="mt-8 text-sm text-zinc-600 leading-relaxed">
        Purchases made while you are signed in are linked to this account and unlock your courses below. For checkout,
        stay logged in so the same email is used.
      </p>

      <section className="mt-12 border-t border-zinc-200 pt-10">
        <h2 className="text-card-title text-[var(--foreground)]">My courses</h2>
        {enrollments.length === 0 ? (
          <p className="mt-4 text-body text-zinc-600">
            No enrolled courses yet.{" "}
            <Link href="/" className="text-[var(--flare-support-1)] hover:underline">
              Explore programs
            </Link>
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {enrollments.map((e) => {
              const slug = e.course.slug;
              const thumb = e.course.thumbnail_url || DEFAULT_THUMB;
              if (!slug) return null;
              return (
                <li
                  key={e.id}
                  className="flex gap-4 rounded-[10px] border border-zinc-200 bg-white p-3 sm:p-4"
                >
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-[8px] bg-zinc-100">
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized={thumb.startsWith("http") && !thumb.includes("placehold")}
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-body font-medium text-[var(--foreground)]">{e.course.title ?? "Course"}</p>
                      <p className="text-sm text-zinc-500">Access since {formatDate(e.granted_at)}</p>
                    </div>
                    <Link
                      href={`/learn/${encodeURIComponent(slug)}`}
                      className="inline-flex shrink-0 items-center justify-center rounded-[10px] bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      Open course
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-12 border-t border-zinc-200 pt-10">
        <h2 className="text-card-title text-[var(--foreground)]">Purchase history</h2>
        {purchases.length === 0 ? (
          <p className="mt-4 text-body text-zinc-600">
            No purchases linked to this account yet. History appears when you complete checkout while signed in.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-[10px] border border-zinc-200">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Course</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium">Order</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-3 py-2 text-zinc-700 whitespace-nowrap">{formatDate(p.purchased_at)}</td>
                    <td className="px-3 py-2 text-zinc-800">{p.course_title ?? "—"}</td>
                    <td className="px-3 py-2 text-zinc-700 whitespace-nowrap">
                      {formatMoney(p.currency, p.amount)}
                    </td>
                    <td className="px-3 py-2 text-zinc-500 font-mono text-xs">
                      {p.external_order_id ? p.external_order_id.slice(0, 8) + "…" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => signOut()}
        className="mt-10 rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50"
      >
        Sign out
      </button>
    </div>
  );
}