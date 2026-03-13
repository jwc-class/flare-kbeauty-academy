import Link from "next/link";

export default function AboutSection() {
  return (
    <section id="about" className="py-[120px] px-4 sm:px-6 bg-[var(--background)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="text-section-title text-[var(--foreground)]">
              Hey, we&apos;re K Beauty Academy.
            </h2>
            <p className="mt-8 text-body-lg text-zinc-600 leading-relaxed">
              Our mission is to help everyone learn the secrets of K-Beauty through repeatable systems.
            </p>
            <p className="mt-6 text-body text-zinc-600 leading-relaxed">
              K Beauty Academy was built on 14 years of beauty industry experience. We wanted to share everything about Korean beauty—from skincare to makeup—like open source.
            </p>
            <p className="mt-6 text-body text-zinc-600 leading-relaxed">
              We&apos;re here for dreamers, creators, artists, and everyone who loves beauty.
            </p>
            <Link
              href="/glass-skin"
              className="mt-10 inline-flex items-center gap-2 text-[var(--flare-support-1)] font-semibold text-body-lg hover:text-[var(--flare-support-2)] transition-colors"
            >
              Get the Free Guide
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="relative">
            <div
              className="aspect-[4/3] rounded-[10px] flex items-center justify-center bg-[image:var(--gradient-flare-subtle)] border border-zinc-200/80"
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
