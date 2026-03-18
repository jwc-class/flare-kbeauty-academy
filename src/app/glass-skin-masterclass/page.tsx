import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PayPalAdvancedCheckout from "@/components/PayPalAdvancedCheckout";
import { getPublishedCourseBySlug } from "@/lib/public-content";

const DEFAULT_TITLE = "K-Beauty Glass Skin Masterclass";
const DEFAULT_DESCRIPTION = "Learn the complete Korean skincare routine for clear, glass-like skin. One-time payment, instant access. Pay with PayPal or card.";
const DEFAULT_IMAGE = "https://placehold.co/800x600/FAF9F6/1a1a1a?text=Glass+Skin+Masterclass";
const FALLBACK_ABOUT = [
  "The K-Beauty Glass Skin Masterclass is a complete video training that shows you the exact Korean skincare routine used to achieve clear, glowing, glass-like skin. Instead of guessing which products to use or in what order, you'll follow the same system Korean beauty experts and influencers use.",
  "You'll learn the correct layering order, the hydration technique behind the \"glass skin\" look, and the biggest mistakes to avoid. The course is taught by real Korean beauty professionals and is designed so you can apply everything step by step at home.",
];
const FALLBACK_INCLUDED = [
  "The exact Korean skincare order (step-by-step)",
  "How to layer products properly",
  "The hydration technique behind glass skin",
  "The biggest skincare mistakes foreigners make",
  "The real philosophy behind Korean beauty",
  "Lifetime access to all course materials",
];

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

export async function generateMetadata() {
  const course = await getPublishedCourseBySlug("glass-skin-masterclass");
  return {
    title: course?.title ? `${course.title} | K Beauty Academy` : "K-Beauty Glass Skin Masterclass | K Beauty Academy",
    description: course?.short_description?.slice(0, 160) || DEFAULT_DESCRIPTION,
  };
}

export default async function GlassSkinMasterclassPage() {
  const course = await getPublishedCourseBySlug("glass-skin-masterclass");

  const title = course?.title || DEFAULT_TITLE;
  const priceFormatted = course ? formatPrice(course.currency, course.price) : "$199";
  const thumbnailUrl = course?.thumbnail_url || DEFAULT_IMAGE;
  const aboutParagraphs = course?.short_description
    ? [course.short_description]
    : FALLBACK_ABOUT;
  const instructor = course?.instructor_name ? `Taught by ${course.instructor_name}.` : null;
  const salesPageContent = course?.sales_page_content;

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
                <PayPalAdvancedCheckout courseSlug="glass-skin-masterclass" />
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
              {aboutParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {instructor && (
                <p className="text-[var(--foreground)] font-medium">{instructor}</p>
              )}
              {salesPageContent && (
                <div
                  className="prose prose-zinc max-w-none mt-8"
                  dangerouslySetInnerHTML={{ __html: salesPageContent }}
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
