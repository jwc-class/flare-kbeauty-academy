import { Suspense } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutGate from "@/components/CheckoutGate";
import { getPublishedCourseBySlug } from "@/lib/public-content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const DEFAULT_IMAGE = "https://placehold.co/800x600/FAF9F6/1a1a1a?text=Course";
const FALLBACK_INCLUDED = [
  "Step-by-step video lessons",
  "Lifetime access to materials",
  "Expert instruction",
];

type Props = { params: Promise<{ slug: string }> };

function formatPrice(currency: string, price: number): string {
  const n = Number(price);
  if (Number.isNaN(n)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);
  if (!course) return { title: "Course | K Beauty Academy" };
  return {
    title: course.title ? `${course.title} | K Beauty Academy` : "K Beauty Academy",
    description: course.short_description?.slice(0, 160) || undefined,
  };
}

export default async function PublicCourseBySlug({ params }: Props) {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const title = course.title || "Course";
  const priceFormatted = formatPrice(course.currency, course.price);
  const thumbnailUrl = course.thumbnail_url || DEFAULT_IMAGE;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
              <div className="space-y-6">
                <div className="aspect-video w-full overflow-hidden rounded-[10px] border border-zinc-200 bg-[image:var(--gradient-flare-subtle)] sm:aspect-[4/3]">
                  <Image
                    src={thumbnailUrl}
                    alt={title}
                    width={800}
                    height={600}
                    className="h-full w-full object-cover"
                    unoptimized={thumbnailUrl.startsWith("http") && !thumbnailUrl.includes("placehold")}
                  />
                </div>
                <div>
                  <h1 className="text-section-title text-[var(--foreground)]">
                    {title}
                  </h1>
                  <p className="mt-2 text-body-lg text-zinc-600">
                    One-time payment · Instant access
                  </p>
                  <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
                    {priceFormatted}
                  </p>
                </div>
              </div>
              <div className="lg:sticky lg:top-24">
                <Suspense fallback={<div className="rounded-[10px] bg-zinc-100 border border-zinc-200 p-8 text-center text-zinc-500">Loading checkout…</div>}>
                  <CheckoutGate
                    courseSlug={course.slug}
                    paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}
                    courseTitle={title}
                    priceFormatted={priceFormatted}
                    returnTo={`/courses/${slug}`}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200 bg-white py-14 px-4 sm:px-6 sm:py-20 lg:py-[120px]">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-section-title text-[var(--foreground)]">
              About This Course
            </h2>
            <div className="mt-8 space-y-6 text-body-lg text-zinc-600 leading-relaxed">
              {course.short_description && (
                <p>{course.short_description}</p>
              )}
              {course.instructor_name && (
                <p className="text-[var(--foreground)] font-medium">
                  Taught by {course.instructor_name}.
                </p>
              )}
              {course.sales_page_content && (
                <div
                  className="prose prose-zinc max-w-none mt-8"
                  dangerouslySetInnerHTML={{ __html: course.sales_page_content }}
                />
              )}
              <h3 className="text-card-title text-[var(--foreground)] mt-10">
                What&apos;s included
              </h3>
              <ul className="space-y-3">
                {FALLBACK_INCLUDED.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-[var(--flare-support-1)]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
