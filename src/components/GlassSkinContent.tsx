"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import type { PublicLandingPage } from "@/lib/public-content";

const ctaButtonClass =
  "inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-6 sm:px-7 py-3.5 font-semibold text-body text-white transition-colors hover:bg-[var(--flare-support-2)] min-h-[52px] w-full sm:w-auto sm:min-w-[200px] touch-manipulation";

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
  const heroSubline2 = lp?.hero_subtitle ? (lp.description?.slice(0, 200) || FALLBACK.subline2) : FALLBACK.subline2;
  const ctaText = lp?.cta_text?.trim() || FALLBACK.cta;
  const badge = FALLBACK.badge;
  const tags = FALLBACK.tags;
  const disclaimer = FALLBACK.disclaimer;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>
        <section className="relative px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:pb-[120px] lg:pt-[160px]">
          <div className="mx-auto max-w-[900px] text-center">
            <p className="text-[var(--flare-support-1)] font-semibold uppercase tracking-wide text-body">
              {badge}
            </p>
            <h1 className="mx-auto mt-3 font-bold leading-[1.08] tracking-tight text-[var(--foreground)] text-display sm:mt-4">
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
            <p className="mx-auto mt-5 max-w-[600px] text-body-lg font-medium text-zinc-700 sm:mt-6 sm:max-w-[650px]">
              {heroSubtitle}
            </p>
            <p className="mx-auto mt-3 max-w-xl text-body text-zinc-500 sm:mt-4">
              {heroSubline2}
            </p>
            <div className="mt-6 sm:mt-8">
              <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                {ctaText}
              </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:mt-8">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-zinc-100 px-3 py-1 text-body text-zinc-600">
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-4 text-body text-zinc-500">{disclaimer}</p>
          </div>
        </section>

        {/* Section 2 — Problem */}
        <section className="bg-white py-14 px-4 sm:px-6 sm:py-20 lg:py-[120px]">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16 lg:mb-20">
              <h2 className="text-section-title text-[var(--foreground)]">
                Why You Still Don&apos;t Have That Glow
              </h2>
              <p className="mt-4 text-body-lg text-zinc-600 sm:mt-6">
                You&apos;ve tried the serums and the 10-step lists. So why does your skin still look dull or breakout? Korean skincare isn&apos;t about more products—it&apos;s about the right order and the right philosophy.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              {[
                { title: "Wrong product order", sub: "Layering in the wrong sequence wastes money and blocks results." },
                { title: "Too many products", sub: "K-beauty is about fewer, smarter steps—not a cabinet full of bottles." },
                { title: "Barrier damage", sub: "Harsh ingredients and order can weaken your skin barrier." },
                { title: "Skipping the key step", sub: "The hydration step Koreans never skip is what creates the glow." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[10px] border border-zinc-100 bg-[var(--background)] p-5 transition-colors hover:border-[var(--flare-support-3)]/30 sm:p-6 lg:p-8"
                >
                  <p className="font-semibold text-[var(--foreground)] text-body">{item.title}</p>
                  <p className="mt-1.5 text-body text-zinc-600">{item.sub}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-body font-medium text-zinc-700 sm:mt-12">
              The Korean Glass Skin Blueprint shows you the exact routine that fixes this.
            </p>
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                Get the Free Blueprint
              </button>
            </div>
          </div>
        </section>

        {/* Section 3 — Solution */}
        <section className="py-14 px-4 sm:px-6 sm:py-20 lg:py-[120px] bg-[var(--background)]">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
              <h2 className="text-section-title text-[var(--foreground)]">
                What You Get in the Free Guide
              </h2>
              <p className="mt-4 text-body-lg text-zinc-600 sm:mt-6">
                No fluff. The same system Korean beauty experts and influencers actually use—step by step.
              </p>
            </div>
            <div className="mx-auto max-w-2xl">
              <ul className="space-y-4 sm:space-y-5">
                {[
                  "The Korean layering method (and why order matters more than products)",
                  "The exact 7-step order Korean experts use",
                  "Key ingredients that build glass skin (and what to avoid)",
                  "The hydration technique that creates the glow",
                  "The biggest mistakes foreigners make—and how to fix them",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-body text-zinc-700">
                    <span className="mt-0.5 shrink-0 text-[var(--flare-support-1)]" aria-hidden>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 text-center sm:mt-14">
              <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                Get the Free Guide
              </button>
            </div>
          </div>
        </section>

        {/* Section 4 — Authority */}
        <section className="bg-white py-14 px-4 sm:px-6 sm:py-20 lg:py-[120px]">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-24">
              <div className="order-2 lg:order-1">
                <h2 className="text-section-title text-[var(--foreground)]">
                  Real Korean Beauty, Not Guesswork
                </h2>
                <p className="mt-6 text-body-lg leading-relaxed text-zinc-600 sm:mt-8">
                  This guide is based on the real routines used by Korean beauty pros and influencers—the same philosophy that made K-beauty famous worldwide.
                </p>
                <p className="mt-4 text-body leading-relaxed text-zinc-600">
                  Stop copying random TikTok steps. Get the system that actually creates glass skin.
                </p>
                <div className="mt-6">
                  <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                    Get the Free Blueprint
                  </button>
                </div>
              </div>
              <div className="relative order-1 lg:order-2">
                <div
                  className="flex aspect-[4/3] min-h-[200px] items-center justify-center rounded-[10px] border border-zinc-200/80 bg-[image:var(--gradient-flare-subtle)] sm:min-h-0"
                  aria-hidden
                >
                  <span className="text-6xl sm:text-8xl" role="img" aria-label="Cherry blossom">🌸</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="py-14 px-4 sm:px-6 sm:py-20 lg:py-[120px] bg-[var(--background)]">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16 lg:mb-20">
              <h2 className="text-section-title text-[var(--foreground)]">
                Imagine Your Skin in 2–4 Weeks
              </h2>
              <p className="mt-4 text-body-lg text-zinc-600 sm:mt-6">
                Not more products. Just the right routine. Here&apos;s what changes when you follow the Korean system.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-3 sm:gap-8">
              {[
                { title: "Clearer, calmer skin", desc: "Right order and ingredients reduce irritation and breakouts." },
                { title: "Stronger skin barrier", desc: "Hydration and layering protect and repair your barrier." },
                { title: "Natural glass-like glow", desc: "The dewy look comes from method, not magic." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[10px] border border-zinc-100 bg-white p-6 text-center transition-colors hover:border-[var(--flare-support-3)]/30 sm:p-8"
                >
                  <h3 className="text-card-title text-[var(--foreground)]">{item.title}</h3>
                  <p className="mt-2 text-body text-zinc-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 — Final CTA */}
        <section className="bg-white py-14 px-4 sm:px-6 sm:py-20 lg:py-[120px]">
          <div className="mx-auto max-w-[720px] text-center">
            <h2 className="text-section-title text-[var(--foreground)]">
              One Free Guide. The Korean Glass Skin System.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-zinc-600 sm:mt-6">
              Enter your email and get the blueprint instantly. No payment, no commitment—just the exact steps that work.
            </p>
            <div className="mt-6 sm:mt-8">
              <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                Send Me the Free Guide
              </button>
            </div>
            <p className="mt-4 text-body text-zinc-500">
              Free download · Instant access · Unsubscribe anytime
            </p>
          </div>
        </section>
      </main>
      <Footer />
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
