"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#courses", label: "Courses" },
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#about", label: "About" },
  ];

  return (
    <div className="fixed left-1/2 top-5 z-[9999] w-[calc(100%-40px)] max-w-[1200px] -translate-x-1/2 px-4 sm:px-0">
      <header
        className="flex min-h-[56px] items-center justify-between gap-4 rounded-[10px] px-6 py-3.5"
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
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
                  className="uppercase text-[var(--foreground)] text-body hover:text-[var(--flare-support-1)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="hidden shrink-0 md:block">
          <Link
            href="/glass-skin"
            className="rounded-[10px] bg-[var(--flare-support-1)] px-6 py-3 font-semibold text-body text-white transition-colors hover:bg-[var(--flare-support-2)]"
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
          className="mt-2 rounded-[10px] px-6 py-4 md:hidden"
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="uppercase text-[var(--foreground)] hover:text-[var(--flare-support-1)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/glass-skin"
              className="rounded-[10px] bg-[var(--flare-support-1)] px-6 py-3 text-center font-semibold text-white hover:bg-[var(--flare-support-2)]"
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
