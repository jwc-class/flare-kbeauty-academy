import { getPublishedLandingPageBySlug } from "@/lib/public-content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GlassSkinContent from "@/components/GlassSkinContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lp = await getPublishedLandingPageBySlug(slug);
  if (!lp) return { title: "Landing Page | K Beauty Academy" };
  return {
    title: lp.title ? `${lp.title} | K Beauty Academy` : "K Beauty Academy",
    description: lp.hero_subtitle?.slice(0, 160) || undefined,
  };
}

export default async function PublicLandingPageBySlug({ params }: Props) {
  const { slug } = await params;
  const landingPage = await getPublishedLandingPageBySlug(slug);

  if (!landingPage) {
    notFound();
  }

  return <GlassSkinContent landingPage={landingPage} />;
}
