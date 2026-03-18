import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedCourseForThankYou } from "@/lib/public-content";

export const metadata = {
  title: "Thank You | K Beauty Academy",
  description: "Your free guide is on the way. Discover the full K-Beauty Glass Skin Masterclass.",
};

function formatPrice(currency: string, price: number): string {
  const n = Number(price);
  if (Number.isNaN(n)) return "$199";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default async function ThankYouPage() {
  const course = await getPublishedCourseForThankYou();
  const courseHref = course?.slug ? `/courses/${course.slug}` : "/glass-skin-masterclass";
  const courseLabel = course?.title ? `See ${course.title}` : "See the Full Masterclass Offer";
  const coursePrice = course ? formatPrice(course.currency, course.price) : "$199";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>
        {/* SECTION 1 — Hero: 가이드 확인 + 상단 CTA → Course 페이지 */}
        <section className="relative px-4 pb-[120px] pt-[160px] sm:px-6">
          <div className="mx-auto max-w-[900px] text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[10px] bg-[var(--flare-support-3)]/20 text-4xl mb-8">
              ✓
            </div>
            <h1
              className="mx-auto font-bold leading-[1.05] text-[var(--foreground)]"
              style={{ fontSize: "clamp(2.5rem, 8vw, 96px)", fontWeight: 800 }}
            >
              Your guide is{" "}
              <span className="bg-[image:var(--gradient-flare)] bg-clip-text text-transparent">
                on the way
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
              We&apos;ve sent &quot;The Korean Glass Skin Blueprint&quot; to your email. Check your inbox to download it—if you don&apos;t see it in a minute, check spam.
            </p>
            <p
              className="mx-auto mt-6 max-w-xl text-zinc-500"
              style={{ fontSize: "1rem", lineHeight: 1.6 }}
            >
              While you&apos;re here: if you want the full step-by-step video training (not just the guide), we have one offer for you.
            </p>
            <div className="mt-8">
              <Link
                href={courseHref}
                className="inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--flare-support-2)]"
                style={{ fontWeight: 600 }}
              >
                {courseLabel}
              </Link>
            </div>
            <p
              className="mx-auto mt-4 text-zinc-500"
              style={{ fontSize: "15px", lineHeight: 1.5 }}
            >
              Free guide in your inbox · Full course on the next page
            </p>
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="py-[120px] px-4 sm:px-6 bg-white">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-section-title text-[var(--foreground)]">
              Want the full{" "}
              <span className="bg-[image:var(--gradient-flare)] bg-clip-text text-transparent">
                Korean skincare
              </span>{" "}
              routine?
            </h2>
            <p className="mt-6 text-body-lg text-zinc-600">
              The free guide gives you the blueprint. The full masterclass shows you exactly how Korean beauty experts apply the routine step by step—on video.
            </p>
            <div className="mt-8">
              <Link
                href={courseHref}
                className="inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--flare-support-2)]"
                style={{ fontWeight: 600 }}
              >
                Go to {course?.title || "Glass Skin Masterclass"}
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="py-[120px] px-4 sm:px-6 bg-[var(--background)]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-section-title text-[var(--foreground)]">
                {course?.title ? (
                  <>
                    <span className="bg-[image:var(--gradient-flare)] bg-clip-text text-transparent">{course.title}</span>
                  </>
                ) : (
                  <>
                    K-Beauty{" "}
                    <span className="bg-[image:var(--gradient-flare)] bg-clip-text text-transparent">
                      Glass Skin
                    </span>{" "}
                    Masterclass
                  </>
                )}
              </h2>
              <p className="mt-6 text-body-lg text-zinc-600">
                Learn the complete Korean skincare routine for clear, glowing, glass-like skin—and why Korean experts structure their routines the way they do.
              </p>
            </div>
            <div className="mx-auto max-w-2xl">
              <ul className="space-y-5">
                {[
                  "The exact Korean skincare order",
                  "How to layer products properly",
                  "The hydration technique behind glass skin",
                  "The biggest skincare mistakes foreigners make",
                  "The real philosophy behind Korean beauty",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-body text-zinc-600">
                    <span className="text-[var(--flare-support-1)]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-12 text-center">
              <Link
                href={courseHref}
                className="inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-8 py-4 font-semibold text-body text-white hover:bg-[var(--flare-support-2)] transition-colors"
              >
                Enroll Now — {coursePrice}
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 4 */}
        <section className="py-[120px] px-4 sm:px-6 bg-white">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-section-title text-[var(--foreground)]">
              Learn from real Korean beauty experts
            </h2>
            <p className="mt-8 text-body-lg text-zinc-600 leading-relaxed">
              The course features real Korean beauty professionals sharing the routines and techniques used in Korea. You&apos;ll understand the system behind K-beauty instead of guessing which products to try.
            </p>
            <div className="mt-8">
              <Link
                href={courseHref}
                className="inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-8 py-4 font-semibold text-body text-white hover:bg-[var(--flare-support-2)] transition-colors"
              >
                Get the Full {course?.title ? "Course" : "Masterclass"}
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 5 — 리스크 감소 */}
        <section className="py-[120px] px-4 sm:px-6 bg-[var(--background)]">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="text-body-lg text-zinc-600 leading-relaxed">
              No complicated routines. No guessing which products to use. Just the exact Korean skincare method explained step by step.
            </p>
          </div>
        </section>

        {/* SECTION 6 — 마무리 + 하단 CTA */}
        <section className="py-[120px] px-4 sm:px-6 bg-white">
          <div className="max-w-[560px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-section-title text-[var(--foreground)]">
                Start your Korean skincare journey
              </h2>
              <p className="mt-6 text-body-lg text-zinc-600">
                If you want to truly understand how Korean skincare works, the full masterclass is the next step.
              </p>
            </div>
            <div className="text-center">
              <Link
                href={courseHref}
                className="inline-flex items-center justify-center w-full sm:w-auto py-4 px-8 rounded-[10px] bg-[var(--flare-support-1)] text-white font-semibold text-body-lg hover:bg-[var(--flare-support-2)] transition-colors min-h-[56px]"
              >
                Enroll with PayPal — {coursePrice}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
