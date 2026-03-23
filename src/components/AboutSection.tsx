import Link from "next/link";

export default function AboutSection() {
  return (
    <section id="about" className="py-28 md:py-36 px-4 sm:px-8 bg-[var(--background-pastel-lavender)]/50">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-28 items-center">
          <div>
            <h2 className="text-section-title text-[var(--foreground)]">
              Hey, we&apos;re K Beauty Academy.
            </h2>
            <p className="mt-10 text-body-lg text-[var(--foreground-soft)] leading-relaxed">
              Our mission is to help everyone learn the secrets of K-Beauty through repeatable systems.
            </p>
            <p className="mt-8 text-body text-[var(--foreground-soft)] leading-relaxed">
              K Beauty Academy was built on 14 years of beauty industry experience. We wanted to share everything about Korean beauty—from skincare to makeup—like open source.
            </p>
            <p className="mt-8 text-body text-[var(--foreground-soft)] leading-relaxed">
              We&apos;re here for dreamers, creators, artists, and everyone who loves beauty.
            </p>
            <Link
              href="/glass-skin"
              className="btn-cta mt-12 inline-flex gap-2 text-body-lg"
            >
              Get the Free Guide
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="relative">
            <div
              className="aspect-[4/3] rounded-2xl flex items-center justify-center bg-[image:var(--gradient-flare-subtle)] border border-[#f0ebe8] shadow-soft"
              aria-hidden
            >
              <span className="text-8xl">🌸</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
