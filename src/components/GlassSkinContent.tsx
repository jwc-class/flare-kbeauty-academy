"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import type { PublicLandingPage } from "@/lib/public-content";

const ctaButtonClass =
  "btn-cta min-h-[56px] w-full sm:w-auto sm:min-w-[200px] touch-manipulation text-body";

const FALLBACK = {
  badge: "Free Guide · No Sign-Up Hassle",
  headline: "Your Skincare Isn't Working.\nHere's the Korean Fix.",
  subline: "The exact 7-step routine Korean beauty experts use for clear, glass-like skin—in one free guide.",
  subline2: "Wrong order, wrong ingredients, too many products. Most people never get that glow because they skip the system Koreans actually use.",
  cta: "Get the Free Blueprint →",
  tags: ["Korean skincare order", "Glass skin steps", "Hydration method", "Expert tips"],
  disclaimer: "Free instant download. No spam. Unsubscribe anytime.",
};

type Props = {
  /** When set, hero and CTA text use DB content; otherwise fallback. */
  landingPage?: PublicLandingPage | null;
};

export default function GlassSkinContent({ landingPage }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const lp = landingPage;
  const heroTitle = lp?.hero_title?.trim() || FALLBACK.headline.split("\n")[0];
  const heroTitleHighlight = lp?.hero_title?.trim() ? null : FALLBACK.headline.split("\n")[1]?.trim() || "Here's the Korean Fix.";
  const heroSubtitle = lp?.hero_subtitle?.trim() || FALLBACK.subline;
  const heroSubline2 = lp?.hero_subtitle ? (lp?.lead_magnet?.description?.slice(0, 200) || FALLBACK.subline2) : FALLBACK.subline2;
  const ctaText = lp?.cta_text?.trim() || FALLBACK.cta;
  const badge = FALLBACK.badge;
  const tags = FALLBACK.tags;
  const disclaimer = FALLBACK.disclaimer;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section className="relative bg-[image:var(--gradient-flare-subtle)] px-4 pb-32 pt-40 sm:px-8 sm:pb-36 sm:pt-44">
          <div className="mx-auto max-w-[900px] text-center">
            <p className="text-[var(--muted)] font-semibold uppercase tracking-[0.06em] text-[15px]">
              {badge}
            </p>
            <h1
              className="font-serif-heading mx-auto mt-4 font-semibold leading-[1.08] text-[var(--foreground)] sm:mt-5"
              style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)", letterSpacing: "0.02em" }}
            >
              {heroTitle}
              {heroTitleHighlight && (
                <>
                  <br className="hidden sm:block" />{" "}
                  <span className="bg-[image:var(--gradient-flare)] bg-clip-text text-transparent">
                    {heroTitleHighlight}
                  </span>
                </>
              )}
            </h1>
            <p
              className="mx-auto mt-8 max-w-[650px] text-[var(--muted)] sm:mt-10"
              style={{ fontSize: "clamp(1.125rem, 2vw, 22px)", lineHeight: 1.7, letterSpacing: "0.02em" }}
            >
              {heroSubtitle}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-body text-[var(--foreground-soft)] sm:mt-5">
              {heroSubline2}
            </p>
            <div className="mt-10">
              <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                {ctaText}
              </button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[#f0ebe8]/90 bg-[var(--background-pastel-pink)]/50 px-3 py-1.5 text-body text-[var(--foreground-soft)] shadow-soft-sm"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-5 text-body text-[var(--muted)]">{disclaimer}</p>
          </div>
        </section>

        {/* Section 2 — Problem */}
        <section className="bg-[#fefcfb] py-28 px-4 md:py-36 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-24 max-w-3xl text-center">
              <h2 className="text-section-title text-[var(--foreground)]">
                Why You Still Don&apos;t Have That Glow
              </h2>
              <p className="mt-8 text-body-lg text-[var(--muted)]">
                You&apos;ve tried the serums and the 10-step lists. So why does your skin still look dull or breakout? Korean skincare isn&apos;t about more products—it&apos;s about the right order and the right philosophy.
              </p>
            </div>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Wrong product order", sub: "Layering in the wrong sequence wastes money and blocks results." },
                { title: "Too many products", sub: "K-beauty is about fewer, smarter steps—not a cabinet full of bottles." },
                { title: "Barrier damage", sub: "Harsh ingredients and order can weaken your skin barrier." },
                { title: "Skipping the key step", sub: "The hydration step Koreans never skip is what creates the glow." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#f2e8e4] bg-[var(--background-pastel-pink)]/40 p-8 transition-all duration-300 ease-in-out shadow-soft-sm hover:border-[#e8d4dc]/60 hover:shadow-soft"
                >
                  <p className="font-semibold text-[var(--foreground)] text-body">{item.title}</p>
                  <p className="mt-2 text-body leading-relaxed text-[var(--foreground-soft)]">{item.sub}</p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-center text-body font-medium text-[var(--foreground-soft)] sm:mt-14">
              The Korean Glass Skin Blueprint shows you the exact routine that fixes this.
            </p>
            <div className="mt-10 flex justify-center">
              <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                Get the Free Blueprint
              </button>
            </div>
          </div>
        </section>

        {/* Section 3 — Solution */}
        <section className="bg-[var(--background-pastel-lavender)] py-28 px-4 md:py-36 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-24 max-w-3xl text-center">
              <h2 className="text-section-title text-[var(--foreground)]">
                What You Get in the Free Guide
              </h2>
              <p className="mt-8 text-body-lg text-[var(--muted)]">
                No fluff. The same system Korean beauty experts and influencers actually use—step by step.
              </p>
            </div>
            <div className="mx-auto max-w-2xl">
              <ul className="space-y-5 sm:space-y-6">
                {[
                  "The Korean layering method (and why order matters more than products)",
                  "The exact 7-step order Korean experts use",
                  "Key ingredients that build glass skin (and what to avoid)",
                  "The hydration technique that creates the glow",
                  "The biggest mistakes foreigners make—and how to fix them",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-body text-[var(--foreground-soft)]">
                    <span className="mt-0.5 shrink-0 text-[var(--cta-rose-deep)]" aria-hidden>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-14 text-center sm:mt-16">
              <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                Get the Free Guide
              </button>
            </div>
          </div>
        </section>

        {/* Section 4 — Authority */}
        <section className="bg-[#fffbf7] py-28 px-4 md:py-36 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-28">
              <div className="order-2 lg:order-1">
                <h2 className="text-section-title text-[var(--foreground)]">
                  Real Korean Beauty, Not Guesswork
                </h2>
                <p className="mt-8 text-body-lg leading-relaxed text-[var(--foreground-soft)] sm:mt-10">
                  This guide is based on the real routines used by Korean beauty pros and influencers—the same philosophy that made K-beauty famous worldwide.
                </p>
                <p className="mt-6 text-body leading-relaxed text-[var(--foreground-soft)]">
                  Stop copying random TikTok steps. Get the system that actually creates glass skin.
                </p>
                <div className="mt-10">
                  <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                    Get the Free Blueprint
                  </button>
                </div>
              </div>
              <div className="relative order-1 lg:order-2">
                <div
                  className="flex aspect-[4/3] min-h-[200px] items-center justify-center rounded-2xl border border-[#f0ebe8] bg-[image:var(--gradient-flare-subtle)] shadow-soft sm:min-h-0"
                  aria-hidden
                >
                  <span className="text-6xl sm:text-8xl" role="img" aria-label="Cherry blossom">🌸</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="bg-[var(--background-pastel-lavender)]/50 py-28 px-4 md:py-36 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-24 max-w-3xl text-center">
              <h2 className="text-section-title text-[var(--foreground)]">
                Imagine Your Skin in 2–4 Weeks
              </h2>
              <p className="mt-8 text-body-lg text-[var(--muted)]">
                Not more products. Just the right routine. Here&apos;s what changes when you follow the Korean system.
              </p>
            </div>
            <div className="grid gap-10 sm:grid-cols-3">
              {[
                { title: "Clearer, calmer skin", desc: "Right order and ingredients reduce irritation and breakouts." },
                { title: "Stronger skin barrier", desc: "Hydration and layering protect and repair your barrier." },
                { title: "Natural glass-like glow", desc: "The dewy look comes from method, not magic." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#f2e8e4] bg-[#fcfbfa] p-8 text-center transition-all duration-300 ease-in-out shadow-soft-sm hover:border-[#e8d4dc]/60 hover:shadow-soft"
                >
                  <h3 className="text-card-title text-[var(--foreground)]">{item.title}</h3>
                  <p className="mt-4 text-body text-[var(--foreground-soft)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 — Final CTA */}
        <section className="bg-[image:var(--gradient-flare-subtle)] py-28 px-4 md:py-36 sm:px-8">
          <div className="mx-auto max-w-[720px] text-center">
            <h2 className="text-section-title text-[var(--foreground)]">
              One Free Guide. The Korean Glass Skin System.
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-body-lg text-[var(--muted)] sm:mt-10">
              Enter your email and get the blueprint instantly. No payment, no commitment—just the exact steps that work.
            </p>
            <div className="mt-14">
              <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                Send Me the Free Guide
              </button>
            </div>
            <p className="mt-5 text-body text-[var(--muted)]">
              Free download · Instant access · Unsubscribe anytime
            </p>
          </div>
        </section>
        <Footer />
      </main>
      <LeadCaptureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        source="glass-skin"
        successRedirect="/thank-you"
        landing_page_id={lp?.id ?? undefined}
        lead_magnet_id={lp?.lead_magnet_id ?? lp?.lead_magnet?.id ?? undefined}
      />
    </div>
  );
}
