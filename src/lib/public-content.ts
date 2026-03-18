/**
 * Public content loaders for the marketing site.
 * Uses the anon Supabase client so RLS applies: only status = 'published' rows are readable.
 * Use from Server Components or server-side only.
 */

import { supabase } from "@/lib/supabase";

export type PublicLandingPage = {
  id: string;
  title: string;
  slug: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  cta_text: string | null;
  lead_magnet_id: string | null;
  primary_course_id: string | null;
  channel: string | null;
  status: string;
  lead_magnet?: PublicLeadMagnet | null;
  primary_course?: PublicCourse | null;
};

export type PublicLeadMagnet = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  delivery_type: string | null;
  status: string;
};

export type PublicCourse = {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  price: number;
  currency: string;
  short_description: string | null;
  sales_page_content: string | null;
  instructor_name: string | null;
  status: string;
  paypal_link: string | null;
};

/**
 * Fetch a published landing page by slug with related lead_magnet and course.
 * Returns null if not found or not published.
 */
export async function getPublishedLandingPageBySlug(
  slug: string
): Promise<PublicLandingPage | null> {
  const { data, error } = await supabase
    .from("landing_pages")
    .select(
      `
      id, title, slug, hero_title, hero_subtitle, cta_text,
      lead_magnet_id, primary_course_id, channel, status,
      lead_magnets(id, title, slug, subtitle, description, thumbnail_url, file_url, delivery_type, status),
      courses(id, title, slug, thumbnail_url, price, currency, short_description, sales_page_content, instructor_name, status, paypal_link)
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const lead_magnet = (Array.isArray(row.lead_magnets) ? row.lead_magnets[0] : row.lead_magnets) as PublicLeadMagnet | undefined;
  const primary_course = (Array.isArray(row.courses) ? row.courses[0] : row.courses) as PublicCourse | undefined;
  return {
    ...row,
    lead_magnet: lead_magnet ?? null,
    primary_course: primary_course ?? null,
  } as PublicLandingPage;
}

/**
 * Fetch a published course by slug.
 * Returns null if not found or not published.
 */
export async function getPublishedCourseBySlug(
  slug: string
): Promise<PublicCourse | null> {
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, title, slug, thumbnail_url, price, currency, short_description, sales_page_content, instructor_name, status, paypal_link"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return data as PublicCourse;
}

/**
 * Fetch a published lead magnet by id.
 * Returns null if not found or not published.
 */
export async function getPublishedLeadMagnetById(
  id: string
): Promise<PublicLeadMagnet | null> {
  const { data, error } = await supabase
    .from("lead_magnets")
    .select("id, title, slug, subtitle, description, thumbnail_url, file_url, delivery_type, status")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return data as PublicLeadMagnet;
}

/**
 * Fetch one published course by slug (e.g. for thank-you page CTA).
 * Returns null if not found.
 */
export async function getPublishedCourseForThankYou(
  slug: string = "glass-skin-masterclass"
): Promise<PublicCourse | null> {
  return getPublishedCourseBySlug(slug);
}
