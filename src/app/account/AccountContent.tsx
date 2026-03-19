"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSession, signOut } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import type { Profile } from "@/types/profile";

export default function AccountContent() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then(async (s) => {
      setUser(s?.user ?? null);
      if (s?.access_token) {
        try {
          const res = await fetch("/api/profile", {
            headers: { Authorization: `Bearer ${s.access_token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setProfile(data);
          }
        } catch {
          // ignore
        }
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
      <p className="mt-8 text-body text-[var(--muted)]">
        Member area and course access will be available here. Stay tuned.
      </p>
      <button
        type="button"
        onClick={() => signOut()}
        className="mt-6 rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50"
      >
        Sign out
      </button>
    </div>
  );
}
