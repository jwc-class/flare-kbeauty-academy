/**
 * Admin foundation – data types for contacts, lead magnets, courses, landing pages, lead submissions, purchases.
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

export type LeadMagnet = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  delivery_type: string | null;
  status: string;
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
  created_at: string;
  updated_at: string;
};

export type LandingPage = {
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
  created_at: string;
  updated_at: string;
};

export type LeadSubmission = {
  id: string;
  contact_id: string;
  landing_page_id: string | null;
  lead_magnet_id: string | null;
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
  lead_magnet?: LeadMagnet | null;
  primary_course?: Course | null;
};

export type PurchaseWithRelations = Purchase & {
  contact?: Contact | null;
  course?: Course | null;
};
