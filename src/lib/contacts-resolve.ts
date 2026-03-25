import type { SupabaseClient } from "@supabase/supabase-js";
import { escapeIlikeExact } from "@/lib/contact-email";

/**
 * 프로필 이메일과 동일한 주소를 가진 모든 contacts.id (제출마다 별도 행이 생길 수 있음).
 */
export async function listContactIdsForEmail(client: SupabaseClient, emailTrimmed: string): Promise<string[]> {
  const { data: rpcRows, error: rpcErr } = await client.rpc("contact_ids_for_email", {
    p_email: emailTrimmed,
  });
  if (!rpcErr && rpcRows != null) {
    const arr = Array.isArray(rpcRows) ? rpcRows : [rpcRows];
    const ids = arr.filter((x) => x != null && x !== "").map((x) => String(x));
    if (ids.length > 0) return [...new Set(ids)];
  }

  const target = emailTrimmed.trim().toLowerCase();
  const { data: rows } = await client.from("contacts").select("id, email").limit(15000);
  const out: string[] = [];
  for (const r of rows ?? []) {
    if (r.email?.trim().toLowerCase() === target) out.push(r.id);
  }
  return [...new Set(out)];
}

/**
 * DB RPC `match_contact_by_email` uses lower(trim(...)) so repeated submits with the same
 * address (any casing) reuse one contact. Falls back to REST if RPC is unavailable.
 */
export async function resolveContactIdByEmail(
  client: SupabaseClient,
  emailTrimmed: string
): Promise<string | null> {
  const { data: rpcId, error: rpcErr } = await client.rpc("match_contact_by_email", {
    p_email: emailTrimmed,
  });
  if (!rpcErr && rpcId != null && rpcId !== "") {
    return String(rpcId);
  }

  const canonical = emailTrimmed.toLowerCase();
  const { data: canonRows } = await client.from("contacts").select("id").eq("email", canonical).limit(1);
  if (canonRows?.[0]?.id) return canonRows[0].id;

  const { data: eqRows } = await client.from("contacts").select("id").eq("email", emailTrimmed).limit(1);
  if (eqRows?.[0]?.id) return eqRows[0].id;

  const { data: ilikeRows } = await client
    .from("contacts")
    .select("id")
    .ilike("email", escapeIlikeExact(emailTrimmed))
    .limit(1);
  return ilikeRows?.[0]?.id ?? null;
}

export async function fetchContactByEmail(client: SupabaseClient, emailTrimmed: string) {
  const id = await resolveContactIdByEmail(client, emailTrimmed);
  if (!id) return null;
  const { data } = await client.from("contacts").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}
