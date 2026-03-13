"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";

export default function GlassSkinPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const ctaButtonClass =
    "inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--flare-support-2)] min-h-[48px]";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>
        {/* Section 1 — Hero (메인 Hero와 동일한 스케일·구성) */}
        <section className="relative px-4 pb-[120px] pt-[160px] sm:px-6">
          <div className="mx-auto max-w-[900px] text-center">
            <p
              className="text-[var(--flare-support-1)] font-semibold uppercase tracking-wide text-body"
              style={{ fontSize: "0.9375rem" }}
            >
              Free Guide
            </p>
            <h1
              className="mx-auto mt-4 font-bold leading-[1.05] text-[var(--foreground)]"
              style={{ fontSize: "clamp(2.5rem, 8vw, 96px)", fontWeight: 800 }}
            >
              Get Korean{" "}
              <span className="bg-[image:var(--gradient-flare)] bg-clip-text text-transparent">
                Glass Skin
              </span>
            </h1>
            <p
              className="mx-auto mt-6 text-zinc-600"
              style={{
                fontSize: "clamp(1.125rem, 2vw, 22px)",
                maxWidth: "650px",
                lineHeight: 1.5,
              }}
            >
              Discover the exact skincare routine used by Korean beauty influencers to achieve clear, glowing, glass-like skin.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-zinc-500" style={{ fontSize: "1rem", lineHeight: 1.6 }}>
              Most people use the wrong skincare order, the wrong ingredients, and too many products. This free guide shows you the Korean skincare system that actually works.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className={ctaButtonClass}
                style={{ fontWeight: 600 }}
              >
                Get the Free Guide
              </button>
            </div>
            <div className="mt-8 flex justify-center">
              <div className="flex items-center">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 shrink-0 rounded-[10px] border-2 border-white bg-zinc-200 first:ml-0 last:mr-0"
                    style={{
                      marginLeft: i === 1 ? 0 : -8,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
            <p className="mx-auto mt-4 text-zinc-500" style={{ fontSize: "15px", lineHeight: 1.5 }}>
              Free instant download. No spam.
            </p>
            <div className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {["Korean skincare routine", "Glass skin steps", "Hydration method", "Expert tips"].map((label) => (
                <span key={label} className="text-zinc-400" style={{ fontSize: "15px", fontWeight: 500 }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2 — Problem (메인 ProblemSection 카드 그리드 스타일) */}
        <section className="bg-white py-[120px] px-4 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-20 max-w-3xl text-center">
              <h2 className="text-section-title text-[var(--foreground)]">
                Why most skincare routines fail
              </h2>
              <p className="mt-6 text-body-lg text-zinc-600">
                Many people try dozens of products but never achieve the glowing skin they want. That&apos;s because Korean skincare follows a completely different philosophy.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Wrong product order",
                "Too many unnecessary products",
                "Ingredients that damage your skin barrier",
                "Skipping the most important hydration step",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[10px] border border-zinc-100 bg-[var(--background)] p-8 transition-colors hover:border-[var(--flare-support-3)]/30"
                >
                  <p className="text-body text-zinc-600">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-center text-body font-medium text-zinc-700">
              The Korean Glass Skin Blueprint explains the exact routine Koreans actually use.
            </p>
          </div>
        </section>

        {/* Section 3 — Solution (메인 섹션 타이포·간격) */}
        <section className="py-[120px] px-4 sm:px-6 bg-[var(--background)]">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="text-section-title text-[var(--foreground)]">
                Inside the Korean Glass Skin Blueprint
              </h2>
              <p className="mt-6 text-body-lg text-zinc-600">
                This guide breaks down the exact Korean skincare system step by step.
              </p>
            </div>
            <div className="mx-auto max-w-2xl">
              <ul className="space-y-5">
                {[
                  "The Korean skincare layering method",
                  "The exact order Korean beauty experts use",
                  "The key ingredients behind glass skin",
                  "The hydration technique that creates glow",
                  "The biggest skincare mistakes foreigners make",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-body text-zinc-600">
                    <span className="mt-0.5 text-[var(--flare-support-1)]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-14 text-center">
              <button type="button" onClick={() => setModalOpen(true)} className={ctaButtonClass}>
                Get the Free Guide
              </button>
            </div>
          </div>
        </section>

        {/* Section 4 — Authority (메인 AboutSection 2열 레이아웃) */}
        <section className="bg-white py-[120px] px-4 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
              <div>
                <h2 className="text-section-title text-[var(--foreground)]">
                  Learn real Korean beauty secrets
                </h2>
                <p className="mt-8 text-body-lg leading-relaxed text-zinc-600">
                  This guide is based on real Korean beauty routines used by influencers and professionals in Korea.
                </p>
                <p className="mt-6 text-body leading-relaxed text-zinc-600">
                  You&apos;ll learn the same skincare philosophy that helped make Korean beauty famous worldwide.
                </p>
              </div>
              <div className="relative">
                <div
                  className="flex aspect-[4/3] items-center justify-center rounded-[10px] border border-zinc-200/80 bg-[image:var(--gradient-flare-subtle)]"
                  aria-hidden
                >
                  <span className="text-8xl">🌸</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — Future benefit (카드 3열) */}
        <section className="py-[120px] px-4 sm:px-6 bg-[var(--background)]">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="text-section-title text-[var(--foreground)]">
                Imagine waking up with glowing skin
              </h2>
              <p className="mt-6 text-body-lg text-zinc-600">
                Instead of trying random products and guessing what works, you&apos;ll finally understand the Korean skincare system.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {["Clearer skin", "Healthier skin barrier", "Natural glass-like glow"].map((item) => (
                <div
                  key={item}
                  className="rounded-[10px] border border-zinc-100 bg-white p-8 text-center transition-colors hover:border-[var(--flare-support-3)]/30"
                >
                  <h3 className="text-card-title text-[var(--foreground)]">{item}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 — Final CTA (Hero CTA 블록과 동일한 톤) */}
        <section className="bg-white py-[120px] px-4 sm:px-6">
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="text-section-title text-[var(--foreground)]">
              Get the Korean Glass Skin Blueprint
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-body-lg text-zinc-600">
              Enter your details and receive the guide instantly.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className={ctaButtonClass}
                style={{ fontWeight: 600 }}
              >
                Get the Free Guide
              </button>
            </div>
            <p className="mt-4 text-body text-zinc-500">Free download. Instant access.</p>
          </div>
        </section>
      </main>
      <Footer />
      <LeadCaptureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        source="glass-skin"
        successRedirect="/thank-you"
      />
    </div>
  );
}
