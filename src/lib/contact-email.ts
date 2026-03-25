/**
 * Escape %, _, \ for PostgREST `ilike` when matching the full email (case-insensitive, no wildcards).
 */
export function escapeIlikeExact(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
