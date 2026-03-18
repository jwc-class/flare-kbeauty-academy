import { redirect } from "next/navigation";

/**
 * Legacy route: 리드 목록(기존)은 Contacts로 통합되었습니다.
 * /admin/leads 접속 시 /admin/contacts로 리다이렉트합니다.
 */
export default function AdminLeadsRedirectPage() {
  redirect("/admin/contacts");
}
