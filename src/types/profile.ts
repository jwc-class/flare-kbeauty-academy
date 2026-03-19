/**
 * Member profile (public.profiles). One per Supabase Auth user.
 */

export type Profile = {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};
