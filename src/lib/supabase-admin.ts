import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _instance: SupabaseClient | null = null;

/**
 * 서버 전용 Admin 클라이언트.
 * 매 요청 시점(런타임)에 환경 변수를 읽어 생성하므로 Vercel 등에서 동작합니다.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (typeof window !== "undefined") return null;
  if (_instance) return _instance;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  _instance = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return _instance;
}
