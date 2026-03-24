"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import type { PublicLandingPage } from "@/lib/public-content";

const ctaButtonClass =
  "btn-cta min-h-[56px] w-full sm:w-auto sm:min-w-[200px] touch-manipulation text-body";

const FALLBACK = {
  badge: "Free Guide · No Sign-Up Hassle",
  headline: "High-Definition K-beauty Makeup\nthat Lasts for 12 Hours",
  subline:
    "For your health, seek good eating habits, and approach daily makeup in a way that considers your skin, just as you choose clothes with good materials.",
  subline2: "Start with makeup that revitalizes your skin, not covers it up.",
  cta: "Get the Free Blueprint →",
  tags: ["Natural Beauty", "Expert Know-how", "K-beauty makeup", "Long-lasting Adhesion"],
  disclaimer: "Free instant download. No spam. Unsubscribe anytime.",
};

type Props = {
  /** When set, hero and CTA text use DB content; otherwise fallback. */
  landingPage?: PublicLandingPage | null;
  /**
   * true면 히어로/서브카피/CTA는 항상 이 파일의 FALLBACK 사용 (DB hero 필드 무시).
   * 리드 모달의 landing_page_id 등은 그대로 `landingPage` 사용.
   */
  useCodeHeroCopy?: boolean;
};

export default function GlassSkinContent({ landingPage, useCodeHeroCopy = false }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const lp = landingPage;
  const isSkincareLP = lp?.slug === "k-glass-skincare";

  const splitHeroHeadline = (raw: string): { title: string; highlight: string | null } => {
    const normalized = raw.replace(/\r\n/g, "\n").trim();
    if (!normalized) return { title: "", highlight: null };

    // 1) Explicit line break from admin text has highest priority.
    if (normalized.includes("\n")) {
      const lines = normalized.split("\n").map((x) => x.trim()).filter(Boolean);
      return {
        title: lines[0] ?? normalized,
        highlight: lines.length > 1 ? lines.slice(1).join(" ") : null,
      };
    }

    // 2) Smart split for the key LP headline so wide screens render exactly two lines.
    const lowered = normalized.toLowerCase();
    const pivot = " that lasts for 12 hours";
    if (lowered.endsWith(pivot)) {
      const idx = lowered.lastIndexOf(pivot);
      const first = normalized.slice(0, idx).trim();
      const second = normalized.slice(idx + 1).trim(); // remove leading space before "that"
      if (first && second) return { title: first, highlight: second };
    }

    return { title: normalized, highlight: null };
  };

  let heroTitle: string;
  let heroTitleHighlight: string | null;
  let heroSubtitle: string;
  let heroSubline2: string;
  let ctaText: string;

  if (isSkincareLP) {
    heroTitle = "Korean Glass Skin Routine";
    heroTitleHighlight = "for a Younger-Looking Face";
    heroSubtitle =
      "A practical skincare routine to help your skin look clearer, smoother, and naturally plumper.";
    heroSubline2 =
      "No complicated 10-step chaos. Learn the order, hydration method, and barrier-focused habits that make skin look fresh and youthful.";
    ctaText = "Get the Free Skincare Guide →";
  } else if (useCodeHeroCopy) {
    const split = splitHeroHeadline(FALLBACK.headline);
    heroTitle = split.title;
    heroTitleHighlight = split.highlight;
    heroSubtitle = FALLBACK.subline;
    heroSubline2 = FALLBACK.subline2;
    ctaText = FALLBACK.cta;
  } else {
    const split = splitHeroHeadline(lp?.hero_title?.trim() || FALLBACK.headline);
    heroTitle = split.title;
    heroTitleHighlight = split.highlight;
    heroSubtitle = lp?.hero_subtitle?.trim() || FALLBACK.subline;
    heroSubline2 = FALLBACK.subline2;
    ctaText = lp?.cta_text?.trim() || FALLBACK.cta;
  }
  const badge = isSkincareLP ? "Free Skincare Guide · Instant Access" : FALLBACK.badge;
  const tags = isSkincareLP
    ? ["Glass Skin Routine", "Barrier Care", "Hydration Order", "Youthful Glow"]
    : FALLBACK.tags;
  const disclaimer = FALLBACK.disclaimer;
  const heroImageSrc =
    lp?.thumbnail_url?.trim()
      ? lp.thumbnail_url.trim()
      : lp?.slug === "k-glass-skincare"
      ? "/images/k-glass-skincare-thumbnail.png"
      : "/images/glass-skin-before-after.png";
  const heroImageAlt =
    lp?.thumbnail_url?.trim()
      ? `${lp?.title || "Landing"} thumbnail`
      : lp?.slug === "k-glass-skincare"
      ? "K-glass skincare landing hero thumbnail"
      : "Before and after: natural skin compared to a dewy glass-skin makeup look";
  const problemTitle = isSkincareLP
    ? "Why Your Skin Still Looks Tired"
    : "Why is something missing, even after using K-beauty products and following tutorials?";
  const problemLead = isSkincareLP
    ? "Great skin is not about buying more products."
    : "The best makeup isn&apos;t about using famous or expensive cosmetics.";
  const problemBullets = isSkincareLP
    ? [
        "Wrong order can block absorption and waste expensive skincare.",
        "Over-exfoliation can damage your barrier and dull your glow.",
        "Inconsistent hydration habits make skin look flat and tired.",
      ]
    : [
        "Not even makeup with high-end brushes.",
        "Not a vanity full of cosmetics, either.",
        "It starts with knowing your own face.",
      ];
  const problemOutro = isSkincareLP
    ? "When you match product order, hydration timing, and barrier care, your skin can look smoother, bouncier, and more youthful."
    : "Knowing your facial structure and skin type allows you to apply makeup that maximizes your strengths and compensates for weaknesses.";
  const problemCta = isSkincareLP ? "Get the Free Skincare Diagnosis" : "Get the Free Diagnosis";
  const guideTitle = isSkincareLP ? "Contents of the Free Glass Skin Guide" : "Contents of the Free Guide";
  const guideSubtitle = isSkincareLP
    ? "A clear, beginner-friendly skincare system focused on youthful glass skin."
    : "No fluff. The same system Korean beauty experts and influencers actually use—step by step.";
  const guideBullets = isSkincareLP
    ? [
        "The exact AM/PM skincare order for youthful-looking glass skin",
        "How to choose hydrating layers without clogging pores",
        "Barrier-repair habits that reduce dullness and rough texture",
        "Weekly routine structure for consistent visible improvement",
        "Common mistakes that make skin look older and how to fix them",
      ]
    : [
        "The Korean layering method (and why order matters more than products)",
        "The exact 7-step order Korean experts use",
        "Key ingredients that build glass skin (and what to avoid)",
        "The hydration technique that creates the glow",
        "The biggest mistakes foreigners make—and how to fix them",
      ];
  const guideCta = isSkincareLP ? "Download Your Free Skincare Guide" : "Download Your Free Guide";
  const authorityTitle = isSkincareLP ? "Real Korean Skincare, Not Guesswork" : "Real Korean Beauty, Not Guesswork";
  const authorityP1 = isSkincareLP
    ? "This guide is based on practical Korean skincare principles used to maintain clear, hydrated, youthful-looking skin."
    : "This guide is based on the real routines used by Korean beauty pros and influencers—the same philosophy that made K-beauty famous worldwide.";
  const authorityP2 = isSkincareLP
    ? "Stop chasing random viral tips. Follow one proven routine that supports long-term skin health and natural glow."
    : "Stop copying random TikTok steps. Get the system that actually creates glass skin.";
  const authorityCta = isSkincareLP ? "Get the Free Skincare Blueprint" : "Get the Free Blueprint";
  const outcomesTitle = isSkincareLP ? "Imagine Your Skin in 2–4 Weeks" : "Imagine Your Skin in 2–4 Weeks";
  const outcomesSubtitle = isSkincareLP
    ? "Not more products. Just the right skincare order and consistency."
    : "Not more products. Just the right routine. Here&apos;s what changes when you follow the Korean system.";
  const outcomes = isSkincareLP
    ? [
        { title: "Smoother skin texture", desc: "Better hydration balance improves softness and skin bounce." },
        { title: "Brighter, clearer tone", desc: "Barrier-first care helps reduce dullness and unevenness." },
        { title: "Healthy youthful glow", desc: "A consistent routine creates natural glass-like radiance." },
      ]
    : [
        { title: "Clearer, calmer skin", desc: "Right order and ingredients reduce irritation and breakouts." },
        { title: "Stronger skin barrier", desc: "Hydration and layering protect and repair your barrier." },
        { title: "Natural glass-like glow", desc: "The dewy look comes from method, not magic." },
      ];
  const finalTitle = isSkincareLP
    ? "One Free Guide. Your Glass Skin Skincare System."
    : "One Free Guide. The Korean Glass Skin System.";
  const finalSubtitle = isSkincareLP
    ? "Enter your email and get the skincare blueprint instantly. No payment, no commitment."
    : "Enter your email and get the blueprint instantly. No payment, no commitment—just the exact steps that work.";
  const finalCta = isSkincareLP ? "Send Me the Free Skincare Guide" : "Send Me the Free Guide";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section className="relative bg-[image:var(--gradient-flare-subtle)] px-4 pb-32 pt-40 sm:px-8 sm:pb-36 sm:pt-44">
          <div className="mx-auto max-w-[900px] text-center">
            <div className="relative mb-10 w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] shadow-soft sm:mb-12">
              <Image
                src={heroImageSrc}
                alt={heroImageAlt}
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
                priority
                sizes="(max-width: 900px) 100vw, 900px"
                unoptimized={heroImageSrc.startsWith("http")}
              />
            </div>
            <p className="text-[var(--muted)] font-semibold uppercase tracking-[0.06em] text-[15px]">
              {badge}
            </p>
            <h1
              className="font-serif-heading mx-auto mt-4 flex w-full max-w-[900px] flex-col items-center text-center font-semibold leading-[1.12] text-[var(--foreground)] sm:mt-5 lg:gap-1 lg:leading-[1.06]"
              style={{
                fontSize: "clamp(1.625rem, 2.75vw + 0.65rem, 3.35rem)",
                letterSpacing: "0.02em",
              }}
            >
              <span className="max-w-full px-1 lg:whitespace-nowrap">{heroTitle}</span>
              {heroTitleHighlight && (
                <span className="max-w-full bg-[image:var(--gradient-flare)] bg-clip-text px-1 text-transparent lg:whitespace-nowrap">
                  {heroTitleHighlight}
                </span>
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
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--background-pastel-pink)]/65 px-3 py-1.5 text-body text-[var(--foreground-soft)] shadow-soft-sm"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-5 text-body text-[var(--muted)]">{disclaimer}</p>
          </div>
        </section>

        {/* Section 2 — Why something still feels missing (two-column + facial mapping visual) */}
        <section
          className="bg-[var(--background-alt)] py-28 px-4 md:py-36 sm:px-8"
          aria-labelledby="glass-skin-why-missing-heading"
        >
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-20">
              <div>
                <h2
                  id="glass-skin-why-missing-heading"
                  className="font-serif-heading font-semibold leading-[1.15] tracking-[0.02em] text-[var(--foreground)]"
                  style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.65rem)" }}
                >
                  {problemTitle}
                </h2>
                <p className="mt-8 text-body-lg leading-relaxed text-[var(--foreground-soft)]">
                  {problemLead}
                </p>
                <ul className="mt-6 space-y-3.5 text-body-lg leading-relaxed text-[var(--foreground-soft)]">
                  {problemBullets.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span
                        className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#0d9488]"
                        aria-hidden
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 text-body-lg leading-relaxed text-[var(--foreground-soft)]">
                  {problemOutro}
                </p>
                <div className="mt-10">
                  <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                    {problemCta}
                  </button>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-lg shadow-zinc-900/10 ring-1 ring-black/5">
                  <Image
                    src="/images/glass-skin-facial-mapping.png"
                    alt="Close-up portrait with white-line facial mapping overlay: frontal process, orbit, nasion, zygomatic arch, maxilla, and mandible angle"
                    width={960}
                    height={960}
                    className="h-auto w-full object-cover"
                    sizes="(max-width: 1024px) min(100vw, 32rem), 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — Contents of the Free Guide (book mockup + list) */}
        <section className="overflow-hidden bg-gradient-to-br from-white via-[var(--surface-blush)] to-[color-mix(in_srgb,var(--brand-soft-2)_35%,white)] py-20 px-4 md:py-24 sm:px-8">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-center font-sans text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-[var(--foreground)]">
              {guideTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-body-lg leading-relaxed text-[var(--muted)]">
              {guideSubtitle}
            </p>

            <div className="mt-10 grid items-center gap-8 lg:mt-12 lg:grid-cols-2 lg:gap-10">
              {/* Book cover — left on desktop, top on mobile */}
              <div className="flex justify-center lg:justify-end lg:pr-4">
                <div
                  className="relative w-full max-w-[min(100%,420px)] [perspective:1200px]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="rotate-[2deg] drop-shadow-[0_28px_60px_rgba(60,40,50,0.18)] transition-transform duration-300 hover:rotate-[1deg]">
                    <Image
                      src={isSkincareLP ? "/images/k-glass-skincare-thumbnail.png" : "/images/glass-skin-guide-book-cover.png"}
                      alt={isSkincareLP ? "K-glass skincare guide cover" : "The Ultimate K-Beauty Makeup Guide — Free Starter Pack, 3D book mockup"}
                      width={640}
                      height={800}
                      className="h-auto w-full rounded-lg object-contain"
                      sizes="(max-width: 1024px) 85vw, 420px"
                    />
                  </div>
                </div>
              </div>

              <div className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
                <ul className="list-outside list-disc space-y-4 pl-5 text-left text-body leading-[1.75] text-[var(--foreground-soft)] marker:text-[var(--foreground)] sm:space-y-5 sm:pl-6 sm:text-[1.05rem]">
                  {guideBullets.map((item) => (
                    <li key={item} className="pl-1">
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 sm:mt-10">
                  <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                    {guideCta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 — Authority */}
        <section className="bg-[var(--background-pastel-peach)] py-28 px-4 md:py-36 sm:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-28">
              <div className="order-2 lg:order-1">
                <h2 className="text-section-title text-[var(--foreground)]">
                  {authorityTitle}
                </h2>
                <p className="mt-8 text-body-lg leading-relaxed text-[var(--foreground-soft)] sm:mt-10">
                  {authorityP1}
                </p>
                <p className="mt-6 text-body leading-relaxed text-[var(--foreground-soft)]">
                  {authorityP2}
                </p>
                <div className="mt-10">
                  <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                    {authorityCta}
                  </button>
                </div>
              </div>
              <div className="relative order-1 lg:order-2">
                <div
                  className="flex aspect-[4/3] min-h-[200px] items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[image:var(--gradient-flare-subtle)] shadow-soft sm:min-h-0"
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
                {outcomesTitle}
              </h2>
              <p className="mt-8 text-body-lg text-[var(--muted)]">
                {outcomesSubtitle}
              </p>
            </div>
            <div className="grid gap-10 sm:grid-cols-3">
              {outcomes.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] p-8 text-center transition-all duration-300 ease-in-out shadow-soft-sm hover:border-[var(--border-hover)] hover:shadow-soft"
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
              {finalTitle}
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-body-lg text-[var(--muted)] sm:mt-10">
              {finalSubtitle}
            </p>
            <div className="mt-14">
              <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                {finalCta}
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
        source={isSkincareLP ? "k-glass-skincare" : "glass-skin"}
        successRedirect="/thank-you"
        landing_page_id={lp?.id ?? undefined}
      />
    </div>
  );
}
