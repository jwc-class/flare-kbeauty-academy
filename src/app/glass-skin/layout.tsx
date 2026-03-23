import type { Metadata } from "next";
import {
  GLASS_SKIN_DOCUMENT_TITLE,
  GLASS_SKIN_META_DESCRIPTION,
} from "@/lib/glass-skin-copy";

export const metadata: Metadata = {
  title: GLASS_SKIN_DOCUMENT_TITLE,
  description: GLASS_SKIN_META_DESCRIPTION,
};

export default function GlassSkinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
