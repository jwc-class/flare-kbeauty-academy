import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedOfferPageBySlug } from "@/lib/public-content";

type Props = { params: Promise<{ slug: string }> };

function formatPrice(currency: string, price: number): string {
  const n = Number(price);
  if (Number.isNaN(n)) return "$199";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const offer = await getPublishedOfferPageBySlug(slug);
  if (!offer) {
    return {
      title: "Offer | K Beauty Academy",
    };
  }
  return {
    title: offer.title ? `${offer.title} | K Beauty Academy` : "Offer | K Beauty Academy",
    description: offer.subheadline?.slice(0, 160) || offer.headline?.slice(0, 160) || undefined,
  };
}

export default async function OfferPageBySlug({ params }: Props) {
  const { slug } = await params;
  const offer = await getPublishedOfferPageBySlug(slug);
  if (!offer) notFound();

  const course = offer.course ?? null;
  const ctaHref = course?.slug ? `/courses/${course.slug}` : "/thank-you";
  const ctaText = offer.cta_text?.trim() || (course?.title ? `See ${course.title}` : "See the Full Masterclass Offer");
  const coursePrice = course ? formatPrice(course.currency, course.price) : "$199";
  const headline = offer.headline?.trim() || "Your guide is on the way";
  const subheadline =
    offer.subheadline?.trim() ||
    "We've sent your free guide. If you want the full step-by-step training, continue to the full masterclass offer.";
  const body =
    offer.body?.trim() ||
    "The free guide gives you the blueprint. The full masterclass shows you exactly how Korean beauty experts apply the routine step by step-on video.";
  const heroImage = offer.thumbnail_url || course?.thumbnail_url || null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>
        {/* SECTION 1 — Hero */}
        <section className="relative px-4 pb-[120px] pt-[160px] sm:px-6">
          <div className="mx-auto max-w-[900px] text-center">
            {heroImage && (
              <div className="relative mb-10 w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] shadow-soft sm:mb-12">
                <Image
                  src={heroImage}
                  alt={`${offer.title || "Offer"} thumbnail`}
                  width={1600}
                  height={900}
                  className="h-auto w-full object-cover"
                  priority
                  sizes="(max-width: 900px) 100vw, 900px"
                  unoptimized={heroImage.startsWith("http")}
                />
              </div>
            )}
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[10px] bg-[var(--flare-support-3)]/20 text-4xl mb-8">
              ✓
            </div>
            <h1
              className="mx-auto font-bold leading-[1.05] text-[var(--foreground)]"
              style={{ fontSize: "clamp(2.5rem, 8vw, 96px)", fontWeight: 800 }}
            >
              {headline}
            </h1>
            <p
              className="mx-auto mt-6 text-zinc-600"
              style={{
                fontSize: "clamp(1.125rem, 2vw, 22px)",
                maxWidth: "650px",
                lineHeight: 1.5,
              }}
            >
              {subheadline}
            </p>
            <p
              className="mx-auto mt-6 max-w-xl text-zinc-500"
              style={{ fontSize: "1rem", lineHeight: 1.6 }}
            >
              {body}
            </p>
            <div className="mt-8">
              <Link href={ctaHref} className="btn-cta">
                {ctaText}
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
              The free guide gives you the blueprint. The full masterclass shows you exactly how Korean beauty experts apply the routine step by step-on video.
            </p>
            <div className="mt-8">
              <Link href={ctaHref} className="btn-cta">
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
                {course?.short_description ||
                  "Learn the complete Korean skincare routine for clear, glowing, glass-like skin-and why Korean experts structure their routines the way they do."}
              </p>
              {course?.instructor_name && (
                <p className="mt-3 text-body text-zinc-500">Instructor: {course.instructor_name}</p>
              )}
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
              <Link href={ctaHref} className="btn-cta py-4">
                Enroll Now - {coursePrice}
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
              <Link href={ctaHref} className="btn-cta py-4">
                Get the Full {course?.title ? "Course" : "Masterclass"}
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 5 */}
        <section className="py-[120px] px-4 sm:px-6 bg-[var(--background)]">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="text-body-lg text-zinc-600 leading-relaxed">
              No complicated routines. No guessing which products to use. Just the exact Korean skincare method explained step by step.
            </p>
          </div>
        </section>

        {/* SECTION 6 */}
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
                href={ctaHref}
                className="btn-cta w-full min-h-[56px] sm:w-auto text-body-lg"
              >
                Enroll with PayPal - {coursePrice}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
