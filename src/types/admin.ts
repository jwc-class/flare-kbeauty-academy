/**
 * Admin foundation – data types for contacts, courses, landing pages, offer pages, submissions, purchases.
 * Prompt 2: extend with validation schemas, API DTOs, or form state types as needed.
 */

export type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_country_code: string | null;
  phone_number: string | null;
  marketing_consent: boolean;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type Course = {
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
  purchases_count?: number;
  revenue?: number;
  created_at: string;
  updated_at: string;
};

export type LandingPage = {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  cta_text: string | null;
  primary_course_id: string | null;
  offer_page_id: string | null;
  channel: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type OfferPage = {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  headline: string | null;
  subheadline: string | null;
  body: string | null;
  cta_text: string | null;
  course_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type LeadSubmission = {
  id: string;
  contact_id: string;
  landing_page_id: string | null;
  submitted_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
};

export type Purchase = {
  id: string;
  contact_id: string;
  course_id: string;
  amount: number;
  currency: string;
  payment_provider: string | null;
  payment_status: string | null;
  external_order_id: string | null;
  purchased_at: string;
};

/** Optional relations for list views (Prompt 2: expand with joins) */
export type LandingPageWithRelations = LandingPage & {
  primary_course?: Course | null;
  offer_page?: OfferPage | null;
};

export type PurchaseWithRelations = Purchase & {
  contact?: Contact | null;
  course?: Course | null;
};
