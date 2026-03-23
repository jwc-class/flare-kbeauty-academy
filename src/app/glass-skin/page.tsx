import { getPublishedLandingPageBySlug } from "@/lib/public-content";
import GlassSkinContent from "@/components/GlassSkinContent";
import {
  GLASS_SKIN_DOCUMENT_TITLE,
  GLASS_SKIN_META_DESCRIPTION,
  GLASS_SKIN_USE_CODE_HERO_COPY,
} from "@/lib/glass-skin-copy";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const lp = await getPublishedLandingPageBySlug("glass-skin");
  if (GLASS_SKIN_USE_CODE_HERO_COPY) {
    return {
      title: GLASS_SKIN_DOCUMENT_TITLE,
      description: GLASS_SKIN_META_DESCRIPTION,
    };
  }
  return {
    title: lp?.title ? `${lp.title} | K Beauty Academy` : GLASS_SKIN_DOCUMENT_TITLE,
    description: lp?.hero_subtitle?.slice(0, 160) || GLASS_SKIN_META_DESCRIPTION,
  };
}

export default async function GlassSkinPage() {
  const landingPage = await getPublishedLandingPageBySlug("glass-skin");

  return (
    <GlassSkinContent
      landingPage={landingPage}
      useCodeHeroCopy={GLASS_SKIN_USE_CODE_HERO_COPY}
    />
  );
}
