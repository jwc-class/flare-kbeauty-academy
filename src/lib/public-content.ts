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
  primary_course_id: string | null;
  offer_page_id: string | null;
  channel: string | null;
  status: string;
  primary_course?: PublicCourse | null;
  offer_page?: PublicOfferPage | null;
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

export type PublicOfferPage = {
  id: string;
  title: string;
  slug: string;
  headline: string | null;
  subheadline: string | null;
  body: string | null;
  cta_text: string | null;
  course_id: string | null;
  status: string;
  course?: PublicCourse | null;
};

/**
 * Fetch a published landing page by slug with related course/offer page.
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
      primary_course_id, offer_page_id, channel, status,
      courses(id, title, slug, thumbnail_url, price, currency, short_description, sales_page_content, instructor_name, status, paypal_link),
      offer_pages(id, title, slug, headline, subheadline, body, cta_text, course_id, status)
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const primary_course = (Array.isArray(row.courses) ? row.courses[0] : row.courses) as PublicCourse | undefined;
  const offer_page = (Array.isArray(row.offer_pages) ? row.offer_pages[0] : row.offer_pages) as PublicOfferPage | undefined;
  return {
    ...row,
    primary_course: primary_course ?? null,
    offer_page: offer_page ?? null,
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
 * Fetch one published course by slug (e.g. for thank-you page CTA).
 * Returns null if not found.
 */
export async function getPublishedCourseForThankYou(
  slug: string = "glass-skin-masterclass"
): Promise<PublicCourse | null> {
  return getPublishedCourseBySlug(slug);
}

/**
 * Fetch a published offer page by slug with linked course.
 * Returns null if not found or not published.
 */
export async function getPublishedOfferPageBySlug(
  slug: string
): Promise<PublicOfferPage | null> {
  const { data, error } = await supabase
    .from("offer_pages")
    .select(
      `
      id, title, slug, headline, subheadline, body, cta_text, course_id, status,
      courses(id, title, slug, thumbnail_url, price, currency, short_description, sales_page_content, instructor_name, status, paypal_link)
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const course = (Array.isArray(row.courses) ? row.courses[0] : row.courses) as PublicCourse | undefined;
  return {
    ...row,
    course: course ?? null,
  } as PublicOfferPage;
}
