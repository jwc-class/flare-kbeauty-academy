import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Korean Glass Skin Blueprint | K Beauty Academy",
  description:
    "Get the exact skincare routine used by Korean beauty influencers. Free guide—the Korean skincare system that actually works.",
};

export default function GlassSkinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
