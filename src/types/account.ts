export type AccountPurchaseRow = {
  id: string;
  amount: number;
  currency: string;
  purchased_at: string;
  external_order_id: string | null;
  payment_provider: string | null;
  course_title: string | null;
  course_slug: string | null;
};