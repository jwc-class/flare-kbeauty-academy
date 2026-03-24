import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedLeadMagnetBySlug } from "@/lib/public-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lm = await getPublishedLeadMagnetBySlug(slug);
  if (!lm) return { title: "Lead Magnet | K Beauty Academy" };
  return {
    title: `${lm.title} | K Beauty Academy`,
    description: lm.subtitle?.slice(0, 160) || lm.description?.slice(0, 160) || undefined,
  };
}

export default async function LeadMagnetPage({ params }: Props) {
  const { slug } = await params;
  const lm = await getPublishedLeadMagnetBySlug(slug);
  if (!lm) notFound();

  const fileHref = lm.file_url?.trim() || lm.thumbnail_url?.trim() || null;
  const buttonLabel =
    lm.delivery_type?.toLowerCase().includes("pdf") ? "Download PDF" : "Open Resource";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>
        <section className="px-4 pb-24 pt-40 sm:px-6">
          <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-body font-medium text-[var(--muted)]">Free Lead Magnet</p>
              <h1 className="mt-4 text-section-title text-[var(--foreground)]">{lm.title}</h1>
              {lm.subtitle && (
                <p className="mt-6 text-body-lg text-zinc-600">{lm.subtitle}</p>
              )}
              {lm.description && (
                <p className="mt-5 text-body text-zinc-600 leading-relaxed">{lm.description}</p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {fileHref ? (
                  <a
                    href={fileHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cta"
                  >
                    {buttonLabel}
                  </a>
                ) : (
                  <button type="button" disabled className="btn-cta opacity-60 cursor-not-allowed">
                    Resource not available
                  </button>
                )}
                <Link
                  href="/"
                  className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50"
                >
                  Back to Home
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-soft">
              {lm.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lm.thumbnail_url}
                  alt={lm.title}
                  className="h-auto w-full rounded-xl object-contain"
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl bg-[var(--background-alt)] text-[var(--muted)]">
                  No preview image
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
