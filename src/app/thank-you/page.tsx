import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PAYPAL_URL = "https://www.paypal.com/ncp/payment/6PLRM2S8H2MEN";

export const metadata = {
  title: "Thank You | K Beauty Academy",
  description: "Your free guide is on the way. Discover the full K-Beauty Glass Skin Masterclass.",
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>
        {/* SECTION 1 — CONFIRMATION HERO */}
        <section className="pt-[140px] pb-[80px] px-4 sm:px-6">
          <div className="max-w-[720px] mx-auto text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[10px] bg-[var(--flare-support-3)]/20 text-4xl mb-8">
              ✓
            </div>
            <h1 className="text-section-title text-[var(--foreground)] font-bold">
              Your guide is on the way!
            </h1>
            <p className="mt-6 text-body-lg text-zinc-600 leading-relaxed">
              We&apos;ve sent &quot;The Korean Glass Skin Blueprint&quot; to your email.
            </p>
            <p className="mt-4 text-body text-zinc-600">
              Check your inbox to download the guide.
            </p>
            <p className="mt-2 text-body text-zinc-500">
              If you don&apos;t see it within a minute, check your spam folder.
            </p>
            <p className="mt-10 text-body text-[var(--muted)]">
              While you&apos;re here, there&apos;s one more thing that may help you.
            </p>
            <a
              href={PAYPAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-8 py-4 font-semibold text-body-lg text-white hover:bg-[var(--flare-support-2)] transition-colors min-h-[56px]"
            >
              Get the Full Masterclass — $199
            </a>
          </div>
        </section>

        {/* SECTION 2 — BRIDGE (FREE GUIDE → COURSE) */}
        <section className="py-[80px] px-4 sm:px-6 bg-white">
          <div className="max-w-[720px] mx-auto text-center">
            <h2 className="text-section-title text-[var(--foreground)] font-bold">
              Want the full Korean skincare routine?
            </h2>
            <p className="mt-6 text-body-lg text-zinc-600 leading-relaxed">
              The free guide gives you the blueprint.
              <br />
              But if you want to see exactly how Korean beauty experts apply the routine step-by-step, the full video training shows you everything.
            </p>
            <a
              href={PAYPAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-8 py-4 font-semibold text-body-lg text-white hover:bg-[var(--flare-support-2)] transition-colors min-h-[56px]"
            >
              Start the Course — $199
            </a>
          </div>
        </section>

        {/* SECTION 3 — COURSE INTRODUCTION */}
        <section className="py-[80px] px-4 sm:px-6 bg-[var(--background)]">
          <div className="max-w-[720px] mx-auto">
            <h2 className="text-section-title text-[var(--foreground)] font-bold text-center">
              K-Beauty Glass Skin Masterclass
            </h2>
            <p className="mt-6 text-body-lg text-zinc-600 leading-relaxed text-center">
              Learn the complete Korean skincare routine used to create clear, glowing, glass-like skin.
              You&apos;ll see exactly how Korean beauty experts structure their routines and why it works.
            </p>
            <ul className="mt-10 space-y-4 max-w-[560px] mx-auto">
              {[
                "The exact Korean skincare order",
                "How to layer products properly",
                "The hydration technique behind glass skin",
                "The biggest skincare mistakes foreigners make",
                "The real philosophy behind Korean beauty",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-body text-zinc-700">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--flare-support-1)]" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 text-center">
              <a
                href={PAYPAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-8 py-4 font-semibold text-body-lg text-white hover:bg-[var(--flare-support-2)] transition-colors min-h-[56px]"
              >
                Enroll with PayPal — $199
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 4 — AUTHORITY */}
        <section className="py-[80px] px-4 sm:px-6 bg-white">
          <div className="max-w-[720px] mx-auto text-center">
            <h2 className="text-section-title text-[var(--foreground)] font-bold">
              Learn from real Korean beauty experts
            </h2>
            <p className="mt-6 text-body-lg text-zinc-600 leading-relaxed">
              This course features real Korean beauty professionals sharing the routines and techniques used in Korea.
              Instead of guessing which products to try, you&apos;ll understand the actual system behind K-beauty.
            </p>
            <a
              href={PAYPAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-8 py-4 font-semibold text-body-lg text-white hover:bg-[var(--flare-support-2)] transition-colors min-h-[56px]"
            >
              Get Instant Access — $199
            </a>
          </div>
        </section>

        {/* SECTION 5 — COURSE OFFER CARD */}
        <section className="py-[80px] px-4 sm:px-6 bg-[var(--background)]">
          <div className="max-w-[480px] mx-auto">
            <div className="rounded-[10px] bg-white p-8 sm:p-10 border-2 border-[var(--flare-support-1)]/30 shadow-lg text-center">
              <h2 className="text-card-title text-[var(--foreground)] font-bold">
                K-Beauty Glass Skin Masterclass
              </h2>
              <p className="mt-6 text-4xl font-bold text-[var(--foreground)]">
                $199
              </p>
              <p className="mt-2 text-body text-zinc-600">
                One-time payment. Instant access.
              </p>
              <a
                href={PAYPAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full sm:w-auto items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-8 py-4 font-semibold text-body-lg text-white hover:bg-[var(--flare-support-2)] transition-colors min-h-[56px]"
              >
                Start the Course
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 6 — RISK REDUCTION */}
        <section className="py-[80px] px-4 sm:px-6 bg-white">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="text-body-lg text-zinc-700 leading-relaxed">
              No complicated routines.
              <br />
              No guessing which products to use.
              <br />
              Just the exact Korean skincare method explained step by step.
            </p>
            <a
              href={PAYPAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-8 py-4 font-semibold text-body-lg text-white hover:bg-[var(--flare-support-2)] transition-colors min-h-[56px]"
            >
              Start the Masterclass
            </a>
          </div>
        </section>

        {/* SECTION 7 — FINAL CTA */}
        <section className="py-[100px] px-4 sm:px-6 bg-[var(--background)]">
          <div className="max-w-[640px] mx-auto text-center">
            <h2 className="text-section-title text-[var(--foreground)] font-bold">
              Start Your Korean Skincare Journey
            </h2>
            <p className="mt-6 text-body-lg text-zinc-600 leading-relaxed">
              If you want to truly understand how Korean skincare works, start with the full masterclass.
            </p>
            <a
              href={PAYPAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-8 py-4 font-semibold text-body-lg text-white hover:bg-[var(--flare-support-2)] transition-colors min-h-[56px]"
            >
              Enroll with PayPal
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
