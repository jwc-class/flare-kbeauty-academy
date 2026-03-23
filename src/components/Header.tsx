"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getSession, signInWithGoogle, signOut } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    getSession().then((s) => {
      setUser(s?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    const { error } = await signInWithGoogle();
    if (error) setAuthLoading(false);
  };

  const handleSignOut = async () => {
    setAccountOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    setUser(null);
  };

  const navLinks = [
    { href: "#courses", label: "Courses" },
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#about", label: "About" },
  ];

  return (
    <div className="fixed left-1/2 top-5 z-[9999] w-[calc(100%-40px)] max-w-[1200px] -translate-x-1/2 px-4 sm:px-0">
      <header
        className="flex min-h-[56px] items-center justify-between gap-4 rounded-2xl px-6 py-3.5 shadow-soft-sm border border-[#f0ebe8]/90"
        style={{
          background: "rgba(252, 251, 250, 0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex shrink-0 items-center" aria-label="K Beauty Academy 홈">
            <Image
              src="/logo.png"
              alt="K Beauty Academy"
              width={40}
              height={40}
              className="h-9 w-9 object-contain sm:h-10 sm:w-10"
            />
          </Link>
          <nav className="hidden md:flex">
            <div className="flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="uppercase tracking-wide text-[var(--foreground)] text-body hover:text-[var(--cta-rose-deep)] transition-all duration-300 ease-in-out"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {!authLoading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-2xl border border-[#ebe4e0] bg-white/60 px-4 py-2.5 text-body text-[var(--foreground)] hover:bg-[#fef8fa] transition-all duration-300 ease-in-out"
                    aria-expanded={accountOpen}
                    aria-haspopup="true"
                  >
                    <span className="max-w-[140px] truncate">
                      {user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Account"}
                    </span>
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {accountOpen && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden onClick={() => setAccountOpen(false)} />
                      <div
                        className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-2xl border border-[#ebe4e0] bg-[#fcfbfa] py-2 shadow-soft"
                        role="menu"
                      >
                        <div className="border-b border-[#f0ebe8] px-4 py-2">
                          <p className="truncate text-sm text-[var(--muted)]">{user.email}</p>
                        </div>
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-body text-[var(--foreground)] hover:bg-[#fef8fa] transition-colors duration-300"
                          role="menuitem"
                          onClick={() => setAccountOpen(false)}
                        >
                          Account
                        </Link>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full px-4 py-2 text-left text-body text-[var(--foreground)] hover:bg-[#fef8fa] transition-colors duration-300"
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-2 rounded-2xl border border-[#e8e0dc] bg-white/90 px-4 py-2.5 font-medium text-body text-[var(--foreground)] transition-all duration-300 ease-in-out hover:bg-[#fef8fa] hover:border-[#e0d5cf]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              )}
            </>
          )}
          <Link
            href="/glass-skin"
            className="btn-cta"
          >
            Get the Free Guide
          </Link>
        </div>

        <button
          className="flex p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {mobileMenuOpen && (
        <div
          className="mt-2 rounded-2xl border border-[#f0ebe8]/90 px-6 py-4 shadow-soft-sm md:hidden"
          style={{
            background: "rgba(252, 251, 250, 0.92)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="uppercase tracking-wide text-[var(--foreground)] hover:text-[var(--cta-rose-deep)] transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!authLoading && (
              <>
                {user ? (
                  <>
                    <p className="truncate text-body text-[var(--muted)]">{user.email}</p>
                    <Link href="/account" className="text-body text-[var(--foreground)] hover:text-[var(--cta-rose-deep)] transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                      Account
                    </Link>
                    <button type="button" onClick={handleSignOut} className="text-left text-body text-[var(--foreground)] hover:text-[var(--cta-rose-deep)] transition-colors duration-300">
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); handleGoogleSignIn(); }}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-[#e8e0dc] bg-white px-6 py-3 font-medium text-body text-[var(--foreground)] transition-all duration-300 hover:bg-[#fef8fa]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                )}
              </>
            )}
            <Link
              href="/glass-skin"
              className="btn-cta w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get the Free Guide
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
