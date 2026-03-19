import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-authorization";

/**
 * GET /api/auth/admin-status
 * Returns whether the current user (Bearer token) is an active admin.
 * Used by footer to conditionally show Admin link.
 */
export async function GET(req: Request) {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ isAdmin: false });
  }
  return NextResponse.json({
    isAdmin: true,
    role: admin.role,
    email: admin.email,
  });
}
