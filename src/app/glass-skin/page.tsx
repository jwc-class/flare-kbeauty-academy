import { getPublishedLandingPageBySlug } from "@/lib/public-content";
import GlassSkinContent from "@/components/GlassSkinContent";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const lp = await getPublishedLandingPageBySlug("glass-skin");
  return {
    title: lp?.title ? `${lp.title} | K Beauty Academy` : "The Korean Glass Skin Blueprint | K Beauty Academy",
    description: lp?.hero_subtitle?.slice(0, 160) || "Get the exact skincare routine used by Korean beauty influencers. Free guide—the Korean skincare system that actually works.",
  };
}

export default async function GlassSkinPage() {
  const landingPage = await getPublishedLandingPageBySlug("glass-skin");

  return <GlassSkinContent landingPage={landingPage} />;
}
