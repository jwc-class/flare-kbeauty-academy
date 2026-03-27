import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Grant or refresh course access after a completed purchase (service role).
 */
export async function grantEnrollmentForPurchase(
  supabaseAdmin: SupabaseClient,
  profileId: string,
  courseId: string,
  purchaseId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("enrollments").upsert(
    {
      profile_id: profileId,
      course_id: courseId,
      purchase_id: purchaseId,
      status: "active",
      source: "purchase",
      granted_by_profile_id: null,
      granted_at: now,
      updated_at: now,
    },
    { onConflict: "profile_id,course_id" }
  );

  if (error) {
    console.error("[enrollments] upsert failed", error.message);
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

/**
 * Admin-granted access. Preserves purchase_id when reactivating a row that came from checkout.
 */
export async function grantManualEnrollment(
  supabaseAdmin: SupabaseClient,
  profileId: string,
  courseId: string,
  grantedByProfileId: string
): Promise<{ ok: true; alreadyActive?: boolean } | { ok: false; message: string }> {
  const now = new Date().toISOString();

  const { data: existing, error: readErr } = await supabaseAdmin
    .from("enrollments")
    .select("id, status, purchase_id")
    .eq("profile_id", profileId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (readErr) {
    console.error("[enrollments] read failed", readErr.message);
    return { ok: false, message: readErr.message };
  }

  if (existing?.status === "active") {
    return { ok: true, alreadyActive: true };
  }

  if (existing?.id) {
    const { error } = await supabaseAdmin
      .from("enrollments")
      .update({
        status: "active",
        source: "manual",
        granted_by_profile_id: grantedByProfileId,
        granted_at: now,
        updated_at: now,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("[enrollments] manual update failed", error.message);
      return { ok: false, message: error.message };
    }
    return { ok: true };
  }

  const { error } = await supabaseAdmin.from("enrollments").insert({
    profile_id: profileId,
    course_id: courseId,
    purchase_id: null,
    status: "active",
    source: "manual",
    granted_by_profile_id: grantedByProfileId,
    granted_at: now,
    updated_at: now,
  });

  if (error) {
    console.error("[enrollments] manual insert failed", error.message);
    return { ok: false, message: error.message };
  }
  return { ok: true };
}